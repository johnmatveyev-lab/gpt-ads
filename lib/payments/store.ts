import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtime-paths";
import { createClient } from "@supabase/supabase-js";
import type { PaymentRecord } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const dataDir = getRuntimeDataDir();
const paymentsPath = path.join(dataDir, "payments.json");

function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function isPaymentsPersistenceConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

/**
 * Upsert a payment keyed by Stripe Checkout Session ID so webhook retries and
 * follow-up events (e.g. invoice.paid) update the same row rather than
 * duplicating it.
 */
export async function upsertPayment(record: PaymentRecord): Promise<PaymentRecord> {
  const service = getServiceClient();
  if (service) {
    const { data, error } = await service
      .from("payments")
      .upsert(toRow(record), { onConflict: "stripe_checkout_session_id" })
      .select("*")
      .single();
    if (error) throw error;
    return fromRow(data);
  }
  return upsertLocalPayment(record);
}

export async function findPaymentBySessionId(sessionId: string): Promise<PaymentRecord | null> {
  const service = getServiceClient();
  if (service) {
    const { data, error } = await service
      .from("payments")
      .select("*")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromRow(data) : null;
  }
  const payments = await readLocalPayments();
  return payments.find((payment) => payment.stripeCheckoutSessionId === sessionId) ?? null;
}

async function upsertLocalPayment(record: PaymentRecord): Promise<PaymentRecord> {
  const payments = await readLocalPayments();
  const index = payments.findIndex(
    (payment) =>
      payment.stripeCheckoutSessionId &&
      payment.stripeCheckoutSessionId === record.stripeCheckoutSessionId,
  );
  if (index >= 0) {
    payments[index] = { ...payments[index], ...record, updatedAt: new Date().toISOString() };
  } else {
    payments.unshift(record);
  }
  await mkdir(dataDir, { recursive: true });
  await writeFile(paymentsPath, `${JSON.stringify(payments.slice(0, 500), null, 2)}\n`, "utf8");
  return payments[index >= 0 ? index : 0];
}

async function readLocalPayments(): Promise<PaymentRecord[]> {
  try {
    return JSON.parse(await readFile(paymentsPath, "utf8")) as PaymentRecord[];
  } catch {
    return [];
  }
}

function toRow(record: PaymentRecord) {
  return {
    id: record.id,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    lead_id: record.leadId ?? null,
    customer_email: record.customerEmail ?? null,
    tier: record.tier,
    mode: record.mode,
    status: record.status,
    amount_total: record.amountTotal ?? null,
    currency: record.currency ?? null,
    stripe_checkout_session_id: record.stripeCheckoutSessionId ?? null,
    stripe_customer_id: record.stripeCustomerId ?? null,
    stripe_subscription_id: record.stripeSubscriptionId ?? null,
    stripe_payment_intent_id: record.stripePaymentIntentId ?? null,
  };
}

function fromRow(row: Record<string, unknown>): PaymentRecord {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    leadId: row.lead_id ? String(row.lead_id) : undefined,
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,
    tier: String(row.tier) as PaymentRecord["tier"],
    mode: String(row.mode) as PaymentRecord["mode"],
    status: String(row.status) as PaymentRecord["status"],
    amountTotal: row.amount_total != null ? Number(row.amount_total) : undefined,
    currency: row.currency ? String(row.currency) : undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id
      ? String(row.stripe_checkout_session_id)
      : undefined,
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : undefined,
  };
}
