import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import {
  getStripeClient,
  getTierConfig,
  getTierPriceId,
  isStripeConfigured,
} from "@/lib/payments/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in to continue to checkout." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const config = getTierConfig(typeof body?.tier === "string" ? body.tier : "");
  if (!config) {
    return NextResponse.json({ error: "Unknown package tier." }, { status: 400 });
  }

  const priceId = getTierPriceId(config);
  if (!priceId) {
    return NextResponse.json(
      { error: `Price for ${config.label} is not configured.` },
      { status: 503 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const leadId = typeof body?.leadId === "string" ? body.leadId : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: profile.email,
      success_url: `${baseUrl}/platform/client?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/platform/client?checkout=cancelled`,
      client_reference_id: leadId,
      metadata: {
        tier: config.tier,
        leadId: leadId ?? "",
        profileId: profile.id,
        customerEmail: profile.email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
