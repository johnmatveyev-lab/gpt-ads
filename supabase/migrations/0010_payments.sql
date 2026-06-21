create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads (id) on delete set null,
  customer_email text,
  tier text not null check (tier in ('tier_1', 'tier_2')),
  mode text not null check (mode in ('payment', 'subscription')),
  status text not null check (status in ('pending', 'paid', 'active', 'failed', 'refunded', 'canceled')),
  amount_total integer,
  currency text,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text
);

create index if not exists payments_lead_id_idx on public.payments (lead_id);
create index if not exists payments_customer_email_idx on public.payments (customer_email);
create index if not exists payments_status_idx on public.payments (status);

alter table public.payments enable row level security;

-- Payments are written only by the Stripe webhook using the service role.
-- The service role bypasses RLS; no anon or authenticated policies are granted,
-- so payment rows are never exposed to public or client-side keys.
