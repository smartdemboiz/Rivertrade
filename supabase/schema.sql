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
  plan text,
  amount numeric default 0,
  status text default 'pending' check (status in ('pending', 'active', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4) Wallet / user funds
create table if not exists public.user_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  balance numeric default 0,
  type text default 'deposit' check (type in ('deposit', 'withdrawal', 'bonus')),
  status text default 'available' check (status in ('available', 'processing', 'pending', 'failed')),
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
  type text default 'deposit' check (type in ('deposit', 'withdrawal', 'investment', 'bonus')),
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
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
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9) Withdrawals
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric default 0,
  currency text,
  method text,
  status text default 'pending' check (status in ('pending', 'processing', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10) Crypto swaps
create table if not exists public.swaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  from_asset text,
  to_asset text,
  amount numeric default 0,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11) Managed accounts
create table if not exists public.managed_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  strategy text,
  allocation text,
  status text default 'active' check (status in ('active', 'review', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12) Profit history
create table if not exists public.profit_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  period text,
  profit numeric default 0,
  status text default 'pending' check (status in ('pending', 'settled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

-- 14) Support tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  subject text,
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

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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
