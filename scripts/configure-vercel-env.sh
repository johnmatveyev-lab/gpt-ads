#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  OPENAI_API_KEY
  BOOKING_URL
  BOOKING_WEBHOOK_SECRET
  ADMIN_ACCESS_TOKEN
  RESEND_API_KEY
  EMAIL_FROM
  LEAD_NOTIFY_EMAIL
)

optional_vars=(
  NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID
  NEXT_PUBLIC_OPENAI_ADS_PIXEL_SRC
  OPENAI_ADS_API_KEY
  OPENAI_ADS_CAPI_ENDPOINT
  GOOGLE_SHEETS_WEBHOOK_URL
)

target="${1:-preview}"

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel CLI is required. Install with: npm i -g vercel"
  exit 1
fi

echo "Configuring Vercel environment variables for target: ${target}"
echo "This script reads values from your current shell environment."

for key in "${required_vars[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "Missing required env var: ${key}"
    continue
  fi
  printf "%s" "$value" | vercel env add "$key" "$target" --force >/dev/null
  echo "Set ${key}"
done

for key in "${optional_vars[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "Skipped optional env var: ${key}"
    continue
  fi
  printf "%s" "$value" | vercel env add "$key" "$target" --force >/dev/null
  echo "Set ${key}"
done

echo "Done. Redeploy after changing environment variables."
