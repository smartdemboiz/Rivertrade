alter table public.investments
  add column if not exists plan_id uuid references public.investment_plans(id) on delete set null,
  add column if not exists funding_currency text,
  add column if not exists funding_amount numeric,
  add column if not exists exchange_rate_usd numeric;

alter table public.user_funds
  add column if not exists investment_id uuid references public.investments(id) on delete restrict;

alter table public.transactions
  add column if not exists investment_id uuid references public.investments(id) on delete restrict;

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.user_funds'::regclass
      and contype = 'c'
      and lower(pg_get_constraintdef(oid)) like '%type%'
      and lower(pg_get_constraintdef(oid)) like '%deposit%'
  loop
    execute format('alter table public.user_funds drop constraint %I', constraint_row.conname);
  end loop;

  alter table public.user_funds
    add constraint user_funds_type_check
    check (type in ('deposit', 'withdrawal', 'bonus', 'investment', 'investment_refund'));

  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and contype = 'c'
      and lower(pg_get_constraintdef(oid)) like '%type%'
      and lower(pg_get_constraintdef(oid)) like '%deposit%'
  loop
    execute format('alter table public.transactions drop constraint %I', constraint_row.conname);
  end loop;

  alter table public.transactions
    add constraint transactions_type_check
    check (type in ('deposit', 'withdrawal', 'investment', 'investment_refund', 'bonus'));
end;
$$;

create table if not exists public.investment_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.investment_plans(id) on delete restrict,
  amount_usd numeric not null check (amount_usd > 0),
  funding_currency text not null,
  funding_amount numeric not null check (funding_amount > 0),
  exchange_rate_usd numeric not null check (exchange_rate_usd > 0),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.investment_quotes enable row level security;
revoke all on public.investment_quotes from public, anon, authenticated;
grant all on public.investment_quotes to service_role;

create index if not exists investment_quotes_user_expires_idx
  on public.investment_quotes(user_id, expires_at);

create unique index if not exists user_funds_investment_type_unique
  on public.user_funds(investment_id, type)
  where investment_id is not null;

create unique index if not exists transactions_investment_type_unique
  on public.transactions(investment_id, type)
  where investment_id is not null;

create or replace function public.create_funded_investment(
  p_quote_id uuid,
  p_user_id uuid
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  quote_row public.investment_quotes%rowtype;
  plan_row public.investment_plans%rowtype;
  investment_row public.investments%rowtype;
  available_balance numeric;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to create investments' using errcode = '42501';
  end if;

  select *
  into quote_row
  from public.investment_quotes
  where id = p_quote_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'Investment quote not found' using errcode = 'P0002';
  end if;

  if quote_row.consumed_at is not null then
    raise exception 'Investment quote has already been used' using errcode = '22023';
  end if;

  if quote_row.expires_at <= now() then
    raise exception 'Investment quote has expired; request a fresh quote' using errcode = '22023';
  end if;

  perform 1
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Customer profile not found' using errcode = 'P0002';
  end if;

  select *
  into plan_row
  from public.investment_plans
  where id = quote_row.plan_id
    and lower(status) = 'active'
  for update;

  if not found then
    raise exception 'Investment plan is no longer active' using errcode = '22023';
  end if;

  if quote_row.amount_usd < plan_row.min_amount
    or (plan_row.max_amount is not null and quote_row.amount_usd > plan_row.max_amount) then
    raise exception 'Investment amount is outside the selected plan range' using errcode = '22023';
  end if;

  if quote_row.funding_currency !~ '^[A-Z0-9]{2,12}$'
    or quote_row.funding_amount * quote_row.exchange_rate_usd < quote_row.amount_usd then
    raise exception 'Investment quote is invalid' using errcode = '22023';
  end if;

  select coalesce(sum(
    case
      when type in ('deposit', 'bonus', 'investment_refund') then balance
      when type in ('withdrawal', 'investment') then -balance
      else 0
    end
  ), 0)
  into available_balance
  from public.user_funds
  where user_id = p_user_id
    and status = 'available'
    and upper(trim(currency)) = quote_row.funding_currency;

  if available_balance < quote_row.funding_amount then
    raise exception 'Available % balance is insufficient for this investment', quote_row.funding_currency
      using errcode = '22023';
  end if;

  insert into public.investments (
    user_id,
    plan_id,
    plan,
    amount,
    status,
    funding_currency,
    funding_amount,
    exchange_rate_usd
  )
  values (
    p_user_id,
    plan_row.id,
    plan_row.name,
    quote_row.amount_usd,
    'pending',
    quote_row.funding_currency,
    quote_row.funding_amount,
    quote_row.exchange_rate_usd
  )
  returning * into investment_row;

  insert into public.user_funds (user_id, balance, type, status, currency, investment_id)
  values (
    p_user_id,
    quote_row.funding_amount,
    'investment',
    'available',
    quote_row.funding_currency,
    investment_row.id
  );

  insert into public.transactions (user_id, amount, type, status, currency, investment_id)
  values (
    p_user_id,
    quote_row.funding_amount,
    'investment',
    'pending',
    quote_row.funding_currency,
    investment_row.id
  );

  update public.investment_quotes
  set consumed_at = now()
  where id = quote_row.id;

  return investment_row;
end;
$$;

create or replace function public.cancel_funded_investment(
  p_investment_id uuid
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  investment_row public.investments%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to cancel investments' using errcode = '42501';
  end if;

  select *
  into investment_row
  from public.investments
  where id = p_investment_id
  for update;

  if not found then
    raise exception 'Investment not found' using errcode = 'P0002';
  end if;

  if investment_row.status <> 'pending' then
    raise exception 'Only pending investments can be cancelled and refunded' using errcode = '22023';
  end if;

  perform 1
  from public.profiles
  where id = investment_row.user_id
  for update;

  update public.investments
  set status = 'cancelled',
      updated_at = now()
  where id = p_investment_id
  returning * into investment_row;

  update public.transactions
  set status = 'failed',
      updated_at = now()
  where investment_id = investment_row.id
    and type = 'investment'
    and status = 'pending';

  if investment_row.funding_amount is not null and investment_row.funding_currency is not null then
    insert into public.user_funds (user_id, balance, type, status, currency, investment_id)
    values (
      investment_row.user_id,
      investment_row.funding_amount,
      'investment_refund',
      'available',
      investment_row.funding_currency,
      investment_row.id
    );

    insert into public.transactions (user_id, amount, type, status, currency, investment_id)
    values (
      investment_row.user_id,
      investment_row.funding_amount,
      'investment_refund',
      'completed',
      investment_row.funding_currency,
      investment_row.id
    );
  end if;

  return investment_row;
end;
$$;

create or replace function public.review_funded_investment(
  p_investment_id uuid,
  p_action text
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  investment_row public.investments%rowtype;
  next_status text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to review investments' using errcode = '42501';
  end if;

  if p_action = 'cancel' then
    return public.cancel_funded_investment(p_investment_id);
  end if;

  if p_action = 'activate' then
    next_status := 'active';
  elsif p_action = 'complete' then
    next_status := 'completed';
  else
    raise exception 'Investment review action is invalid' using errcode = '22023';
  end if;

  select *
  into investment_row
  from public.investments
  where id = p_investment_id
  for update;

  if not found then
    raise exception 'Investment not found' using errcode = 'P0002';
  end if;

  if (p_action = 'activate' and investment_row.status <> 'pending')
    or (p_action = 'complete' and investment_row.status <> 'active') then
    raise exception 'Investment cannot be moved from % to %', investment_row.status, next_status
      using errcode = '22023';
  end if;

  update public.investments
  set status = next_status,
      updated_at = now()
  where id = p_investment_id
  returning * into investment_row;

  update public.transactions
  set status = 'completed',
      updated_at = now()
  where investment_id = investment_row.id
    and type = 'investment'
    and status = 'pending';

  return investment_row;
end;
$$;

revoke all on function public.create_funded_investment(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_funded_investment(uuid, uuid) to service_role;
revoke all on function public.cancel_funded_investment(uuid) from public, anon, authenticated;
grant execute on function public.cancel_funded_investment(uuid) to service_role;
revoke all on function public.review_funded_investment(uuid, text) from public, anon, authenticated;
grant execute on function public.review_funded_investment(uuid, text) to service_role;
