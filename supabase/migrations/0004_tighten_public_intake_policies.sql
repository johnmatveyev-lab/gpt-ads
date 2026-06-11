drop policy if exists "anon can create agent sessions" on public.agent_sessions;
drop policy if exists "anon can create bookings" on public.bookings;

create policy "anon can create agent sessions"
  on public.agent_sessions
  for insert
  to anon
  with check (
    length(session_id) > 8
    and length(summary) > 0
    and jsonb_typeof(readiness_result) = 'object'
  );

create policy "anon can create bookings"
  on public.bookings
  for insert
  to anon
  with check (
    provider in ('external_link', 'cal', 'calendly', 'google_calendar')
    and status in ('started', 'booked')
  );
