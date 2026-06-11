# Launch Checklist Results

## Local Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Browser QA:
  - Desktop hero screenshot saved at `output/playwright/desktop-home.png`.
  - Mobile hero screenshot saved at `output/playwright/mobile-home.png`.
  - Readiness audit submission verified locally.
  - Ava compliance response verified locally.
  - Admin lead visibility verified locally.
  - Admin status, booking status, notes, contacted timestamp, and CSV export verified locally.

## Supabase Verification

- Project ref: `bukuxdudjwotgbjtzasy`.
- Security advisor: no lints.
- Applied migrations:
  - `initial_schema`
  - `indexes_and_rls_performance`
  - `public_intake_policies`
  - `tighten_public_intake_policies`
  - `admin_operations`
  - `booking_webhook_policy`
  - `restrict_service_role_policies`
- Current verified rows after smoke tests:
  - Leads: 4.
  - Agent sessions: 2.
  - Bookings: 2.

## Vercel Verification

- Latest preview: https://gpt-ads-website-nciwk1b1w-johnmatveyev-lab.vercel.app
- Health endpoint verified through `vercel curl`.
- Preview lead submission verified and persisted to Supabase.
- Preview booking completion webhook verified and persisted to Supabase.
- Gated OpenAI Ads conversion endpoint verified through `vercel curl`; it records internally while unconfigured.
- Google operational sync verified as safely skipped while unconfigured.

## Remaining External Configuration

These cannot be truthfully completed without real credentials or account decisions:

- `OPENAI_API_KEY` for live Ava responses.
- `SUPABASE_SERVICE_ROLE_KEY` for production admin lead listing and updates.
- Real `BOOKING_URL` and `BOOKING_WEBHOOK_SECRET`.
- `RESEND_API_KEY`, `EMAIL_FROM`, and `LEAD_NOTIFY_EMAIL` for real email delivery.
- OpenAI Ads pixel and Conversions API setup after account access and privacy review.
- Optional Google Calendar/Sheets sync.
