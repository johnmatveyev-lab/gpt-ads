# Project Memory

## Core Decisions

- Audience: local businesses.
- Stack: Next.js App Router, TypeScript, Supabase, OpenAI.
- Primary conversion path: Ava readiness audit.
- Primary agent: Ava, AI Growth Consultant.
- Primary CTA: "Talk with Ava" or "Get ChatGPT Ads Readiness Audit."
- Google is optional and operational, not the core platform.
- The site should be premium, dark, mint-accented, and conversion-focused.

## Business Positioning

The service helps local businesses evaluate, prepare for, launch, and manage ChatGPT Ads campaigns.

Approved safer positioning:

- "ChatGPT Ads launch support for local businesses."
- "Find out if ChatGPT Ads are right for your business."
- "Get ready for the new OpenAI Ads platform."
- "Prepare your offer, creative, landing page, tracking, and campaign strategy."

Do not use unless verified:

- "Official OpenAI Ads Partner."
- "Official beta ads partner."
- "Direct access to OpenAI Ads."
- "Trusted by Stripe, Shopify, Notion, Canva, Webflow."
- "100+ campaigns managed."
- "$10M+ ad spend managed."
- "95% client retention."

## Screenshot-Derived Direction

The screenshots establish the desired direction:

- Premium black/near-black background.
- Mint and green accent system.
- Glassmorphism panels.
- Strong oversized hero typography.
- ChatGPT phone mockup showing a sponsored ad card.
- OpenAI-style brand cues without implying unauthorized affiliation.
- Agent card featuring Ava.
- Four-step process.
- Trust strip, but only with verified proof or placeholders.
- CTA urgency around beta/early access, kept factual.

## OpenAI Ads Facts To Recheck

Before build or launch, recheck:

- OpenAI Ads availability.
- Supported countries.
- Ads Manager eligibility.
- CPC/CPM pricing guidance.
- Pixel/CAPI setup.
- Advertiser API access.
- Ad content policies.
- Restricted categories.
- Required landing-page standards.

Known sources:

- https://openai.com/index/new-ways-to-buy-chatgpt-ads/
- https://help.openai.com/en/articles/20001207-ads-in-chatgpt-the-basics
- https://openai.com/policies/ad-policies/
- https://developers.openai.com/ads

## Compliance Defaults

- Treat platform facts as changing until verified during implementation.
- Treat all trust claims as placeholders unless evidence is supplied.
- Do not use third-party logos without permission.
- Do not guarantee ad delivery or business outcomes.
- Do not imply OpenAI endorsement.
- Route restricted categories to human review.
- Keep private lead and conversation data out of ad-platform tracking payloads.

## Build Defaults

- Use Supabase for lead storage, admin auth, and agent session persistence.
- Keep OpenAI calls server-side.
- Store structured agent outputs.
- Use a scheduling link first; add booking API integration later.
- Use email notification for qualified leads.
- Add admin portal after lead storage is working.
- Verify every workflow in browser before reporting completion.

## Current Implementation State

- Next.js app, landing page, Ava chat, readiness audit, admin lead view, analytics route, and API routes exist.
- Supabase project `bukuxdudjwotgbjtzasy` exists in the `calmpoint` organization.
- Supabase API URL is `https://bukuxdudjwotgbjtzasy.supabase.co`.
- Public lead intake has been verified through the app route into Supabase with anon insert policies.
- Ava session persistence has been verified through the app route into Supabase.
- Ava can capture a full `leadContext` into the lead store when `captureLead` is true.
- Booking webhook route can record booked/completed events.
- Admin can update status, booking status, notes, contacted timestamp, and export CSV locally; Supabase-backed production admin needs service role.
- Local browser QA verified homepage rendering, readiness audit submission, Ava compliance response, and admin local lead visibility.
- Vercel preview deployment: `https://gpt-ads-website-nciwk1b1w-johnmatveyev-lab.vercel.app`.
- Vercel production alias created during initial deploy: `https://gpt-ads-website.vercel.app`.
- Production admin lead listing still needs `SUPABASE_SERVICE_ROLE_KEY`.
- Live Ava responses still need `OPENAI_API_KEY`; fallback mode is implemented for local/preview continuity.
- OpenAI Ads pixel/CAPI are implemented as gated hooks and remain unconfigured until account-provided values exist.
- Google operational sync is implemented as an optional webhook and remains unconfigured until `GOOGLE_SHEETS_WEBHOOK_URL` exists.

## Future Proof Needed

Add proof here before publishing related claims:

- OpenAI partner or beta-access documentation.
- Permission to use any third-party logos.
- Real campaign count.
- Real ad spend managed.
- Real client retention.
- Real case studies.
- Testimonials and usage permissions.
