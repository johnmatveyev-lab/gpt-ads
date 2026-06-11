create policy "anon can create leads"
  on public.leads
  for insert
  to anon
  with check (consent_to_contact = true);

create policy "anon can create agent sessions"
  on public.agent_sessions
  for insert
  to anon
  with check (true);

create policy "anon can create bookings"
  on public.bookings
  for insert
  to anon
  with check (true);
