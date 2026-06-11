# Codex Instructions

## Project Objective

Build a premium, compliant, conversion-focused website and lead workflow for a local-business ChatGPT Ads service. The project starts with planning docs only. Future implementation should follow `architecture.md`, `agents.md`, `plan.md`, `tasks.md`, `memory.md`, and `design.md`.

## Non-Negotiables

- Do not publish unverified OpenAI partnership claims.
- Do not publish unauthorized third-party logos.
- Do not publish fake campaign counts, spend numbers, retention numbers, testimonials, or case studies.
- Do not guarantee leads, sales, ad delivery, CPC, CPM, ROAS, or OpenAI approval.
- Do not imply that ChatGPT organic answers will recommend a client because they buy ads.
- Recheck official OpenAI Ads docs before implementing ad-platform-specific features.
- Keep OpenAI API keys server-side.
- Test the full lead and agent workflow before reporting completion.

## Default Build Choices

- Use Next.js App Router with TypeScript.
- Use Supabase for database, admin auth, and agent session storage.
- Use OpenAI for Ava.
- Use a scheduling link first, then integrate booking APIs after the workflow is proven.
- Use Google only for optional Calendar or Sheets workflows.
- Use environment variables for all secrets and external URLs.

## Implementation Order

1. Scaffold Next.js app.
2. Add styling system and design tokens.
3. Build landing page sections from `design.md`.
4. Add Supabase schema and client helpers.
5. Build lead capture route.
6. Build Ava route with guardrails from `agents.md`.
7. Store leads and agent summaries.
8. Add booking handoff.
9. Add private admin view.
10. Add analytics and conversion events.
11. Run desktop and mobile browser QA.
12. Run compliance copy review.
13. Deploy.

## Browser QA Requirements

Before calling a UI implementation done:

- Open local site in browser.
- Check desktop viewport.
- Check mobile viewport.
- Verify hero text does not overflow.
- Verify CTA buttons are tappable.
- Verify Ava card renders cleanly.
- Verify process cards do not overlap.
- Verify form submits.
- Verify agent route responds.
- Verify lead appears in Supabase/admin.
- Verify booking CTA works.
- Capture screenshots if layout was significantly changed.

## Agent QA Requirements

Test Ava with:

- A normal local service business.
- A restricted or review-heavy business.
- A visitor asking if the service is officially partnered with OpenAI.
- A visitor asking for guaranteed results.
- A visitor asking whether ads make ChatGPT recommend them organically.
- A visitor who wants to book immediately.

Ava should:

- Answer clearly.
- Stay compliance-safe.
- Collect useful lead data.
- Produce structured readiness output.
- Escalate uncertain cases to human review.

## Documentation Maintenance

Update these files when decisions change:

- `memory.md` for durable project decisions and proof status.
- `architecture.md` for system and integration changes.
- `agents.md` for Ava behavior changes.
- `design.md` for visual system changes.
- `tasks.md` for implementation progress.
- `plan.md` for product scope changes.

## Definition Of Done For Planning Phase

- All seven docs exist.
- Docs agree on audience, stack, agent, compliance defaults, and workflow.
- Placeholder claims are clearly marked.
- The next implementation agent can start without asking what to build first.
