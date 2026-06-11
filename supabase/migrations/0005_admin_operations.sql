alter table public.leads
  add column if not exists admin_notes text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists leads_booking_status_idx on public.leads(booking_status);
