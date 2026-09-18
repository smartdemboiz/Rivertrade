-- Create the first admin user in Supabase Auth UI,
-- then run this SQL to attach the admin role and profile.

insert into public.profiles (id, email, first_name, last_name, role, country, currency)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'first_name', 'Admin'),
  coalesce(au.raw_user_meta_data->>'last_name', 'User'),
  'admin',
  coalesce(au.raw_user_meta_data->>'country', 'United States'),
  coalesce(au.raw_user_meta_data->>'currency', 'USD')
from auth.users au
where au.email = 'admin@rivertrade.com'
on conflict (email) do update
set role = 'admin',
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    country = excluded.country,
    currency = excluded.currency;

-- Optional: verify the admin record
select * from public.profiles where email = 'admin@rivertrade.com';
