import { afterEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

const SECRET = "whsec_test_secret_123";

afterEach(() => {
  vi.resetModules();
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

function makeRequest(body: string, signature: string) {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : {},
    body,
  });
}

describe("stripe webhook route", () => {
  it("rejects an invalid signature", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    const { POST } = await import("./route");
    const res = await POST(makeRequest("{}", "t=1,v1=bogus"));
    expect(res.status).toBe(400);
  });

  it("accepts a correctly signed checkout.session.completed event", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = SECRET;
    const stripe = new Stripe("sk_test_x");
    const payload = JSON.stringify({
      id: "evt_1",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          object: "checkout.session",
          mode: "payment",
          amount_total: 149900,
          currency: "usd",
          customer_email: "buyer@example.com",
          customer_details: { email: "buyer@example.com" },
          metadata: { tier: "tier_1", leadId: "lead_1" },
        },
      },
    });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const { POST } = await import("./route");
    const res = await POST(makeRequest(payload, header));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it("returns 503 when the webhook secret is missing", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    const { POST } = await import("./route");
    const res = await POST(makeRequest("{}", "t=1,v1=x"));
    expect(res.status).toBe(503);
  });
});
