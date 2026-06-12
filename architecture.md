# GPT Ads Website Architecture

## Purpose

Build a documentation-first foundation for a service that helps local businesses prepare for, launch, and manage ChatGPT Ads campaigns. The product should convert visitors through a premium landing page, a readiness-audit lead magnet, and an OpenAI-powered website agent named Ava.

This project is independent unless verified OpenAI partner status is provided. Do not publish language that implies official partnership, direct access, guaranteed placement, guaranteed results, or client relationships without proof.

## Verified Platform Context

- OpenAI announced beta self-serve Ads Manager, partner access, CPC and CPM buying, pixel/CAPI measurement, and Ads API support on May 5, 2026.
- Current ChatGPT ad units include advertiser name, favicon, headline, copy, landing page, and image asset.
- Current reporting includes impressions, clicks, spend, CTR, average CPC, average CPM, and conversions.
- OpenAI Ads policies require careful review of advertiser categories, claims, creatives, landing pages, and placement safety.
- Developer-facing OpenAI Ads docs include measurement, Conversions API, and Advertiser API capabilities.

Reference sources:

- https://openai.com/index/new-ways-to-buy-chatgpt-ads/
- https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics
- https://openai.com/policies/ad-policies/
- https://developers.openai.com/ads

## Recommended Stack

- Frontend: Next.js App Router with TypeScript.
- Styling: responsive global CSS with explicit design tokens from `design.md`.
- Backend routes: Next.js route handlers for lead capture, Ava chat, booking handoff, and webhooks.
- Database: Supabase Postgres.
- Auth: Supabase Auth for admin access only.
- Storage: Supabase Storage for future assets, client documents, call notes, and exported reports.
- AI: OpenAI Responses API or Agents SDK for Ava.
- Optional realtime voice: OpenAI Realtime API after the text agent is stable.
- Optional Google layer: Google Calendar for booking sync and Google Sheets for lead exports.
- Deployment: Vercel preferred for Next.js; Supabase hosted project for database/auth/storage.
- CI/CD: GitHub Actions verifies every branch with tests, typecheck, lint, and build. Vercel deploys previews from feature branches and production from `main`; Google Cloud Run remains an optional workflow backed by Docker and Secret Manager.

## Current Implementation

- Next.js app is scaffolded in this repository.
- Landing page, Ava chat, readiness audit form, booking handoff route, admin view, and analytics route are implemented.
- Supabase project: `bukuxdudjwotgbjtzasy`.
- Supabase URL: `https://bukuxdudjwotgbjtzasy.supabase.co`.
- Applied migrations:
  - `0001_initial_schema.sql`
  - `0002_indexes_and_rls_performance.sql`
  - `0003_public_intake_policies.sql`
  - `0004_tighten_public_intake_policies.sql`
  - `0005_admin_operations.sql`
  - `0006_booking_webhook_policy.sql`
  - `0007_restrict_service_role_policies.sql`
- Local development works without external keys using `.data/` fallback storage and Ava's deterministic fallback.
- Public lead intake can use Supabase anon insert policies.
- Booking start/completion events can be stored with server routes and webhook route.
- OpenAI Ads pixel/CAPI hooks are present but only activate with official account-provided env vars.
- Google operational lead sync is present but only activates with `GOOGLE_SHEETS_WEBHOOK_URL`.
- Deployment environment contracts are represented in `.env.example`, `scripts/configure-vercel-env.sh`, `lib/config/deployment.ts`, and `.github/workflows/*`.
- Production admin lead listing requires `SUPABASE_SERVICE_ROLE_KEY`.
- Live OpenAI responses require `OPENAI_API_KEY`; otherwise Ava uses the local compliance-safe fallback.

## System Components

### Public Website

The public website should include:

- Hero section with premium dark/mint visual language.
- Clear local-business offer: ChatGPT Ads launch support and readiness audit.
- Compliance-safe positioning that avoids unverified partnership claims.
- Why ChatGPT Ads section.
- How it works section.
- Local-business solution examples.
- Ava consultation CTA.
- FAQ.
- Pricing or package discovery section.
- Booking CTA.
- Legal/disclaimer footer.

### Lead Magnet

Primary lead magnet:

- "ChatGPT Ads Readiness Audit"
- Alternate CTA: "Talk with Ava"

The lead magnet collects:

- Name.
- Email.
- Phone, optional unless booking is requested.
- Business name.
- Business type or category.
- Location served.
- Website URL.
- Primary offer.
- Target customers.
- Current marketing channels.
- Monthly ad budget range.
- Urgency.
- Consent to be contacted.
- UTM/source fields.

The output should be:

- Fit level: high, medium, low, or needs review.
- Main opportunities.
- Policy or eligibility caveats.
- Recommended next step.
- Booking option.

### Ava Agent

Ava is the AI Growth Consultant on the website. Ava should answer questions, qualify leads, explain the service, and guide visitors to the readiness audit or booking flow.

Backend responsibilities:

- Keep OpenAI API keys server-side only.
- Store conversation summaries, not unnecessary raw sensitive data.
- Send structured lead fields to Supabase.
- Enforce compliance guardrails from `agents.md`.
- Escalate uncertain policy questions to human review.

### Admin Portal

The admin portal should be private and protected with Supabase Auth.

Admin users should be able to view:

- New leads.
- Ava summaries.
- Readiness scores.
- Contact consent.
- Booking status.
- UTM/source data.
- Follow-up status.
- Notes and manual qualification status.

### Measurement

The website should support:

- UTM persistence across landing page, Ava chat, lead form, and booking handoff.
- Standard web analytics events.
- Form submit conversion event.
- Ava qualified lead conversion event.
- Booking started and booking completed events.
- Future OpenAI Ads pixel and Conversions API events where eligible.

Server-side CAPI planning should include:

- Lead submitted.
- Qualified lead.
- Consultation booked.
- Client onboarded.

Do not send private conversation contents or sensitive personal data to ad platforms.

## Supabase Data Model

### `leads`

Recommended fields:

- `id` UUID primary key.
- `created_at` timestamp.
- `updated_at` timestamp.
- `name` text.
- `email` text.
- `phone` text nullable.
- `business_name` text.
- `business_type` text.
- `location` text.
- `website_url` text nullable.
- `primary_offer` text.
- `target_customers` text.
- `current_channels` text array or jsonb.
- `monthly_ad_budget_range` text.
- `urgency` text.
- `consent_to_contact` boolean.
- `source` text nullable.
- `utm_source` text nullable.
- `utm_medium` text nullable.
- `utm_campaign` text nullable.
- `utm_content` text nullable.
- `utm_term` text nullable.
- `readiness_score` integer nullable.
- `fit_level` text nullable.
- `status` text default `new`.
- `booking_status` text default `not_started`.

### `agent_sessions`

Recommended fields:

- `id` UUID primary key.
- `created_at` timestamp.
- `lead_id` UUID nullable references `leads.id`.
- `session_id` text unique.
- `summary` text.
- `readiness_result` jsonb.
- `handoff_recommended` boolean.
- `policy_review_required` boolean.
- `source` text nullable.

### `bookings`

Recommended fields:

- `id` UUID primary key.
- `created_at` timestamp.
- `lead_id` UUID references `leads.id`.
- `provider` text.
- `external_event_id` text nullable.
- `scheduled_for` timestamp nullable.
- `status` text.

## External Integrations

### OpenAI

Use OpenAI for:

- Ava website chat.
- Readiness-audit summary.
- FAQ answering from approved site knowledge.
- Lead qualification.
- Future voice agent, if needed.

### Google

Use Google only where it creates operational leverage:

- Calendar booking sync.
- Sheets export for qualified leads.
- Workspace-based handoff docs.

### Booking

Recommended first version:

- Use a scheduling link such as Calendly, Cal.com, or Google Calendar appointment scheduling.
- Store booking intent and completion status.
- Add deeper booking API integration after the landing and lead workflow are verified.

### Email/CRM

Recommended first version:

- Send internal notification on qualified lead.
- Send visitor confirmation email after lead submission.
- Use Resend, Postmark, HubSpot, or GoHighLevel depending on final sales stack.

## Security And Compliance

- Keep API keys in environment variables.
- Use server-side routes for OpenAI calls.
- Protect admin routes with Supabase Auth.
- Validate and sanitize all lead fields.
- Store only information needed for qualification and follow-up.
- Add consent language before contact or marketing follow-up.
- Include public disclaimers that the service is independent unless verified partnership proof exists.
- Do not publish third-party logos or numerical trust claims without written proof.

## Environment Variables

Planned variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`, optional server-side alias for anon insert when service role is unavailable.
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `BOOKING_URL`
- `BOOKING_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_TIER1_CHECKOUT_URL`, optional Stripe payment link for Tier 1 checkout.
- `NEXT_PUBLIC_STRIPE_TIER2_CHECKOUT_URL`, optional Stripe payment link for Tier 2 checkout.
- `RESEND_API_KEY` or selected email provider key.
- `GOOGLE_CLIENT_ID`, optional.
- `GOOGLE_CLIENT_SECRET`, optional.
- `OPENAI_ADS_PIXEL_ID`, optional after approval.
- `OPENAI_ADS_API_KEY`, optional after approval.

## Acceptance Criteria

- Website can capture local-business leads.
- Ava can qualify a visitor and produce a structured readiness result.
- Supabase stores lead and session data.
- Admin can review leads privately.
- Booking handoff works.
- UTM/source data persists through the funnel.
- No unverified claims are visible in public production copy.
- Official OpenAI docs are checked again before implementation of ad-platform-specific features.
