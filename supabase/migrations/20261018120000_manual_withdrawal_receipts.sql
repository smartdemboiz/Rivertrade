alter table public.withdrawals
  add column if not exists network text,
  add column if not exists destination_details jsonb not null default '{}'::jsonb,
  add column if not exists asset text;

alter table public.transactions
  add column if not exists withdrawal_id uuid references public.withdrawals(id) on delete restrict;

create unique index if not exists transactions_withdrawal_id_unique
  on public.transactions (withdrawal_id)
  where withdrawal_id is not null;

alter table public.user_funds
  add column if not exists withdrawal_id uuid references public.withdrawals(id) on delete restrict;

create unique index if not exists user_funds_withdrawal_id_unique
  on public.user_funds (withdrawal_id)
  where withdrawal_id is not null;

create or replace function public.create_withdrawal_request(
  p_user_id uuid,
  p_amount numeric,
  p_currency text,
  p_method text,
  p_asset text,
  p_network text,
  p_destination_details jsonb
)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  account_currency text;
  available_amount numeric;
  withdrawal_row public.withdrawals%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to submit withdrawal requests' using errcode = '42501';
  end if;

  if p_user_id is null or p_amount is null or p_amount <= 0
    or nullif(trim(p_method), '') is null
    or nullif(trim(p_currency), '') is null
    or jsonb_typeof(coalesce(p_destination_details, '{}'::jsonb)) <> 'object'
    or coalesce(p_destination_details, '{}'::jsonb) = '{}'::jsonb then
    raise exception 'A valid withdrawal amount, currency, method, and payout destination are required' using errcode = '22023';
  end if;

  select upper(trim(coalesce(currency, 'USD')))
  into account_currency
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Customer account not found' using errcode = 'P0002';
  end if;

  if account_currency <> upper(trim(p_currency)) then
    raise exception 'Withdrawal currency does not match the customer account currency' using errcode = '22023';
  end if;

  select coalesce(sum(case
    when type in ('withdrawal', 'investment') then -balance
    when type in ('deposit', 'bonus', 'investment_refund') then balance
    else 0
  end), 0)
  into available_amount
  from public.user_funds
  where user_id = p_user_id
    and status = 'available'
    and upper(trim(coalesce(currency, ''))) = account_currency;

  if p_amount > available_amount then
    raise exception 'Withdrawal amount exceeds the available account balance' using errcode = '22023';
  end if;

  insert into public.withdrawals (
    user_id, amount, currency, method, asset, network, destination_details, status
  )
  values (
    p_user_id, p_amount, account_currency, trim(p_method),
    nullif(trim(coalesce(p_asset, '')), ''),
    nullif(trim(coalesce(p_network, '')), ''),
    coalesce(p_destination_details, '{}'::jsonb),
    'pending'
  )
  returning * into withdrawal_row;

  insert into public.user_funds (user_id, balance, type, status, withdrawal_id, currency)
  values (withdrawal_row.user_id, withdrawal_row.amount, 'withdrawal', 'available', withdrawal_row.id, withdrawal_row.currency);

  return withdrawal_row;
end;
$$;

revoke all on function public.create_withdrawal_request(uuid, numeric, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_withdrawal_request(uuid, numeric, text, text, text, text, jsonb) to service_role;

insert into public.user_funds (user_id, balance, type, status, withdrawal_id, currency)
select user_id, amount, 'withdrawal', 'available', id, currency
from public.withdrawals
where status in ('pending', 'processing', 'approved')
  and user_id is not null
  and amount > 0
  and nullif(trim(currency), '') is not null
on conflict (withdrawal_id) where withdrawal_id is not null
do nothing;

create or replace function public.confirm_withdrawal_payout(p_withdrawal_id uuid)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal_row public.withdrawals%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to confirm withdrawal payouts' using errcode = '42501';
  end if;

  select *
  into withdrawal_row
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal request not found' using errcode = 'P0002';
  end if;

  if withdrawal_row.status = 'rejected' then
    raise exception 'A rejected withdrawal cannot be paid' using errcode = '22023';
  end if;

  if withdrawal_row.user_id is null or withdrawal_row.amount is null or withdrawal_row.amount <= 0
    or nullif(trim(withdrawal_row.currency), '') is null then
    raise exception 'Withdrawal is missing a valid customer, amount, or currency' using errcode = '22023';
  end if;

  if jsonb_typeof(withdrawal_row.destination_details) <> 'object'
    or withdrawal_row.destination_details = '{}'::jsonb then
    raise exception 'Withdrawal payout details are missing' using errcode = '22023';
  end if;

  update public.withdrawals
  set status = 'approved', updated_at = now()
  where id = p_withdrawal_id
  returning * into withdrawal_row;

  insert into public.transactions (user_id, amount, type, status, currency, withdrawal_id)
  values (withdrawal_row.user_id, withdrawal_row.amount, 'withdrawal', 'completed', withdrawal_row.currency, withdrawal_row.id)
  on conflict (withdrawal_id) where withdrawal_id is not null
  do update set amount = excluded.amount, status = excluded.status, currency = excluded.currency, updated_at = now();

  insert into public.user_funds (user_id, balance, type, status, withdrawal_id, currency)
  values (withdrawal_row.user_id, withdrawal_row.amount, 'withdrawal', 'available', withdrawal_row.id, withdrawal_row.currency)
  on conflict (withdrawal_id) where withdrawal_id is not null
  do nothing;

  return withdrawal_row;
end;
$$;

revoke all on function public.confirm_withdrawal_payout(uuid) from public, anon, authenticated;
grant execute on function public.confirm_withdrawal_payout(uuid) to service_role;

create or replace function public.reject_withdrawal_request(p_withdrawal_id uuid)
returns public.withdrawals
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal_row public.withdrawals%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to reject withdrawal requests' using errcode = '42501';
  end if;

  select *
  into withdrawal_row
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal request not found' using errcode = 'P0002';
  end if;

  if withdrawal_row.status = 'approved' then
    raise exception 'An approved withdrawal cannot be rejected' using errcode = '22023';
  end if;

  if withdrawal_row.status = 'rejected' then
    return withdrawal_row;
  end if;

  update public.withdrawals
  set status = 'rejected', updated_at = now()
  where id = p_withdrawal_id
  returning * into withdrawal_row;

  update public.user_funds
  set status = 'failed', updated_at = now()
  where withdrawal_id = p_withdrawal_id
    and type = 'withdrawal';

  return withdrawal_row;
end;
$$;

revoke all on function public.reject_withdrawal_request(uuid) from public, anon, authenticated;
grant execute on function public.reject_withdrawal_request(uuid) to service_role;
