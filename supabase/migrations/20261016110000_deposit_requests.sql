alter table public.deposits
  add column if not exists network text,
  add column if not exists reference text;
