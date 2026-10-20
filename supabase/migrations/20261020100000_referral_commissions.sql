create table if not exists public.referral_commission_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default true,
  commission_rate numeric not null default 1 check (commission_rate > 0 and commission_rate <= 100),
  qualifying_activity text not null default 'first_confirmed_deposit'
    check (qualifying_activity = 'first_confirmed_deposit'),
  approval_required boolean not null default true,
  enabled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.referral_commission_settings (singleton, enabled, commission_rate, approval_required)
values (true, true, 1, true)
on conflict (singleton) do nothing;

create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete restrict,
  referred_user_id uuid not null references public.profiles(id) on delete restrict,
  deposit_id uuid not null references public.deposits(id) on delete restrict,
  amount numeric not null check (amount > 0),
  currency text not null,
  commission_rate numeric not null check (commission_rate > 0 and commission_rate <= 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (referred_user_id),
  unique (deposit_id)
);

create index if not exists referral_commissions_referrer_status_idx
  on public.referral_commissions (referrer_id, status, created_at desc);

alter table public.user_funds
  add column if not exists referral_commission_id uuid
    references public.referral_commissions(id) on delete restrict;

alter table public.transactions
  add column if not exists referral_commission_id uuid
    references public.referral_commissions(id) on delete restrict;

create unique index if not exists user_funds_referral_commission_id_unique
  on public.user_funds (referral_commission_id)
  where referral_commission_id is not null;

create unique index if not exists transactions_referral_commission_id_unique
  on public.transactions (referral_commission_id)
  where referral_commission_id is not null;

revoke all on public.referral_commission_settings from public, anon, authenticated;
revoke all on public.referral_commissions from public, anon, authenticated;
grant select on public.referral_commission_settings, public.referral_commissions to service_role;

create or replace function public.create_referral_commission_for_deposit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  referrer uuid;
  commission_enabled boolean;
  commission_rate numeric;
  commission_amount numeric;
  deposit_currency text;
begin
  if new.status <> 'confirmed'
    or new.credited_amount is null
    or new.credited_amount <= 0
    or nullif(trim(new.credited_currency), '') is null then
    return new;
  end if;

  select enabled, referral_commission_settings.commission_rate
  into commission_enabled, commission_rate
  from public.referral_commission_settings
  where singleton = true;

  if not coalesce(commission_enabled, false) then
    return new;
  end if;

  select referred_by
  into referrer
  from public.profiles
  where id = new.user_id
  for update;

  if not found or referrer is null or referrer = new.user_id then
    return new;
  end if;

  if exists (
    select 1
    from public.deposits existing_deposit
    where existing_deposit.user_id = new.user_id
      and existing_deposit.status = 'confirmed'
      and existing_deposit.id <> new.id
  ) then
    return new;
  end if;

  deposit_currency := upper(trim(new.credited_currency));
  commission_amount := round(new.credited_amount * commission_rate / 100, 8);
  if commission_amount <= 0 then
    return new;
  end if;

  insert into public.referral_commissions (
    referrer_id, referred_user_id, deposit_id, amount, currency, commission_rate
  )
  values (
    referrer, new.user_id, new.id, commission_amount, deposit_currency, commission_rate
  )
  on conflict (referred_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists deposits_create_referral_commission on public.deposits;
create trigger deposits_create_referral_commission
  after update of status on public.deposits
  for each row
  when (old.status is distinct from new.status and new.status = 'confirmed')
  execute function public.create_referral_commission_for_deposit();

create or replace function public.review_referral_commission(
  p_commission_id uuid,
  p_action text,
  p_admin_id uuid
)
returns public.referral_commissions
language plpgsql
security definer
set search_path = public
as $$
declare
  commission_row public.referral_commissions%rowtype;
  admin_role text;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to review referral commissions' using errcode = '42501';
  end if;
  if p_commission_id is null or p_action is null or p_action not in ('approve', 'reject') then
    raise exception 'A valid referral commission review action is required' using errcode = '22023';
  end if;

  select role into admin_role
  from public.profiles
  where id = p_admin_id;
  if not found or admin_role is distinct from 'admin' then
    raise exception 'An administrator profile is required to review commissions' using errcode = '42501';
  end if;

  select * into commission_row
  from public.referral_commissions
  where id = p_commission_id
  for update;
  if not found then
    raise exception 'Referral commission not found' using errcode = 'P0002';
  end if;
  if commission_row.status = 'approved' and p_action = 'approve' then
    return commission_row;
  end if;
  if commission_row.status <> 'pending' then
    raise exception 'Referral commission is already in terminal status %', commission_row.status using errcode = '22023';
  end if;

  if p_action = 'approve' then
    insert into public.user_funds (
      user_id, balance, type, status, currency, referral_commission_id
    )
    values (
      commission_row.referrer_id, commission_row.amount, 'bonus', 'available',
      commission_row.currency, commission_row.id
    )
    on conflict (referral_commission_id) where referral_commission_id is not null
    do nothing;

    insert into public.transactions (
      user_id, amount, type, status, currency, referral_commission_id
    )
    values (
      commission_row.referrer_id, commission_row.amount, 'bonus', 'completed',
      commission_row.currency, commission_row.id
    )
    on conflict (referral_commission_id) where referral_commission_id is not null
    do nothing;
  end if;

  update public.referral_commissions
  set status = case when p_action = 'approve' then 'approved' else 'rejected' end,
      reviewed_by = p_admin_id,
      reviewed_at = now(),
      updated_at = now()
  where id = commission_row.id
  returning * into commission_row;

  return commission_row;
end;
$$;

revoke all on function public.create_referral_commission_for_deposit() from public, anon, authenticated;
revoke all on function public.review_referral_commission(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.review_referral_commission(uuid, text, uuid) to service_role;
