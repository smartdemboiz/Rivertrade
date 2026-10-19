alter table public.profit_history
  add column if not exists currency text,
  add column if not exists admin_request_id uuid;

alter table public.user_funds
  add column if not exists profit_history_id uuid references public.profit_history(id) on delete restrict;

alter table public.transactions
  add column if not exists profit_history_id uuid references public.profit_history(id) on delete restrict;

create unique index if not exists user_funds_profit_history_id_unique
  on public.user_funds (profit_history_id)
  where profit_history_id is not null;

create unique index if not exists transactions_profit_history_id_unique
  on public.transactions (profit_history_id)
  where profit_history_id is not null;

create unique index if not exists profit_history_admin_request_id_unique
  on public.profit_history (admin_request_id)
  where admin_request_id is not null;

update public.profit_history as profit
set currency = upper(trim(coalesce(profile.currency, 'USD')))
from public.profiles as profile
where profile.id = profit.user_id
  and nullif(trim(coalesce(profit.currency, '')), '') is null;

create or replace function public.credit_investment_profit(
  p_user_id uuid,
  p_amount numeric,
  p_period text,
  p_request_id uuid
)
returns public.profit_history
language plpgsql
security definer
set search_path = public
as $$
declare
  account_currency text;
  account_role text;
  profit_row public.profit_history%rowtype;
  inserted_profit boolean;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to credit investment profit' using errcode = '42501';
  end if;

  if p_user_id is null or p_amount is null or p_amount <= 0
    or p_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_request_id is null
    or nullif(trim(p_period), '') is null
    or length(trim(p_period)) > 80 then
    raise exception 'A customer, positive profit amount, and valid period are required' using errcode = '22023';
  end if;

  select upper(coalesce(nullif(trim(currency), ''), 'USD')), coalesce(role, 'customer')
  into account_currency, account_role
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Customer account not found' using errcode = 'P0002';
  end if;

  if account_role <> 'customer' then
    raise exception 'Investment profit can only be credited to customer accounts' using errcode = '22023';
  end if;

  insert into public.profit_history (user_id, period, profit, currency, status, admin_request_id)
  values (p_user_id, trim(p_period), p_amount, account_currency, 'settled', p_request_id)
  on conflict (admin_request_id) where admin_request_id is not null
  do nothing
  returning * into profit_row;

  inserted_profit := found;
  if not inserted_profit then
    select *
    into profit_row
    from public.profit_history
    where admin_request_id = p_request_id
    for update;

    if not found then
      raise exception 'Unable to verify the prior profit credit request' using errcode = 'P0001';
    end if;

    if profit_row.user_id <> p_user_id
      or profit_row.profit <> p_amount
      or profit_row.period <> trim(p_period) then
      raise exception 'Profit credit request ID was already used for different details' using errcode = '22023';
    end if;

    return profit_row;
  end if;

  insert into public.user_funds (user_id, balance, type, status, currency, profit_history_id)
  values (p_user_id, p_amount, 'bonus', 'available', account_currency, profit_row.id);

  insert into public.transactions (user_id, amount, type, status, currency, profit_history_id)
  values (p_user_id, p_amount, 'bonus', 'completed', account_currency, profit_row.id);

  return profit_row;
end;
$$;

revoke all on function public.credit_investment_profit(uuid, numeric, text, uuid) from public, anon, authenticated;
grant execute on function public.credit_investment_profit(uuid, numeric, text, uuid) to service_role;

create or replace function public.settle_profit_history(p_profit_history_id uuid)
returns public.profit_history
language plpgsql
security definer
set search_path = public
as $$
declare
  profit_row public.profit_history%rowtype;
  account_currency text;
  account_role text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to settle investment profit' using errcode = '42501';
  end if;

  select *
  into profit_row
  from public.profit_history
  where id = p_profit_history_id
  for update;

  if not found then
    raise exception 'Profit record not found' using errcode = 'P0002';
  end if;

  if profit_row.user_id is null or profit_row.profit is null or profit_row.profit <= 0
    or profit_row.profit::text in ('NaN', 'Infinity', '-Infinity') then
    raise exception 'Profit record is missing a valid customer or amount' using errcode = '22023';
  end if;

  if profit_row.status not in ('pending', 'settled') then
    raise exception 'Profit record cannot be settled from its current status' using errcode = '22023';
  end if;

  select upper(coalesce(nullif(trim(currency), ''), 'USD')), coalesce(role, 'customer')
  into account_currency, account_role
  from public.profiles
  where id = profit_row.user_id
  for update;

  if not found then
    raise exception 'Customer account not found' using errcode = 'P0002';
  end if;

  if account_role <> 'customer' then
    raise exception 'Investment profit can only be credited to customer accounts' using errcode = '22023';
  end if;

  account_currency := upper(coalesce(nullif(trim(profit_row.currency), ''), account_currency));

  update public.profit_history
  set status = 'settled',
      currency = account_currency,
      updated_at = now()
  where id = profit_row.id
  returning * into profit_row;

  insert into public.user_funds (user_id, balance, type, status, currency, profit_history_id)
  values (profit_row.user_id, profit_row.profit, 'bonus', 'available', account_currency, profit_row.id)
  on conflict (profit_history_id) where profit_history_id is not null
  do nothing;

  insert into public.transactions (user_id, amount, type, status, currency, profit_history_id)
  values (profit_row.user_id, profit_row.profit, 'bonus', 'completed', account_currency, profit_row.id)
  on conflict (profit_history_id) where profit_history_id is not null
  do nothing;

  return profit_row;
end;
$$;

revoke all on function public.settle_profit_history(uuid) from public, anon, authenticated;
grant execute on function public.settle_profit_history(uuid) to service_role;
