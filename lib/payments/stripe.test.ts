import { afterEach, describe, expect, it } from "vitest";
import { getTierConfig, getTierPriceId, isStripeConfigured, tierConfigs } from "@/lib/payments/stripe";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("stripe tier configuration", () => {
  it("resolves known tiers", () => {
    expect(getTierConfig("tier_1")).toEqual(tierConfigs.tier_1);
    expect(getTierConfig("tier_2")?.mode).toBe("subscription");
  });

  it("rejects unknown tiers", () => {
    expect(getTierConfig("tier_3")).toBeNull();
    expect(getTierConfig("")).toBeNull();
  });

  it("reads the price id from the configured env var", () => {
    process.env.STRIPE_TIER1_PRICE_ID = "price_123";
    expect(getTierPriceId(tierConfigs.tier_1)).toBe("price_123");
    delete process.env.STRIPE_TIER2_PRICE_ID;
    expect(getTierPriceId(tierConfigs.tier_2)).toBeUndefined();
  });

  it("reports configuration based on the secret key", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    expect(isStripeConfigured()).toBe(true);
  });
});
