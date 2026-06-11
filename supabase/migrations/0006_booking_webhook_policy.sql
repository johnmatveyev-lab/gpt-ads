drop policy if exists "anon can create bookings" on public.bookings;

create policy "anon can create bookings"
  on public.bookings
  for insert
  to anon
  with check (
    provider in ('external_link', 'cal', 'calendly', 'google_calendar')
    and status in ('started', 'booked', 'cancelled', 'completed')
  );
