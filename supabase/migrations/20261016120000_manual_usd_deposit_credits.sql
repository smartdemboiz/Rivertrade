alter table public.deposits
  add column if not exists credit_amount_usd numeric
  check (credit_amount_usd is null or credit_amount_usd > 0);

alter table public.transactions
  add column if not exists currency text,
  add column if not exists deposit_id uuid references public.deposits(id) on delete restrict;

alter table public.user_funds
  add column if not exists deposit_id uuid references public.deposits(id) on delete restrict,
  add column if not exists currency text;

create unique index if not exists transactions_deposit_id_unique
  on public.transactions(deposit_id)
  where deposit_id is not null;

create unique index if not exists user_funds_deposit_id_unique
  on public.user_funds(deposit_id)
  where deposit_id is not null;

with ranked_deposits as (
  select
    id,
    user_id,
    amount,
    currency,
    row_number() over (partition by user_id, amount order by created_at, id) as occurrence
  from public.deposits
  where status = 'confirmed'
),
ranked_transactions as (
  select
    id,
    user_id,
    amount,
    row_number() over (partition by user_id, amount order by created_at, id) as occurrence
  from public.transactions
  where type = 'deposit'
    and status = 'completed'
    and deposit_id is null
),
matches as (
  select transaction_row.id as transaction_id, deposit_row.id as deposit_id, deposit_row.currency
  from ranked_transactions transaction_row
  join ranked_deposits deposit_row
    on deposit_row.user_id = transaction_row.user_id
    and deposit_row.amount = transaction_row.amount
    and deposit_row.occurrence = transaction_row.occurrence
)
update public.transactions transaction_row
set deposit_id = matches.deposit_id,
    currency = coalesce(transaction_row.currency, matches.currency)
from matches
where transaction_row.id = matches.transaction_id;

create or replace function public.confirm_deposit(
  p_deposit_id uuid,
  p_credit_amount_usd numeric
)
returns public.deposits
language plpgsql
security definer
set search_path = public
as $$
declare
  deposit_row public.deposits%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to confirm deposits' using errcode = '42501';
  end if;

  if p_credit_amount_usd is null or p_credit_amount_usd <= 0 then
    raise exception 'USD credit must be greater than zero' using errcode = '22023';
  end if;

  select *
  into deposit_row
  from public.deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit request not found' using errcode = 'P0002';
  end if;

  if deposit_row.status = 'rejected' then
    raise exception 'A rejected deposit cannot be credited' using errcode = '22023';
  end if;

  if deposit_row.credit_amount_usd is not null
    and deposit_row.credit_amount_usd <> p_credit_amount_usd then
    raise exception 'This deposit already has a different USD credit amount' using errcode = '22023';
  end if;

  update public.deposits
  set status = 'confirmed',
      credit_amount_usd = p_credit_amount_usd,
      updated_at = now()
  where id = p_deposit_id
  returning * into deposit_row;

  insert into public.transactions (user_id, amount, type, status, currency, deposit_id)
  values (deposit_row.user_id, p_credit_amount_usd, 'deposit', 'completed', 'USD', deposit_row.id)
  on conflict (deposit_id) where deposit_id is not null
  do update set
    amount = excluded.amount,
    status = excluded.status,
    currency = excluded.currency,
    updated_at = now();

  insert into public.user_funds (user_id, balance, type, status, deposit_id, currency)
  values (deposit_row.user_id, p_credit_amount_usd, 'deposit', 'available', deposit_row.id, 'USD')
  on conflict (deposit_id) where deposit_id is not null
  do nothing;

  return deposit_row;
end;
$$;

revoke all on function public.confirm_deposit(uuid, numeric) from public, anon, authenticated;
grant execute on function public.confirm_deposit(uuid, numeric) to service_role;
