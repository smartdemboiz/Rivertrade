alter table public.managed_accounts
  add column if not exists risk_profile text not null default 'Balanced',
  add column if not exists account_value numeric not null default 0 check (account_value >= 0),
  add column if not exists account_currency text,
  add column if not exists total_return numeric,
  add column if not exists monthly_return numeric,
  add column if not exists management_fee numeric,
  add column if not exists next_review_at date,
  add column if not exists review_requested_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.managed_accounts'::regclass
      and conname = 'managed_accounts_risk_profile_check'
  ) then
    alter table public.managed_accounts
      add constraint managed_accounts_risk_profile_check
      check (risk_profile in ('Conservative', 'Balanced', 'Aggressive'));
  end if;
end;
$$;

update public.managed_accounts as managed
set account_currency = upper(coalesce(nullif(trim(profile.currency), ''), 'USD'))
from public.profiles as profile
where profile.id = managed.user_id
  and nullif(trim(coalesce(managed.account_currency, '')), '') is null;

alter table public.deposits
  add column if not exists purpose text not null default 'standard',
  add column if not exists managed_account_id uuid references public.managed_accounts(id) on delete restrict;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.deposits'::regclass
      and conname = 'deposits_purpose_check'
  ) then
    alter table public.deposits
      add constraint deposits_purpose_check
      check (purpose in ('standard', 'managed_account'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.deposits'::regclass
      and conname = 'deposits_managed_account_reference_check'
  ) then
    alter table public.deposits
      add constraint deposits_managed_account_reference_check
      check (
        (purpose = 'standard' and managed_account_id is null)
        or (purpose = 'managed_account' and managed_account_id is not null)
      );
  end if;
end;
$$;

alter table public.user_funds
  add column if not exists managed_account_id uuid references public.managed_accounts(id) on delete restrict;

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
      and lower(pg_get_constraintdef(oid)) like '%investment_refund%'
  loop
    execute format('alter table public.user_funds drop constraint %I', constraint_row.conname);
  end loop;

  alter table public.user_funds
    add constraint user_funds_type_check
    check (type in ('deposit', 'withdrawal', 'bonus', 'investment', 'investment_refund', 'managed_account'));

  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.transactions'::regclass
      and contype = 'c'
      and lower(pg_get_constraintdef(oid)) like '%type%'
      and lower(pg_get_constraintdef(oid)) like '%investment_refund%'
  loop
    execute format('alter table public.transactions drop constraint %I', constraint_row.conname);
  end loop;

  alter table public.transactions
    add constraint transactions_type_check
    check (type in ('deposit', 'withdrawal', 'bonus', 'investment', 'investment_refund', 'managed_account'));
end;
$$;

create index if not exists managed_accounts_review_requested_idx
  on public.managed_accounts (review_requested_at)
  where review_requested_at is not null;

create or replace function public.manage_customer_managed_account(
  p_user_id uuid,
  p_action text,
  p_risk_profile text default null
)
returns public.managed_accounts
language plpgsql
security definer
set search_path = public
as $$
declare
  account_row public.managed_accounts%rowtype;
  profile_currency text;
  profile_role text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to manage this account' using errcode = '42501';
  end if;

  if p_user_id is null or p_action is null or p_action not in ('setup', 'preferences', 'review') then
    raise exception 'A valid managed-account action is required' using errcode = '22023';
  end if;

  if p_action = 'preferences'
    and p_risk_profile not in ('Conservative', 'Balanced', 'Aggressive') then
    raise exception 'Choose a valid risk profile' using errcode = '22023';
  end if;

  select upper(coalesce(nullif(trim(currency), ''), 'USD')), coalesce(role, 'customer')
  into profile_currency, profile_role
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'Customer profile not found' using errcode = 'P0002';
  end if;

  if profile_role <> 'customer' then
    raise exception 'Managed accounts are available to customer accounts only' using errcode = '42501';
  end if;

  select *
  into account_row
  from public.managed_accounts
  where user_id = p_user_id
  order by created_at desc
  limit 1
  for update;

  if not found and p_action = 'setup' then
    insert into public.managed_accounts (
      user_id, strategy, status, risk_profile, account_value, account_currency
    )
    values (
      p_user_id, 'Pending setup', 'review', 'Balanced', 0, profile_currency
    )
    returning * into account_row;
    return account_row;
  end if;

  if not found then
    raise exception 'Managed account has not been set up yet' using errcode = 'P0002';
  end if;

  if p_action = 'preferences' then
    update public.managed_accounts
    set risk_profile = p_risk_profile,
        updated_at = now()
    where id = account_row.id
    returning * into account_row;
  elsif p_action = 'review' then
    if account_row.status <> 'active' then
      raise exception 'Only an active managed account can request a review' using errcode = '22023';
    end if;
    update public.managed_accounts
    set review_requested_at = now(),
        updated_at = now()
    where id = account_row.id
    returning * into account_row;
  end if;

  return account_row;
end;
$$;

revoke all on function public.manage_customer_managed_account(uuid, text, text) from public, anon, authenticated;
grant execute on function public.manage_customer_managed_account(uuid, text, text) to service_role;

create or replace function public.confirm_managed_account_deposit(
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
  account_row public.managed_accounts%rowtype;
  existing_fund public.user_funds%rowtype;
  fund_id uuid;
  credit_amount numeric := p_credited_amount;
  credit_currency text := upper(trim(coalesce(p_credited_currency, '')));
  applied_rate numeric := p_exchange_rate;
  quoted_at timestamptz := p_exchange_rate_quoted_at;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to confirm managed-account deposits' using errcode = '42501';
  end if;

  select *
  into deposit_row
  from public.deposits
  where id = p_deposit_id
  for update;

  if not found then
    raise exception 'Deposit request not found' using errcode = 'P0002';
  end if;

  if deposit_row.purpose <> 'managed_account' then
    raise exception 'This is not a managed-account funding request' using errcode = '22023';
  end if;

  if deposit_row.status = 'rejected' then
    raise exception 'A rejected deposit cannot be credited' using errcode = '22023';
  end if;

  select *
  into account_row
  from public.managed_accounts
  where id = deposit_row.managed_account_id
    and user_id = deposit_row.user_id
  for update;

  if not found then
    raise exception 'Managed account not found' using errcode = 'P0002';
  end if;

  select *
  into existing_fund
  from public.user_funds
  where deposit_id = deposit_row.id
  for update;

  if found then
    if existing_fund.type <> 'managed_account'
      or existing_fund.managed_account_id <> account_row.id then
      raise exception 'Existing deposit credit does not match this managed account' using errcode = '22023';
    end if;
    credit_amount := existing_fund.balance;
    credit_currency := upper(trim(coalesce(existing_fund.currency, '')));
    applied_rate := coalesce(deposit_row.exchange_rate, existing_fund.balance / deposit_row.amount);
    quoted_at := deposit_row.exchange_rate_quoted_at;
  elsif credit_amount is null or credit_amount <= 0
    or credit_currency = '' or applied_rate is null or applied_rate <= 0
    or quoted_at is null then
    raise exception 'A valid converted amount, currency, rate, and quote time are required' using errcode = '22023';
  end if;

  if account_row.status <> 'active' and existing_fund.id is null then
    raise exception 'An active managed account is required to credit this request' using errcode = '22023';
  end if;

  if account_row.account_currency is not null
    and upper(account_row.account_currency) <> credit_currency then
    raise exception 'Managed-account funding must use the account currency' using errcode = '22023';
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
  values (deposit_row.user_id, credit_amount, 'managed_account', 'completed', credit_currency, deposit_row.id)
  on conflict (deposit_id) where deposit_id is not null
  do update set
    amount = excluded.amount,
    status = excluded.status,
    currency = excluded.currency,
    updated_at = now();

  insert into public.user_funds (
    user_id, balance, type, status, deposit_id, currency, managed_account_id
  )
  values (
    deposit_row.user_id, credit_amount, 'managed_account', 'available',
    deposit_row.id, credit_currency, account_row.id
  )
  on conflict (deposit_id) where deposit_id is not null
  do nothing
  returning id into fund_id;

  if fund_id is not null then
    update public.managed_accounts
    set account_value = account_value + credit_amount,
        account_currency = credit_currency,
        updated_at = now()
    where id = account_row.id;
  end if;

  return deposit_row;
end;
$$;

revoke all on function public.confirm_managed_account_deposit(uuid, numeric, text, numeric, timestamptz) from public, anon, authenticated;
grant execute on function public.confirm_managed_account_deposit(uuid, numeric, text, numeric, timestamptz) to service_role;
