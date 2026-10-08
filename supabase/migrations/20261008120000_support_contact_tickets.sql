alter table public.support_tickets
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists message text;
