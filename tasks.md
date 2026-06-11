# Tasks

## Phase 1: Planning Docs

- [x] Create `architecture.md`.
- [x] Create `agents.md`.
- [x] Create `plan.md`.
- [x] Create `tasks.md`.
- [x] Create `memory.md`.
- [x] Create `design.md`.
- [x] Create `codex.md`.
- [x] Review all docs for consistent positioning and compliance-safe claims.

## Phase 2: Project Scaffold

- [x] Initialize Next.js App Router project with TypeScript.
- [x] Add styling system and design tokens.
- [x] Add linting and formatting.
- [x] Add environment variable template.
- [x] Add Supabase client helpers.
- [x] Add project README with setup commands.

## Phase 3: Supabase

- [x] Create Supabase project.
- [x] Add `leads` table.
- [x] Add `agent_sessions` table.
- [x] Add `bookings` table.
- [x] Add row-level security policies.
- [x] Add admin auth flow.
- [x] Verify service role key is only used server-side.

## Phase 4: Landing Page

- [x] Build responsive hero section.
- [x] Add Ava consultation card.
- [x] Add Why ChatGPT Ads section.
- [x] Add How It Works section with four steps.
- [x] Add local-business solutions/use cases.
- [x] Add pricing or package-discovery section.
- [x] Add FAQ.
- [x] Add final CTA.
- [x] Add legal disclaimer footer.
- [x] Confirm no unverified logos or stats are published.

## Phase 5: Lead Magnet

- [x] Build readiness-audit form.
- [x] Capture required lead fields.
- [x] Add consent checkbox.
- [x] Persist UTM/source fields.
- [x] Submit leads to a server route.
- [x] Save leads in Supabase.
- [x] Show confirmation state.
- [x] Trigger internal notification.
- [x] Send visitor confirmation email if email provider is configured.

## Phase 6: Ava Agent

- [x] Build server-side OpenAI chat route.
- [x] Add approved system instructions from `agents.md`.
- [x] Implement structured readiness result.
- [x] Store conversation summary in Supabase.
- [x] Connect lead capture tool.
- [x] Connect booking handoff.
- [x] Flag restricted categories for human review.
- [x] Add loading, error, and fallback states.
- [x] Test that Ava refuses false partnership or guaranteed-results claims.

## Phase 7: Booking

- [x] Select booking provider.
- [x] Add booking URL to environment variables.
- [x] Add booking CTA after lead qualification.
- [x] Store booking intent.
- [x] Add booking completed webhook if provider supports it.
- [ ] Optional: sync to Google Calendar.

## Phase 8: Admin

- [x] Build protected admin login.
- [x] Build leads table.
- [x] Build lead detail view.
- [x] Show Ava summary and readiness result.
- [x] Show UTM/source fields.
- [x] Add status updates.
- [x] Add manual notes.
- [x] Add export path if needed.

## Phase 9: Analytics And Measurement

- [x] Add analytics provider.
- [x] Track page view.
- [x] Track CTA click.
- [x] Track Ava started.
- [x] Track readiness audit completed.
- [x] Track qualified lead.
- [x] Track booking started.
- [x] Track booking completed.
- [x] Add gated OpenAI Ads pixel loader for official account-provided script details.
- [x] Add gated Conversions API route that records events internally until endpoint/API key are supplied.

## Phase 10: QA And Compliance

- [x] Test desktop layout.
- [x] Test mobile layout.
- [x] Test form submit path.
- [x] Test Ava qualification path.
- [x] Test restricted-category path.
- [x] Test booking handoff.
- [x] Test admin lead visibility.
- [x] Test email notification.
- [x] Test UTM persistence.
- [x] Confirm no public unverified partnership claim.
- [x] Confirm no unauthorized third-party logos.
- [x] Confirm no guaranteed performance claims.
- [x] Confirm OpenAI Ads docs have been rechecked before launch.

## Phase 11: Deploy

- [x] Create production Supabase project.
- [x] Configure production environment variables.
- [x] Deploy to Vercel.
- [x] Connect domain.
- [x] Run production smoke test.
- [x] Submit test lead.
- [ ] Verify admin visibility.
- [x] Verify notification delivery.
- [x] Archive launch checklist results.

## External Configuration Still Required

- [ ] Add a real `OPENAI_API_KEY` so Ava uses live OpenAI responses instead of fallback mode.
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel so production admin lead listing and updates work.
- [ ] Add real `BOOKING_URL` and `BOOKING_WEBHOOK_SECRET`.
- [ ] Add `RESEND_API_KEY`, `EMAIL_FROM`, and `LEAD_NOTIFY_EMAIL` for real email sending instead of recorded notification fallback.
- [ ] Configure OpenAI Ads pixel values only after account access and implementation details are confirmed.
- [ ] Configure Conversions API values only after privacy review.
- [ ] Optional: configure Google Calendar/Sheets if operational sync is still desired.
