alter table public.profiles
  add column if not exists mobile_number text,
  add column if not exists is_active boolean not null default true;

create index if not exists profiles_active_sales_rep_idx
  on public.profiles(role, is_active)
  where role = 'sales_rep' and is_active = true;
