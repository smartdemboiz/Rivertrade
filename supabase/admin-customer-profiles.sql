create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.profiles as profile (
    id,
    email,
    first_name,
    last_name,
    country,
    country_code,
    phone,
    currency,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'country_code',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'currency', 'USD'),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(profile.first_name, excluded.first_name),
    last_name = coalesce(profile.last_name, excluded.last_name),
    country = coalesce(profile.country, excluded.country),
    country_code = coalesce(profile.country_code, excluded.country_code),
    phone = coalesce(profile.phone, excluded.phone),
    currency = coalesce(profile.currency, excluded.currency);

  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.profiles as profile (
  id,
  email,
  first_name,
  last_name,
  country,
  country_code,
  phone,
  currency,
  role
)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'first_name', ''),
  coalesce(raw_user_meta_data->>'last_name', ''),
  raw_user_meta_data->>'country',
  raw_user_meta_data->>'country_code',
  raw_user_meta_data->>'phone',
  coalesce(raw_user_meta_data->>'currency', 'USD'),
  'customer'
from auth.users
where email is not null
on conflict (id) do update set
  email = excluded.email,
  first_name = coalesce(profile.first_name, excluded.first_name),
  last_name = coalesce(profile.last_name, excluded.last_name),
  country = coalesce(profile.country, excluded.country),
  country_code = coalesce(profile.country_code, excluded.country_code),
  phone = coalesce(profile.phone, excluded.phone),
  currency = coalesce(profile.currency, excluded.currency);