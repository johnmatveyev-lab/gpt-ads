create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  business_name text not null,
  business_type text not null,
  location text not null,
  website_url text,
  primary_offer text not null,
  target_customers text not null,
  current_channels text[] not null default '{}',
  monthly_ad_budget_range text not null,
  urgency text not null,
  consent_to_contact boolean not null default false,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  readiness_score integer,
  fit_level text check (fit_level in ('high', 'medium', 'low', 'needs_human_review')),
  status text not null default 'new' check (status in ('new', 'qualified', 'review', 'booked', 'closed')),
  booking_status text not null default 'not_started' check (booking_status in ('not_started', 'started', 'booked')),
  opportunities text[] not null default '{}',
  risks text[] not null default '{}',
  recommended_next_step text,
  booking_recommended boolean not null default false,
  policy_review_required boolean not null default false,
  agent_summary text
);

create table if not exists public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  session_id text not null unique,
  summary text not null,
  readiness_result jsonb not null default '{}'::jsonb,
  handoff_recommended boolean not null default false,
  policy_review_required boolean not null default false,
  source text
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete cascade,
  provider text not null default 'external_link',
  external_event_id text,
  scheduled_for timestamptz,
  status text not null default 'started' check (status in ('started', 'booked', 'cancelled', 'completed'))
);

alter table public.leads enable row level security;
alter table public.agent_sessions enable row level security;
alter table public.bookings enable row level security;

create policy "service role manages leads"
  on public.leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages agent sessions"
  on public.agent_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role manages bookings"
  on public.bookings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
