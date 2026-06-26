export const requiredProductionEnv = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "BOOKING_URL",
  "BOOKING_WEBHOOK_SECRET",
  "ADMIN_ACCESS_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "LEAD_NOTIFY_EMAIL",
] as const;

export const optionalIntegrationEnv = [
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_ANON_KEY",
  "OWNER_EMAILS",
  "SALES_REP_EMAILS",
  "PLATFORM_ENCRYPTION_KEY",
  "NEXT_PUBLIC_STRIPE_TIER1_CHECKOUT_URL",
  "NEXT_PUBLIC_STRIPE_TIER2_CHECKOUT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_TIER1_PRICE_ID",
  "STRIPE_TIER2_PRICE_ID",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  "VAPI_WEBHOOK_URL",
  "VAPI_WEBHOOK_TOKEN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_SHEETS_WEBHOOK_URL",
  "NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID",
  "NEXT_PUBLIC_OPENAI_ADS_PIXEL_SRC",
  "OPENAI_ADS_API_KEY",
  "OPENAI_ADS_CAPI_ENDPOINT",
] as const;

export const deploymentTargets = {
  vercel: {
    previewBranches: [
      "feature/auth-supabase-google",
      "feature/database-migrations",
      "feature/api-notification-engine",
      "feature/sales-crm-views",
      "feature/ad-networks-integration",
    ],
    productionBranch: "main",
  },
  cloudRun: {
    service: "gpt-ads-website",
    region: "us-central1",
    productionBranch: "main",
  },
} as const;

export function getMissingProductionEnv(env: NodeJS.ProcessEnv = process.env) {
  return requiredProductionEnv.filter((key) => !env[key]);
}
