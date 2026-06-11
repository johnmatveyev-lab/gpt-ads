create index if not exists agent_sessions_lead_id_idx on public.agent_sessions(lead_id);
create index if not exists bookings_lead_id_idx on public.bookings(lead_id);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);

drop policy if exists "service role manages leads" on public.leads;
drop policy if exists "service role manages agent sessions" on public.agent_sessions;
drop policy if exists "service role manages bookings" on public.bookings;

create policy "service role manages leads"
  on public.leads
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "service role manages agent sessions"
  on public.agent_sessions
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "service role manages bookings"
  on public.bookings
  for all
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');
