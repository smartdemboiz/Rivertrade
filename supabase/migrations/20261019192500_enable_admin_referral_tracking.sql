-- Keep referral creation independent of extensions outside the function search path.
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

revoke all on function public.ensure_customer_referral(uuid) from public, anon, authenticated;
grant execute on function public.ensure_customer_referral(uuid) to service_role;
