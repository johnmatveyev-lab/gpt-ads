import Stripe from "stripe";
import type { PaymentTier } from "@/lib/types";

let cachedClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!cachedClient) {
    cachedClient = new Stripe(secretKey, {
      // Use the account's default pinned API version.
      appInfo: { name: "gpt-ads-website" },
    });
  }
  return cachedClient;
}

export type TierConfig = {
  tier: PaymentTier;
  label: string;
  priceEnv: string;
  mode: "payment" | "subscription";
};

/**
 * Tier 1 is a one-time readiness/launch setup payment.
 * Tier 2 is a recurring managed-growth subscription.
 * Prices are provided as Stripe Price IDs via environment variables so amounts
 * stay in the Stripe dashboard rather than hard-coded in the app.
 */
export const tierConfigs: Record<PaymentTier, TierConfig> = {
  tier_1: {
    tier: "tier_1",
    label: "Launch Setup",
    priceEnv: "STRIPE_TIER1_PRICE_ID",
    mode: "payment",
  },
  tier_2: {
    tier: "tier_2",
    label: "Managed Growth",
    priceEnv: "STRIPE_TIER2_PRICE_ID",
    mode: "subscription",
  },
};

export function getTierConfig(tier: string): TierConfig | null {
  if (tier === "tier_1" || tier === "tier_2") return tierConfigs[tier];
  return null;
}

export function getTierPriceId(config: TierConfig): string | undefined {
  return process.env[config.priceEnv] || undefined;
}
