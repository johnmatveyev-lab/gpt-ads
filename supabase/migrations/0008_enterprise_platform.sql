create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('owner', 'sales_rep', 'customer');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type lead_status as enum ('new', 'contacted', 'audit_ready', 'closed_won', 'closed_lost');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role not null default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

alter table public.leads
  add column if not exists owner_id uuid references public.profiles(id) on delete set null,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists niche_industry text,
  add column if not exists target_geography text,
  add column if not exists audit_data jsonb default '{}'::jsonb;

update public.leads
set
  contact_name = coalesce(contact_name, name),
  contact_email = coalesce(contact_email, email),
  contact_phone = coalesce(contact_phone, phone, ''),
  niche_industry = coalesce(niche_industry, business_type),
  target_geography = coalesce(target_geography, location),
  website_url = coalesce(website_url, ''),
  audit_data = coalesce(audit_data, '{}'::jsonb);

alter table public.leads
  alter column contact_name set not null,
  alter column contact_email set not null,
  alter column contact_phone set not null,
  alter column niche_industry set not null,
  alter column target_geography set not null,
  alter column website_url set default '',
  alter column website_url set not null,
  alter column audit_data set default '{}'::jsonb,
  alter column audit_data set not null;

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads alter column status drop default;
alter table public.leads
  alter column status type lead_status
  using (
    case status
      when 'qualified' then 'audit_ready'
      when 'review' then 'audit_ready'
      when 'booked' then 'audit_ready'
      when 'closed' then 'closed_won'
      when 'contacted' then 'contacted'
      when 'audit_ready' then 'audit_ready'
      when 'closed_won' then 'closed_won'
      when 'closed_lost' then 'closed_lost'
      else 'new'
    end
  )::lead_status;
alter table public.leads alter column status set default 'new'::lead_status;

create table if not exists public.api_integrations (
  id uuid default gen_random_uuid() primary key,
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  network_name text not null,
  encrypted_api_key text not null,
  account_id text not null,
  is_active boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_network_per_owner unique(owner_profile_id, network_name),
  constraint supported_ad_network check (network_name in ('facebook', 'google', 'tiktok', 'openai'))
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists leads_owner_id_idx on public.leads(owner_id);
create index if not exists leads_contact_email_idx on public.leads(contact_email);
create index if not exists api_integrations_owner_idx on public.api_integrations(owner_profile_id);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.api_integrations enable row level security;

create or replace function public.current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop policy if exists "Profiles viewable by self and admins" on public.profiles;
drop policy if exists "Profiles updateable by self and admins" on public.profiles;
drop policy if exists "Leads access rules based on hierarchy" on public.leads;
drop policy if exists "API credentials restricted to owners" on public.api_integrations;

create policy "Profiles viewable by self and admins" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.current_user_role() = 'owner');

create policy "Profiles updateable by self and admins" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.current_user_role() = 'owner')
  with check (auth.uid() = id or public.current_user_role() = 'owner');

create policy "Leads access rules based on hierarchy" on public.leads
  for all
  to authenticated
  using (
    public.current_user_role() = 'owner'
    or (public.current_user_role() = 'sales_rep' and owner_id = auth.uid())
    or contact_email = coalesce(auth.jwt()->>'email', '')
  )
  with check (
    public.current_user_role() = 'owner'
    or (public.current_user_role() = 'sales_rep' and owner_id = auth.uid())
    or contact_email = coalesce(auth.jwt()->>'email', '')
  );

create policy "API credentials restricted to owners" on public.api_integrations
  for all
  to authenticated
  using (public.current_user_role() = 'owner')
  with check (public.current_user_role() = 'owner');
