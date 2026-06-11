# GPT Ads Website Plan

## Vision

Create a premium local-business service website for ChatGPT Ads launch support. The site should turn curiosity about the new OpenAI Ads platform into qualified consultations through a clear offer, a readiness-audit lead magnet, and the Ava website agent.

## Positioning

Primary public framing:

"ChatGPT Ads launch support for local businesses."

Supporting language:

- "Find out if ChatGPT Ads are right for your business."
- "Get a practical readiness audit before the platform gets crowded."
- "Prepare your offer, landing page, tracking, and campaign strategy for high-intent ChatGPT conversations."

Avoid:

- "Official OpenAI Ads Partner" unless verified.
- Third-party client logos unless permission exists.
- Numeric claims such as "100+ campaigns" or "$10M+ managed" unless documented.
- Guaranteed results.

## Target Audience

First version targets local businesses and service providers, including:

- Home services.
- Professional services where ads are policy-eligible.
- Local education or training providers.
- Fitness and wellness businesses without medical claims.
- Local ecommerce or retail.
- Hospitality, travel, and experiences where eligible.
- B2B local service firms.

Restricted or review-heavy categories should be routed to human review before claims are made.

## MVP Scope

The MVP includes:

- Premium landing page.
- Ava chat agent.
- Readiness-audit workflow.
- Lead capture.
- Booking handoff.
- Supabase lead storage.
- Admin lead review.
- Email notification.
- Analytics and UTM persistence.
- Compliance-safe copy.

The MVP does not include:

- Public claims of official OpenAI partnership.
- Published third-party logos without permission.
- Full campaign management dashboard.
- Programmatic Ads API campaign creation before real account access is verified.
- Realtime voice agent before the text workflow is stable.

## Site Structure

Recommended navigation:

- Why ChatGPT Ads.
- How It Works.
- Solutions.
- Case Studies.
- Pricing.
- FAQ.
- Book a Call.

If proof is not available, "Case Studies" should become "Use Cases" or "Examples" until real case studies exist.

## Page Sections

1. Hero
   - Badge: "Now in beta" or "ChatGPT Ads readiness support."
   - Headline: "Advertise where the future is already happening."
   - Localized alternate: "See if ChatGPT Ads are right for your local business."
   - CTA: "Talk with Ava" or "Get ChatGPT Ads Readiness Audit."
   - Secondary CTA: "Book a Call."

2. Why ChatGPT Ads
   - Explain high-intent conversations, comparison moments, and early-mover advantage.
   - Ground claims in official OpenAI statements.

3. Ava Lead Magnet
   - Introduce Ava as the AI Growth Consultant.
   - Promise a five-minute readiness review.
   - Route visitors to chat or booking.

4. How It Works
   - Talk with Ava.
   - Strategy and fit review.
   - Onboarding and setup.
   - Launch and scale.

5. Local Business Solutions
   - Show practical use cases by business type.
   - Include policy caveats where relevant.

6. Packages Or Pricing
   - Use discovery-style packages if exact pricing is not ready.
   - Suggested tiers: Readiness Audit, Launch Setup, Managed Growth.

7. FAQ
   - What are ChatGPT Ads?
   - Is this affiliated with OpenAI?
   - Who is eligible?
   - What budget do I need?
   - Can you guarantee results?
   - How does tracking work?

8. Final CTA
   - "Talk with Ava now."
   - "Book a launch-readiness call."

## Funnel

1. Visitor lands from organic, referral, paid, social, or direct.
2. Visitor chooses Talk with Ava or Readiness Audit.
3. Ava qualifies business and collects consent.
4. Supabase stores lead and conversation summary.
5. Visitor receives readiness result and booking option.
6. Qualified lead triggers internal notification.
7. Human team reviews and follows up.
8. Future campaign onboarding starts after eligibility and platform access are confirmed.

## Implementation Phases

### Phase 1: Documentation

- Create root planning docs.
- Lock positioning, architecture, agent behavior, task sequence, and design direction.

### Phase 2: Scaffold

- Initialize Next.js app.
- Add TypeScript, linting, styling, and environment structure.
- Set up Supabase client and schema migrations.

### Phase 3: Landing Page

- Build responsive landing page.
- Implement visual system from `design.md`.
- Add CTAs, FAQ, and compliance-safe disclaimers.

### Phase 4: Lead Workflow

- Build readiness-audit form and Ava entry points.
- Persist UTM/source data.
- Save leads to Supabase.
- Add email notifications.

### Phase 5: Ava

- Build server-side OpenAI route.
- Add structured qualification flow.
- Store session summaries.
- Add booking handoff.

### Phase 6: Admin And QA

- Build private admin lead view.
- Test end-to-end flow.
- Verify browser behavior on desktop and mobile.
- Review all public claims.

### Phase 7: Launch

- Deploy to Vercel.
- Connect Supabase production project.
- Configure analytics, email, booking, and domain.
- Run launch checklist before publishing.

## Success Criteria

- Local-business visitor understands the offer in under ten seconds.
- Visitor can complete a readiness audit in about five minutes.
- Ava produces a useful fit result without false claims.
- Leads are stored and visible to admin.
- Booking handoff is functional.
- The site looks premium and trustworthy.
- Public copy is compliant and evidence-backed.
