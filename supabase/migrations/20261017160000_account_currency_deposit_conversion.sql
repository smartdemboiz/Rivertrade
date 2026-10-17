alter table public.deposits
  add column if not exists credited_amount numeric check (credited_amount is null or credited_amount > 0),
  add column if not exists credited_currency text,
  add column if not exists exchange_rate numeric check (exchange_rate is null or exchange_rate > 0),
  add column if not exists exchange_rate_quoted_at timestamptz;

update public.deposits as deposit_row
set credited_amount = fund.balance,
    credited_currency = fund.currency,
    exchange_rate = case
      when deposit_row.amount > 0 then fund.balance / deposit_row.amount
      else null
    end,
    exchange_rate_quoted_at = null
from public.user_funds as fund
where fund.deposit_id = deposit_row.id
  and deposit_row.credited_amount is null;

drop function if exists public.confirm_deposit(uuid);
drop function if exists public.confirm_deposit(uuid, numeric);

create or replace function public.confirm_deposit(
  p_deposit_id uuid,
  p_credited_amount numeric,
  p_credited_currency text,
  p_exchange_rate numeric,
  p_exchange_rate_quoted_at timestamptz
)
returns public.deposits
language plpgsql
security definer
set search_path = public
as $$
declare
  deposit_row public.deposits%rowtype;
  existing_fund public.user_funds%rowtype;
  has_existing_fund boolean := false;
  credit_amount numeric := p_credited_amount;
  credit_currency text := upper(trim(coalesce(p_credited_currency, '')));
  applied_rate numeric := p_exchange_rate;
  quoted_at timestamptz := p_exchange_rate_quoted_at;
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
  has_existing_fund := found;

  if has_existing_fund then
    credit_amount := existing_fund.balance;
    credit_currency := upper(trim(coalesce(existing_fund.currency, '')));
    applied_rate := coalesce(
      deposit_row.exchange_rate,
      existing_fund.balance / deposit_row.amount
    );
    quoted_at := deposit_row.exchange_rate_quoted_at;
    if deposit_row.credited_amount is not null
      and (deposit_row.credited_amount <> credit_amount
        or upper(coalesce(deposit_row.credited_currency, '')) <> credit_currency) then
      raise exception 'Stored deposit credit does not match its available-funds record' using errcode = '22023';
    end if;
  elsif credit_amount is null
    or credit_amount <= 0
    or credit_currency = ''
    or applied_rate is null
    or applied_rate <= 0
    or quoted_at is null then
    raise exception 'A valid converted amount, currency, rate, and quote time are required' using errcode = '22023';
  end if;

  update public.deposits
  set status = 'confirmed',
      credited_amount = credit_amount,
      credited_currency = credit_currency,
      exchange_rate = applied_rate,
      exchange_rate_quoted_at = quoted_at,
      updated_at = now()
  where id = p_deposit_id
  returning * into deposit_row;

  insert into public.transactions (user_id, amount, type, status, currency, deposit_id)
  values (deposit_row.user_id, credit_amount, 'deposit', 'completed', credit_currency, deposit_row.id)
  on conflict (deposit_id) where deposit_id is not null
  do update set
    amount = excluded.amount,
    status = excluded.status,
    currency = excluded.currency,
    updated_at = now();

  insert into public.user_funds (user_id, balance, type, status, deposit_id, currency)
  values (deposit_row.user_id, credit_amount, 'deposit', 'available', deposit_row.id, credit_currency)
  on conflict (deposit_id) where deposit_id is not null
  do nothing;

  return deposit_row;
end;
$$;

revoke all on function public.confirm_deposit(uuid, numeric, text, numeric, timestamptz) from public, anon, authenticated;
grant execute on function public.confirm_deposit(uuid, numeric, text, numeric, timestamptz) to service_role;
