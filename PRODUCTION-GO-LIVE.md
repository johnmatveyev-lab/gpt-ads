# Production Go-Live Runbook

Everything below is the remaining last mile to make the app fully live. Code is
complete and merged to `main`: Stripe Checkout + webhook, Gemini-powered Ava, and
a provisioned Supabase database with all migrations applied. What remains is
entering credentials that live behind your accounts (these cannot be performed
from the Claude Code web session because the environment's network policy blocks
`api.stripe.com`, `api.supabase.com`, and the Vercel API).

When done, `https://<your-domain>/api/health` should report every flag `true`.

---

## 1. Supabase (database is already live)

- Project: **`gpt-ads-production`** — ref `vpsmybojbxugeklsrkik`
- URL: `https://vpsmybojbxugeklsrkik.supabase.co`
- Anon/publishable key: `sb_publishable_gk7ONKScXFA_5ghJJkj_6A_4ICc6ms0`
- DB password (set at provisioning): `GptAds-Ibh1WiTMlearyV6w8ZCtcq1d`
- All 11 migrations (incl. `0010_payments`) are applied; 6 RLS-enabled tables.

**You still need the service-role key** (deliberately not retrievable via tooling):
Dashboard → project `vpsmybojbxugeklsrkik` → Settings → API → copy `service_role`
→ set as `SUPABASE_SERVICE_ROLE_KEY` (server-side only).

## 2. Gemini (Ava AI)

Get a key from an **active, non-suspended** Google project at
https://aistudio.google.com/apikey → set `GEMINI_API_KEY`.
Optional: `GEMINI_MODEL` (defaults to `gemini-2.0-flash`).

> Note: the first key tried returned `CONSUMER_SUSPENDED` — its Google project is
> suspended. Use a key from a project with billing in good standing.

## 3. Stripe (run on your machine, or use the dashboard)

```bash
stripe login

# Tier 1 — one-time "Launch Setup"
stripe products create --name "Launch Setup"
stripe prices create --product <prod_id> --unit-amount 149900 --currency usd
#   -> STRIPE_TIER1_PRICE_ID (price_...)

# Tier 2 — recurring "Managed Growth"
stripe products create --name "Managed Growth"
stripe prices create --product <prod_id> --unit-amount 245000 --currency usd \
  --recurring.interval month
#   -> STRIPE_TIER2_PRICE_ID (price_...)

# Webhook -> the app's verified handler
stripe webhook_endpoints create \
  --url https://<your-domain>/api/stripe/webhook \
  --enabled-events checkout.session.completed,checkout.session.expired,invoice.payment_failed,customer.subscription.deleted
#   -> STRIPE_WEBHOOK_SECRET (whsec_...)
```

Also copy `STRIPE_SECRET_KEY` (sk_live_... or sk_test_...) from the dashboard.

## 4. Vercel env vars (project `ads`)

Set these (Production), then redeploy:

```
NEXT_PUBLIC_SUPABASE_URL=https://vpsmybojbxugeklsrkik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gk7ONKScXFA_5ghJJkj_6A_4ICc6ms0
SUPABASE_ANON_KEY=sb_publishable_gk7ONKScXFA_5ghJJkj_6A_4ICc6ms0
SUPABASE_SERVICE_ROLE_KEY=<from step 1>
GEMINI_API_KEY=<from step 2>
STRIPE_SECRET_KEY=<from step 3>
STRIPE_WEBHOOK_SECRET=<from step 3>
STRIPE_TIER1_PRICE_ID=<from step 3>
STRIPE_TIER2_PRICE_ID=<from step 3>
PLATFORM_ENCRYPTION_KEY=bG9yguJjV4OyXN331lePfcUjyA1tqpxx
ADMIN_ACCESS_TOKEN=d1892b538be8d589f3cb2115cdc72ab6b50c14415cb95c7f
BOOKING_WEBHOOK_SECRET=e9ebf66f3ed6deea651f837f92fc726fddf23f8a9e07ed1f
NEXT_PUBLIC_SITE_URL=https://<your-domain>
NEXT_PUBLIC_APP_URL=https://<your-domain>
```

Optional (email/booking/notifications): `RESEND_API_KEY`, `EMAIL_FROM`,
`LEAD_NOTIFY_EMAIL`, `BOOKING_URL`.

> The `PLATFORM_ENCRYPTION_KEY`, `ADMIN_ACCESS_TOKEN`, and `BOOKING_WEBHOOK_SECRET`
> above were generated for you. Rotate them anytime; `PLATFORM_ENCRYPTION_KEY`
> must stay exactly 32 bytes.

## 5. Verify

```bash
curl -s https://<your-domain>/api/health | jq
```

Expect `true` for: `supabaseConfigured`, `supabaseAdminConfigured`,
`geminiConfigured`, `stripeConfigured`, `stripeWebhookConfigured`,
`stripeTier1PriceConfigured`, `stripeTier2PriceConfigured`.

Then smoke-test: submit the readiness audit, chat with Ava (live Gemini),
and run a Stripe test-mode checkout from the client portal.
