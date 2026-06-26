# External Setup Guide

The app is implemented and verified with local fallbacks plus Supabase anon intake. These account-owned values must be supplied to make production fully live.

## Required For Full Production

### Gemini (Ava AI)

- Create a Gemini API key in Google AI Studio (https://aistudio.google.com/apikey).
- Set `GEMINI_API_KEY` in Vercel. Optionally set `GEMINI_MODEL` (defaults to `gemini-2.0-flash`).
- Re-test Ava with `/api/health` showing `geminiConfigured: true`.
- Without `GEMINI_API_KEY`, Ava uses the deterministic compliance-safe fallback.

### Supabase Admin

- Get the Supabase service role key from the project settings for project `bukuxdudjwotgbjtzasy`.
- Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
- Keep this key server-side only.
- Re-test `/admin` with `ADMIN_ACCESS_TOKEN`.
- Set `OWNER_EMAILS` and `SALES_REP_EMAILS` as comma-separated lists when the platform dashboard should route users into owner or sales-rep views.
- Set `PLATFORM_ENCRYPTION_KEY` to exactly 32 UTF-8 bytes before storing ad-network API credentials.

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
- Sensitive or regulated categories are flagged for human review and should not trigger automated voice screening.

### Stripe Payments

Full server-side Stripe Checkout is implemented (`/api/stripe/checkout` and the signature-verified `/api/stripe/webhook`). To activate it:

- Create two Stripe Prices in the dashboard:
  - A one-time price for Tier 1 (Launch Setup) → set `STRIPE_TIER1_PRICE_ID`.
  - A recurring price for Tier 2 (Managed Growth) → set `STRIPE_TIER2_PRICE_ID`.
- Set `STRIPE_SECRET_KEY` (use a test key first, then the live key).
- Create a webhook endpoint in Stripe pointing at `https://<your-domain>/api/stripe/webhook`, subscribe to `checkout.session.completed`, `checkout.session.expired`, `invoice.payment_failed`, and `customer.subscription.deleted`, then set the signing secret as `STRIPE_WEBHOOK_SECRET`.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set so payments persist to the `payments` table; without it, payments fall back to a local JSON file (dev only).
- Apply `supabase/migrations/0010_payments.sql`.
- Verify `/api/health` shows `stripeConfigured`, `stripeWebhookConfigured`, `stripeTier1PriceConfigured`, and `stripeTier2PriceConfigured` all `true`.
- Local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook` then `stripe trigger checkout.session.completed`.

The legacy `NEXT_PUBLIC_STRIPE_TIER*_CHECKOUT_URL` Payment Links are no longer used by the client portal, which now drives checkout through the API.

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

## GitHub Actions Deployment

Required GitHub repository secrets for Vercel CI/CD:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Optional Google Cloud Run deployment uses workload identity and Secret Manager. Configure these only if Cloud Run becomes an active target:

- GitHub secrets: `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `GCP_PROJECT_ID`
- GitHub variables: `GAR_LOCATION`, `GAR_REPOSITORY`, `CLOUD_RUN_REGION`, `CLOUD_RUN_SERVICE`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Google Secret Manager secrets: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `BOOKING_WEBHOOK_SECRET`, `ADMIN_ACCESS_TOKEN`, `RESEND_API_KEY`
