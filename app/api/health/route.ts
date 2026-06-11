import { NextResponse } from "next/server";
import { isGoogleOperationalSyncConfigured } from "@/lib/google-sync";
import { isOpenAiAdsCapiConfigured, isOpenAiAdsPixelConfigured } from "@/lib/openai-ads-measurement";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "gpt-ads-website",
    supabaseConfigured: isSupabaseConfigured(),
    supabaseAdminConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    bookingConfigured: Boolean(process.env.BOOKING_URL),
    bookingWebhookSecretConfigured: Boolean(process.env.BOOKING_WEBHOOK_SECRET),
    emailConfigured: Boolean(process.env.RESEND_API_KEY),
    leadNotifyEmailConfigured: Boolean(process.env.LEAD_NOTIFY_EMAIL),
    openAiAdsPixelConfigured: isOpenAiAdsPixelConfigured(),
    openAiAdsCapiConfigured: isOpenAiAdsCapiConfigured(),
    googleOperationalSyncConfigured: isGoogleOperationalSyncConfigured(),
  });
}
