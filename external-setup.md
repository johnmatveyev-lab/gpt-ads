# External Setup Guide

The app is implemented and verified with local fallbacks plus Supabase anon intake. These account-owned values must be supplied to make production fully live.

## Required For Full Production

### OpenAI

- Create an OpenAI API key in the OpenAI Platform.
- Set `OPENAI_API_KEY` in Vercel.
- Re-test Ava with `/api/health` showing `openAiConfigured: true`.

### Supabase Admin

- Get the Supabase service role key from the project settings for project `bukuxdudjwotgbjtzasy`.
- Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- Keep this key server-side only.
- Re-test `/admin` with `ADMIN_ACCESS_TOKEN`.

### Booking

- Replace the placeholder `BOOKING_URL` with the real booking URL.
- Generate and set `BOOKING_WEBHOOK_SECRET`.
- Configure the booking provider webhook to POST to `/api/bookings/webhook` with the header `x-booking-secret`.

### Email

- Configure a Resend sender/domain or equivalent.
- Set `RESEND_API_KEY`, `EMAIL_FROM`, and `LEAD_NOTIFY_EMAIL`.
- Submit a test lead and verify visitor + internal notifications.

### Omnichannel Lead Onboarding

- Apply `supabase/migrations/0009_sales_rep_contact_fields.sql`.
- Add active sales reps in `public.profiles` with `role = 'sales_rep'`, `is_active = true`, and `mobile_number` and/or `email`.
- Set `NEXT_PUBLIC_APP_URL` so rep emails deep-link to the platform dashboard.
- Configure Twilio SMS with `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`.
- Configure VAPI outbound-call queuing with `VAPI_WEBHOOK_URL` and optional `VAPI_WEBHOOK_TOKEN`.
- POST landing-page audit payloads to `/api/leads/onboard`.

## Optional Measurement

### OpenAI Ads Pixel

Only configure after OpenAI Ads account access provides the official pixel/script details:

- `NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID`
- `NEXT_PUBLIC_OPENAI_ADS_PIXEL_SRC`

The app will not load any OpenAI Ads pixel unless both values are present.

### OpenAI Ads Conversions API

Only configure after account access and privacy review confirm the endpoint and payload contract:

- `OPENAI_ADS_API_KEY`
- `OPENAI_ADS_CAPI_ENDPOINT`

Without those values, conversion events are recorded internally only.

### Google Operational Sync

If a Google Apps Script or integration endpoint is created for lead export, set:

- `GOOGLE_SHEETS_WEBHOOK_URL`

The app will post qualified lead data to that endpoint after lead submission.

## Vercel Helper Script

Export the required values in your shell, then run:

```bash
bash scripts/configure-vercel-env.sh preview
vercel deploy
```

For production:

```bash
bash scripts/configure-vercel-env.sh production
vercel deploy --prod
```
