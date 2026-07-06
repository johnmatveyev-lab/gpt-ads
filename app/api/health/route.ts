import { NextResponse } from "next/server";
import { isGoogleOperationalSyncConfigured } from "@/lib/google-sync";
import { isOpenAiAdsCapiConfigured, isOpenAiAdsPixelConfigured } from "@/lib/openai-ads-measurement";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/payments/stripe";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isXaiVoiceConfigured } from "@/lib/voice/xai";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "gpt-ads-website",
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    xaiVoiceConfigured: isXaiVoiceConfigured(),
    stripeConfigured: isStripeConfigured(),
    stripeWebhookConfigured: isStripeWebhookConfigured(),
    stripeTier1PriceConfigured: Boolean(process.env.STRIPE_TIER1_PRICE_ID),
    stripeTier2PriceConfigured: Boolean(process.env.STRIPE_TIER2_PRICE_ID),
    bookingConfigured: Boolean(process.env.BOOKING_URL),
    bookingWebhookSecretConfigured: Boolean(process.env.BOOKING_WEBHOOK_SECRET),
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    leadNotifyEmailConfigured: Boolean(process.env.LEAD_NOTIFY_EMAIL),
    openAiAdsPixelConfigured: isOpenAiAdsPixelConfigured(),
    openAiAdsCapiConfigured: isOpenAiAdsCapiConfigured(),
    googleOperationalSyncConfigured: isGoogleOperationalSyncConfigured(),
  });
}
