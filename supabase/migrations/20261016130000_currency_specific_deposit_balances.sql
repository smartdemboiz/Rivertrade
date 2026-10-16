drop function if exists public.confirm_deposit(uuid, numeric);

update public.transactions as transaction_row
set amount = deposit_row.amount,
    currency = deposit_row.currency
from public.deposits as deposit_row
where transaction_row.deposit_id = deposit_row.id
  and transaction_row.type = 'deposit'
  and deposit_row.currency is not null;

create or replace function public.confirm_deposit(p_deposit_id uuid)
returns public.deposits
language plpgsql
security definer
set search_path = public
as $$
declare
  deposit_row public.deposits%rowtype;
  existing_fund public.user_funds%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to confirm deposits' using errcode = '42501';
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

  if deposit_row.user_id is null
    or deposit_row.amount is null
    or deposit_row.amount <= 0
    or nullif(trim(deposit_row.currency), '') is null then
    raise exception 'Deposit is missing a valid customer, amount, or currency' using errcode = '22023';
  end if;

  select *
  into existing_fund
  from public.user_funds
  where deposit_id = deposit_row.id
  for update;

  if found and upper(coalesce(existing_fund.currency, '')) <> upper(deposit_row.currency) then
    raise exception 'This deposit is already credited in a different currency' using errcode = '22023';
  end if;

  update public.deposits
  set status = 'confirmed',
      updated_at = now()
  where id = p_deposit_id
  returning * into deposit_row;

  insert into public.transactions (user_id, amount, type, status, currency, deposit_id)
  values (deposit_row.user_id, deposit_row.amount, 'deposit', 'completed', deposit_row.currency, deposit_row.id)
  on conflict (deposit_id) where deposit_id is not null
  do update set
    amount = excluded.amount,
    status = excluded.status,
    currency = excluded.currency,
    updated_at = now();

  insert into public.user_funds (user_id, balance, type, status, deposit_id, currency)
  values (deposit_row.user_id, deposit_row.amount, 'deposit', 'available', deposit_row.id, deposit_row.currency)
  on conflict (deposit_id) where deposit_id is not null
  do nothing;

  return deposit_row;
end;
$$;

revoke all on function public.confirm_deposit(uuid) from public, anon, authenticated;
grant execute on function public.confirm_deposit(uuid) to service_role;
