alter table public.profiles
  add column if not exists country_code text,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

create index if not exists referrals_code_upper_idx
  on public.referrals (upper(code))
  where code is not null;

alter table public.swaps
  add column if not exists tx_hash text,
  add column if not exists from_chain_id integer,
  add column if not exists to_chain_id integer,
  add column if not exists from_amount numeric,
  add column if not exists to_amount numeric,
  add column if not exists wallet_address text,
  add column if not exists route_provider text;

alter table public.transactions
  add column if not exists swap_id uuid references public.swaps(id) on delete restrict;

create unique index if not exists swaps_user_tx_hash_unique
  on public.swaps (user_id, lower(tx_hash))
  where tx_hash is not null;

create unique index if not exists transactions_swap_id_unique
  on public.transactions (swap_id)
  where swap_id is not null;

do $$
declare
  constraint_row record;
begin
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
    check (type in ('deposit', 'withdrawal', 'bonus', 'investment', 'investment_refund', 'managed_account', 'swap'));
end;
$$;

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
      if attempt = 5 then
        raise;
      end if;
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

  select user_id
  into referrer_id
  from public.referrals
  where upper(code) = upper(trim(p_referral_code))
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'Referral code is invalid or inactive' using errcode = '22023';
  end if;
  if referrer_id = p_customer_id then
    raise exception 'A customer cannot use their own referral code' using errcode = '22023';
  end if;

  select referred_by
  into current_referrer_id
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
  set referred_by = referrer_id,
      updated_at = now()
  where id = p_customer_id
    and referred_by is null;

  return referrer_id;
end;
$$;

revoke all on function public.ensure_customer_referral(uuid) from public, anon, authenticated;
grant execute on function public.ensure_customer_referral(uuid) to service_role;

revoke all on function public.record_customer_referral_signup(uuid, text) from public, anon, authenticated;
grant execute on function public.record_customer_referral_signup(uuid, text) to service_role;

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
  if p_user_id is null
    or nullif(trim(p_from_asset), '') is null
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

  select coalesce(role, 'customer')
  into profile_role
  from public.profiles
  where id = p_user_id;
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
    select *
    into swap_row
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

revoke all on function public.record_customer_wallet_swap(uuid, text, text, numeric, numeric, integer, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.record_customer_wallet_swap(uuid, text, text, numeric, numeric, integer, integer, text, text, text) to service_role;

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

revoke all on function public.review_customer_wallet_swap(uuid, text) from public, anon, authenticated;
grant execute on function public.review_customer_wallet_swap(uuid, text) to service_role;
