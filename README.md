# GPT Ads Website

Premium Next.js website, readiness-audit funnel, Ava AI agent, and Supabase-backed lead workflow for a local-business ChatGPT Ads launch-support service.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app works locally without Supabase or OpenAI keys:

- Lead submissions are stored in `.data/leads.json`.
- Ava uses a deterministic compliance-safe fallback.
- `/admin` can load local leads without a token in development.

Production should set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `BOOKING_URL`
- `ADMIN_ACCESS_TOKEN`

## Supabase

Apply `supabase/migrations/0001_initial_schema.sql` to create:

- `leads`
- `agent_sessions`
- `bookings`
- service-role-only RLS policies

Only server routes should use `SUPABASE_SERVICE_ROLE_KEY`.

Current Supabase project:

- Project ref: `bukuxdudjwotgbjtzasy`
- API URL: `https://bukuxdudjwotgbjtzasy.supabase.co`
- Security advisor: clean after the current migrations.

Public lead intake can use anon insert policies. Admin lead listing still requires `SUPABASE_SERVICE_ROLE_KEY`.

## Verification

```bash
npm run typecheck
npm run build
```

Manual QA:

- Open the homepage.
- Submit the readiness audit.
- Chat with Ava.
- Open `/admin` and load leads.
- Check `/api/health` for production configuration status.
- Test booking completion webhooks at `/api/bookings/webhook`.
- Confirm no unverified partner claims, third-party logos, or guaranteed-results language are published.

## Deployment

Current Vercel URLs:

- Preview: https://gpt-ads-website-nciwk1b1w-johnmatveyev-lab.vercel.app
- Production alias: https://gpt-ads-website.vercel.app

The preview was deployed with Supabase URL and anon key runtime variables. Add `SUPABASE_SERVICE_ROLE_KEY` for production admin listing and `OPENAI_API_KEY` for live Ava responses.

See `launch-checklist.md` for the latest verification evidence.
See `external-setup.md` for the remaining account-owned configuration steps.

Admin capabilities:

- Load leads.
- View lead detail.
- Update status and booking status.
- Save admin notes.
- Mark a lead contacted.
- Export CSV.
