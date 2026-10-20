-- RiverTrade Supabase schema
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- 1) Profiles / customers
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text,
  last_name text,
  country text,
  country_code text,
  phone text,
  currency text default 'USD',
  referred_by uuid references public.profiles(id) on delete set null,
  role text default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) KYC records
create table if not exists public.kyc (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  document_type text,
  status text default 'pending' check (status in ('pending', 'review', 'approved', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3) Investments
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  plan_id uuid,
  plan text,
  amount numeric default 0,
  funding_currency text,
  funding_amount numeric,
  exchange_rate_usd numeric,
  status text default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) Wallet / user funds
create table if not exists public.user_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  balance numeric default 0,
  currency text,
  type text default 'deposit' check (type in ('deposit', 'withdrawal', 'bonus', 'investment', 'investment_refund', 'managed_account')),
  status text default 'available' check (status in ('available', 'processing', 'pending', 'failed')),
  deposit_id uuid,
  withdrawal_id uuid,
  investment_id uuid references public.investments(id) on delete restrict,
  managed_account_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5) Expert traders
create table if not exists public.expert_traders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  performance text default '+0%',
  status text default 'active' check (status in ('active', 'review', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6) Staff members
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7) Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  amount numeric default 0,
  type text default 'deposit' check (type in ('deposit', 'withdrawal', 'investment', 'investment_refund', 'bonus', 'managed_account', 'swap')),
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  currency text,
  deposit_id uuid,
  withdrawal_id uuid,
  investment_id uuid references public.investments(id) on delete restrict,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8) Deposits
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric default 0,
  currency text,
  method text,
  network text,
  reference text,
  credit_amount_usd numeric check (credit_amount_usd is null or credit_amount_usd > 0),
  credited_amount numeric check (credited_amount is null or credited_amount > 0),
  credited_currency text,
  purpose text not null default 'standard',
  managed_account_id uuid,
  exchange_rate numeric check (exchange_rate is null or exchange_rate > 0),
  exchange_rate_quoted_at timestamptz,
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_deposit_id_fkey') then
    alter table public.transactions
      add constraint transactions_deposit_id_fkey
      foreign key (deposit_id) references public.deposits(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'user_funds_deposit_id_fkey') then
    alter table public.user_funds
      add constraint user_funds_deposit_id_fkey
      foreign key (deposit_id) references public.deposits(id) on delete restrict;
  end if;
end;
$$;

create unique index if not exists transactions_deposit_id_unique
  on public.transactions(deposit_id)
  where deposit_id is not null;

create unique index if not exists user_funds_deposit_id_unique
  on public.user_funds(deposit_id)
  where deposit_id is not null;

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
    applied_rate := coalesce(deposit_row.exchange_rate, existing_fund.balance / deposit_row.amount);
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

-- 9) Withdrawals
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric default 0,
  currency text,
  method text,
  asset text,
  network text,
  destination_details jsonb not null default '{}'::jsonb,
  status text default 'pending' check (status in ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists transactions_withdrawal_id_unique
  on public.transactions (withdrawal_id)
  where withdrawal_id is not null;
create unique index if not exists user_funds_withdrawal_id_unique
  on public.user_funds (withdrawal_id)
  where withdrawal_id is not null;

-- 10) Crypto swaps
create table if not exists public.swaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  from_asset text,
  to_asset text,
  amount numeric default 0,
  from_amount numeric,
  to_amount numeric,
  from_chain_id integer,
  to_chain_id integer,
  tx_hash text,
  wallet_address text,
  route_provider text,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions
  add column if not exists swap_id uuid references public.swaps(id) on delete restrict;

create unique index if not exists swaps_user_tx_hash_unique
  on public.swaps (user_id, lower(tx_hash))
  where tx_hash is not null;
create unique index if not exists transactions_swap_id_unique
  on public.transactions (swap_id)
  where swap_id is not null;

-- 11) Managed accounts
create table if not exists public.managed_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  strategy text,
  allocation text,
  status text default 'active' check (status in ('active', 'review', 'paused')),
  risk_profile text not null default 'Balanced' check (risk_profile in ('Conservative', 'Balanced', 'Aggressive')),
  account_value numeric not null default 0 check (account_value >= 0),
  account_currency text,
  total_return numeric,
  monthly_return numeric,
  management_fee numeric,
  next_review_at date,
  review_requested_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.deposits'::regclass and conname = 'deposits_purpose_check') then
    alter table public.deposits add constraint deposits_purpose_check
      check (purpose in ('standard', 'managed_account'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.deposits'::regclass and conname = 'deposits_managed_account_reference_check') then
    alter table public.deposits add constraint deposits_managed_account_reference_check
      check (
        (purpose = 'standard' and managed_account_id is null)
        or (purpose = 'managed_account' and managed_account_id is not null)
      );
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.deposits'::regclass and conname = 'deposits_managed_account_id_fkey') then
    alter table public.deposits add constraint deposits_managed_account_id_fkey
      foreign key (managed_account_id) references public.managed_accounts(id) on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.user_funds'::regclass and conname = 'user_funds_managed_account_id_fkey') then
    alter table public.user_funds add constraint user_funds_managed_account_id_fkey
      foreign key (managed_account_id) references public.managed_accounts(id) on delete restrict;
  end if;
end;
$$;

-- 12) Profit history
create table if not exists public.profit_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  period text,
  profit numeric default 0,
  currency text,
  status text default 'pending' check (status in ('pending', 'settled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profit_history
  add column if not exists currency text,
  add column if not exists admin_request_id uuid;

alter table public.user_funds
  add column if not exists profit_history_id uuid references public.profit_history(id) on delete restrict;

alter table public.transactions
  add column if not exists profit_history_id uuid references public.profit_history(id) on delete restrict;

update public.profit_history as profit
set currency = upper(trim(coalesce(profile.currency, 'USD')))
from public.profiles as profile
where profile.id = profit.user_id
  and nullif(trim(coalesce(profit.currency, '')), '') is null;

-- 13) Referrals
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  code text unique,
  referrals_count integer default 0,
  earnings numeric default 0,
  status text default 'active' check (status in ('active', 'pending', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

create index if not exists referrals_code_upper_idx
  on public.referrals (upper(code))
  where code is not null;

create or replace function public.ensure_customer_referral(p_user_id uuid)
returns public.referrals
language plpgsql
security definer
set search_path = public
as $$
declare
  referral_row public.referrals%rowtype;
  profile_role text;
  referral_code text;
  attempt integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to manage referral codes' using errcode = '42501';
  end if;
  if p_user_id is null then
    raise exception 'A customer ID is required' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select coalesce(role, 'customer')
  into profile_role
  from public.profiles
  where id = p_user_id;
  if not found or profile_role not in ('customer', 'admin') then
    raise exception 'Customer or admin profile not found' using errcode = 'P0002';
  end if;

  select *
  into referral_row
  from public.referrals
  where user_id = p_user_id
  order by created_at desc
  limit 1
  for update;
  if found and nullif(trim(referral_row.code), '') is not null then
    return referral_row;
  end if;

  for attempt in 1..5 loop
    referral_code := 'RT' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    begin
      if referral_row.id is null then
        insert into public.referrals (user_id, code, referrals_count, earnings, status)
        values (p_user_id, referral_code, 0, 0, 'active')
        returning * into referral_row;
      else
        update public.referrals
        set code = referral_code
        where id = referral_row.id
        returning * into referral_row;
      end if;
      return referral_row;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
  raise exception 'Unable to generate a unique referral code';
end;
$$;

create or replace function public.record_customer_referral_signup(
  p_customer_id uuid,
  p_referral_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  referrer_id uuid;
  current_referrer_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to record referral signups' using errcode = '42501';
  end if;
  if p_customer_id is null or nullif(trim(p_referral_code), '') is null then
    raise exception 'Customer ID and referral code are required' using errcode = '22023';
  end if;

  select user_id into referrer_id
  from public.referrals
  where upper(code) = upper(trim(p_referral_code)) and status = 'active'
  limit 1;
  if not found then
    raise exception 'Referral code is invalid or inactive' using errcode = '22023';
  end if;
  if referrer_id = p_customer_id then
    raise exception 'A customer cannot use their own referral code' using errcode = '22023';
  end if;

  select referred_by into current_referrer_id
  from public.profiles
  where id = p_customer_id
  for update;
  if not found then
    raise exception 'Customer profile not found' using errcode = 'P0002';
  end if;
  if current_referrer_id is not null and current_referrer_id <> referrer_id then
    raise exception 'A referral is already associated with this customer' using errcode = '22023';
  end if;

  update public.profiles
  set referred_by = referrer_id, updated_at = now()
  where id = p_customer_id and referred_by is null;
  return referrer_id;
end;
$$;

create or replace function public.record_customer_wallet_swap(
  p_user_id uuid,
  p_from_asset text,
  p_to_asset text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_from_chain_id integer,
  p_to_chain_id integer,
  p_tx_hash text,
  p_wallet_address text,
  p_route_provider text
)
returns public.swaps
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role text;
  swap_row public.swaps%rowtype;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to record wallet swaps' using errcode = '42501';
  end if;
  if p_user_id is null or nullif(trim(p_from_asset), '') is null
    or nullif(trim(p_to_asset), '') is null
    or upper(trim(p_from_asset)) = upper(trim(p_to_asset))
    or p_from_amount is null or p_from_amount <= 0
    or p_to_amount is null or p_to_amount <= 0
    or p_from_chain_id is null
    or p_from_chain_id not in (1, 8453, 42161)
    or p_to_chain_id is null
    or p_to_chain_id not in (1, 8453, 42161)
    or p_tx_hash is null
    or p_tx_hash !~* '^0x[0-9a-f]{64}$'
    or p_wallet_address is null
    or p_wallet_address !~* '^0x[0-9a-f]{40}$'
    or nullif(trim(p_route_provider), '') is null then
    raise exception 'A valid EVM swap record is required' using errcode = '22023';
  end if;

  select coalesce(role, 'customer') into profile_role
  from public.profiles where id = p_user_id;
  if not found or profile_role <> 'customer' then
    raise exception 'Customer profile not found' using errcode = 'P0002';
  end if;

  insert into public.swaps (
    user_id, from_asset, to_asset, amount, from_amount, to_amount,
    from_chain_id, to_chain_id, tx_hash, wallet_address, route_provider, status
  )
  values (
    p_user_id, upper(trim(p_from_asset)), upper(trim(p_to_asset)), p_from_amount,
    p_from_amount, p_to_amount, p_from_chain_id, p_to_chain_id,
    lower(p_tx_hash), lower(p_wallet_address), left(trim(p_route_provider), 80), 'pending'
  )
  on conflict (user_id, lower(tx_hash)) where tx_hash is not null
  do nothing
  returning * into swap_row;

  if swap_row.id is null then
    select * into swap_row
    from public.swaps
    where user_id = p_user_id and lower(tx_hash) = lower(p_tx_hash)
    for update;
    if swap_row.from_asset is distinct from upper(trim(p_from_asset))
      or swap_row.to_asset is distinct from upper(trim(p_to_asset))
      or swap_row.from_amount is distinct from p_from_amount
      or swap_row.to_amount is distinct from p_to_amount
      or swap_row.from_chain_id is distinct from p_from_chain_id
      or swap_row.to_chain_id is distinct from p_to_chain_id
      or swap_row.wallet_address is distinct from lower(p_wallet_address)
      or swap_row.route_provider is distinct from left(trim(p_route_provider), 80) then
      raise exception 'Transaction hash is already associated with another swap' using errcode = '22023';
    end if;
    return swap_row;
  end if;

  insert into public.transactions (user_id, amount, type, status, currency, swap_id)
  values (p_user_id, p_from_amount, 'swap', 'pending', upper(trim(p_from_asset)), swap_row.id)
  on conflict (swap_id) where swap_id is not null do nothing;
  return swap_row;
end;
$$;

create or replace function public.review_customer_wallet_swap(
  p_swap_id uuid,
  p_action text
)
returns public.swaps
language plpgsql
security definer
set search_path = public
as $$
declare
  target_status text;
  swap_row public.swaps%rowtype;
  transaction_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to review wallet swaps' using errcode = '42501';
  end if;
  if p_swap_id is null or p_action not in ('complete', 'fail') then
    raise exception 'A valid swap review action is required' using errcode = '22023';
  end if;
  target_status := case p_action when 'complete' then 'completed' else 'failed' end;

  select * into swap_row
  from public.swaps
  where id = p_swap_id
  for update;
  if not found then
    raise exception 'Wallet swap not found' using errcode = 'P0002';
  end if;
  if swap_row.status <> 'pending' then
    raise exception 'Only a pending wallet swap can be reviewed' using errcode = '22023';
  end if;

  update public.swaps
  set status = target_status, updated_at = now()
  where id = p_swap_id
  returning * into swap_row;
  update public.transactions
  set status = target_status, updated_at = now()
  where swap_id = p_swap_id and type = 'swap' and status = 'pending';
  get diagnostics transaction_count = row_count;
  if transaction_count <> 1 then
    raise exception 'The wallet swap transaction record is missing or already reviewed' using errcode = 'P0002';
  end if;
  return swap_row;
end;
$$;

revoke all on function public.ensure_customer_referral(uuid) from public, anon, authenticated;
grant execute on function public.ensure_customer_referral(uuid) to service_role;
revoke all on function public.record_customer_referral_signup(uuid, text) from public, anon, authenticated;
grant execute on function public.record_customer_referral_signup(uuid, text) to service_role;
revoke all on function public.record_customer_wallet_swap(uuid, text, text, numeric, numeric, integer, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.record_customer_wallet_swap(uuid, text, text, numeric, numeric, integer, integer, text, text, text) to service_role;
revoke all on function public.review_customer_wallet_swap(uuid, text) from public, anon, authenticated;
grant execute on function public.review_customer_wallet_swap(uuid, text) to service_role;

-- 14) Support tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text,
  email text,
  subject text,
  message text,
  status text default 'open' check (status in ('open', 'pending', 'resolved', 'closed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15) Schema management tables
create table if not exists public.manage_schema (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 16) Swap request history
create table if not exists public.swap_history (
  id uuid primary key default gen_random_uuid(),
  request_id text unique not null,
  ip_address text,
  from_token jsonb not null,
  to_token jsonb not null,
  send_amount numeric not null check (send_amount > 0),
  destination text not null,
  wallet_address text,
  route_priority text,
  result jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 17) Admin audit log
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  section text not null,
  record_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 17) Payment details shown to users
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  method text not null,
  asset text,
  network text,
  label text not null,
  value text not null,
  instructions text,
  destination text default 'both' check (destination in ('deposit', 'withdrawal', 'both')),
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  status text default 'active',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.holidays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  holiday_date date not null,
  country text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.investment_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_amount numeric default 0,
  max_amount numeric,
  roi numeric default 0,
  duration_days integer default 30,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'investments_plan_id_fkey') then
    alter table public.investments
      add constraint investments_plan_id_fkey
      foreign key (plan_id) references public.investment_plans(id) on delete set null;
  end if;
end;
$$;

-- Indexes
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists kyc_user_id_idx on public.kyc(user_id);
create index if not exists investments_user_id_idx on public.investments(user_id);
create index if not exists user_funds_user_id_idx on public.user_funds(user_id);
create index if not exists deposits_user_id_idx on public.deposits(user_id);
create index if not exists withdrawals_user_id_idx on public.withdrawals(user_id);
create index if not exists swaps_user_id_idx on public.swaps(user_id);
create index if not exists managed_accounts_user_id_idx on public.managed_accounts(user_id);
create index if not exists profit_history_user_id_idx on public.profit_history(user_id);
create index if not exists referrals_user_id_idx on public.referrals(user_id);
create index if not exists support_tickets_user_id_idx on public.support_tickets(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists manage_schema_key_idx on public.manage_schema(key);
create index if not exists swap_history_created_at_idx on public.swap_history(created_at desc);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists payment_methods_enabled_idx on public.payment_methods(enabled);
create unique index if not exists user_funds_profit_history_id_unique
  on public.user_funds (profit_history_id)
  where profit_history_id is not null;
create unique index if not exists transactions_profit_history_id_unique
  on public.transactions (profit_history_id)
  where profit_history_id is not null;
create unique index if not exists profit_history_admin_request_id_unique
  on public.profit_history (admin_request_id)
  where admin_request_id is not null;

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_kyc_updated_at
before update on public.kyc
for each row execute function public.set_updated_at();

create trigger set_investments_updated_at
before update on public.investments
for each row execute function public.set_updated_at();

create trigger set_user_funds_updated_at
before update on public.user_funds
for each row execute function public.set_updated_at();

create trigger set_deposits_updated_at
before update on public.deposits
for each row execute function public.set_updated_at();

create trigger set_withdrawals_updated_at
before update on public.withdrawals
for each row execute function public.set_updated_at();

create trigger set_swaps_updated_at
before update on public.swaps
for each row execute function public.set_updated_at();

create trigger set_managed_accounts_updated_at
before update on public.managed_accounts
for each row execute function public.set_updated_at();

create trigger set_profit_history_updated_at
before update on public.profit_history
for each row execute function public.set_updated_at();

create trigger set_referrals_updated_at
before update on public.referrals
for each row execute function public.set_updated_at();

create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

create trigger set_expert_traders_updated_at
before update on public.expert_traders
for each row execute function public.set_updated_at();

create trigger set_staff_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger set_manage_schema_updated_at
before update on public.manage_schema
for each row execute function public.set_updated_at();

create trigger set_schedules_updated_at
before update on public.schedules
for each row execute function public.set_updated_at();

create trigger set_holidays_updated_at
before update on public.holidays
for each row execute function public.set_updated_at();

create trigger set_investment_plans_updated_at
before update on public.investment_plans
for each row execute function public.set_updated_at();

create trigger set_payment_methods_updated_at
before update on public.payment_methods
for each row execute function public.set_updated_at();

-- RLS setup
alter table public.profiles enable row level security;
alter table public.kyc enable row level security;
alter table public.investments enable row level security;
alter table public.user_funds enable row level security;
alter table public.deposits enable row level security;
alter table public.withdrawals enable row level security;
alter table public.swaps enable row level security;
alter table public.managed_accounts enable row level security;
alter table public.profit_history enable row level security;
alter table public.referrals enable row level security;
alter table public.support_tickets enable row level security;
alter table public.expert_traders enable row level security;
alter table public.staff enable row level security;
alter table public.transactions enable row level security;
alter table public.manage_schema enable row level security;
alter table public.swap_history enable row level security;
alter table public.schedules enable row level security;
alter table public.holidays enable row level security;
alter table public.investment_plans enable row level security;
alter table public.audit_logs enable row level security;
alter table public.payment_methods enable row level security;

-- Allow authenticated users to view their own profile
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Allow admins to read everything from admin tables
create policy "Admins can read all profiles"
on public.profiles
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update all profiles"
on public.profiles
for update
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all kyc"
on public.kyc
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update all kyc"
on public.kyc
for update
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all investments"
on public.investments
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update all investments"
on public.investments
for update
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all user funds"
on public.user_funds
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all deposits"
on public.deposits
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all withdrawals"
on public.withdrawals
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all swaps"
on public.swaps
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all managed accounts"
on public.managed_accounts
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all profit history"
on public.profit_history
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all referrals"
on public.referrals
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all support tickets"
on public.support_tickets
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all transactions"
on public.transactions
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all schema tables"
on public.manage_schema
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read audit logs"
on public.audit_logs
for select
using (auth.jwt() ->> 'role' = 'admin');

create policy "Anyone can read enabled payment methods"
on public.payment_methods
for select
using (enabled = true);

create policy "Admins can manage payment methods"
on public.payment_methods
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all schedules"
on public.schedules
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all holidays"
on public.holidays
for all
using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can read all investment plans"
on public.investment_plans
for all
using (auth.jwt() ->> 'role' = 'admin');

-- seed optional default investment plans
insert into public.investment_plans (name, min_amount, max_amount, roi, duration_days, status)
values
  ('Starter Plan', 100, 2000, 8.5, 30, 'active'),
  ('Gold Plan', 2000, 10000, 12.0, 60, 'active'),
  ('Elite Plan', 10000, 50000, 18.0, 90, 'active')
on conflict do nothing;
