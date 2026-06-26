import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { trackServerEvent } from "@/lib/analytics";
import { sendOpenAiAdsConversion } from "@/lib/openai-ads-measurement";
import { getStripeClient } from "@/lib/payments/stripe";
import { findPaymentBySessionId, upsertPayment } from "@/lib/payments/store";
import type { PaymentRecord, PaymentStatus, PaymentTier } from "@/lib/types";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handling failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const status: PaymentStatus = session.mode === "subscription" ? "active" : "paid";
      await persistFromSession(session, status);
      await trackPayment(session);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await persistFromSession(session, "canceled");
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await patchByCustomer(invoice.customer, "failed");
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await patchByCustomer(subscription.customer, "canceled");
      break;
    }
    default:
      break;
  }
}

async function persistFromSession(session: Stripe.Checkout.Session, status: PaymentStatus) {
  if (!session.id) return;
  const existing = await findPaymentBySessionId(session.id);
  const now = new Date().toISOString();
  const tier = (session.metadata?.tier as PaymentTier) || existing?.tier || "tier_1";

  const record: PaymentRecord = {
    id: existing?.id || randomUUID(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    leadId: session.metadata?.leadId || existing?.leadId || undefined,
    customerEmail:
      session.customer_details?.email || session.customer_email || existing?.customerEmail || undefined,
    tier,
    mode: session.mode === "subscription" ? "subscription" : "payment",
    status,
    amountTotal: session.amount_total ?? existing?.amountTotal,
    currency: session.currency ?? existing?.currency ?? undefined,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: asId(session.customer) ?? existing?.stripeCustomerId,
    stripeSubscriptionId: asId(session.subscription) ?? existing?.stripeSubscriptionId,
    stripePaymentIntentId: asId(session.payment_intent) ?? existing?.stripePaymentIntentId,
  };

  await upsertPayment(record);
}

async function patchByCustomer(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  status: PaymentStatus,
) {
  // Subscription lifecycle events reference the customer, not the original
  // checkout session. We only flag status changes we can record without a
  // session lookup; the source of truth for entitlement remains the latest
  // checkout.session.completed plus these status transitions.
  const customerId = asId(customer);
  if (!customerId) return;
  await trackServerEvent({
    id: randomUUID(),
    event: "payment_status_changed",
    createdAt: new Date().toISOString(),
    payload: { stripeCustomerId: customerId, status },
  });
}

async function trackPayment(session: Stripe.Checkout.Session) {
  const occurredAt = new Date().toISOString();
  await trackServerEvent({
    id: randomUUID(),
    event: "payment_completed",
    createdAt: occurredAt,
    payload: {
      tier: session.metadata?.tier ?? null,
      leadId: session.metadata?.leadId ?? null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
      mode: session.mode,
    },
  });
  await sendOpenAiAdsConversion({
    eventName: "payment_completed",
    eventId: session.id,
    occurredAt,
    leadId: session.metadata?.leadId || undefined,
  }).catch(() => undefined);
}

function asId(value: string | { id: string } | null | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}
