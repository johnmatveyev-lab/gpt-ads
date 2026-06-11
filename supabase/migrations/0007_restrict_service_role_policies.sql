drop policy if exists "service role manages leads" on public.leads;
drop policy if exists "service role manages agent sessions" on public.agent_sessions;
drop policy if exists "service role manages bookings" on public.bookings;

create policy "service role manages leads"
  on public.leads
  for all
  to service_role
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "service role manages agent sessions"
  on public.agent_sessions
  for all
  to service_role
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');

create policy "service role manages bookings"
  on public.bookings
  for all
  to service_role
  using ((select auth.role()) = 'service_role')
  with check ((select auth.role()) = 'service_role');
