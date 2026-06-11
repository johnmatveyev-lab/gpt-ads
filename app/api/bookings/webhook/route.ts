import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics";
import { saveLocalBooking } from "@/lib/local-store";
import { sendOpenAiAdsConversion } from "@/lib/openai-ads-measurement";
import { isSupabaseConfigured, saveSupabaseBooking } from "@/lib/supabase";
import type { BookingRecord } from "@/lib/types";

export async function POST(request: Request) {
  const secret = process.env.BOOKING_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-booking-secret");

  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: "Invalid booking webhook secret." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const status = normalizeStatus(body.status);
  const createdAt = new Date().toISOString();
  const booking: BookingRecord = {
    id: randomUUID(),
    createdAt,
    leadId: typeof body.leadId === "string" ? body.leadId : undefined,
    provider: normalizeProvider(body.provider),
    externalEventId: typeof body.externalEventId === "string" ? body.externalEventId : undefined,
    scheduledFor: typeof body.scheduledFor === "string" ? body.scheduledFor : undefined,
    status,
  };

  await trackServerEvent({
    id: randomUUID(),
    event: status === "completed" ? "booking_completed" : "booking_started",
    createdAt,
    payload: {
      leadId: booking.leadId ?? null,
      provider: booking.provider,
      externalEventId: booking.externalEventId ?? null,
      scheduledFor: booking.scheduledFor ?? null,
      status,
    },
  });
  await sendOpenAiAdsConversion({
    eventName: status === "completed" ? "booking_completed" : "booking_started",
    eventId: booking.id,
    occurredAt: createdAt,
    leadId: booking.leadId,
  }).catch(() => undefined);

  if (isSupabaseConfigured()) {
    await saveSupabaseBooking(booking);
  } else {
    await saveLocalBooking(booking);
  }

  return NextResponse.json({ ok: true, booking });
}

function normalizeStatus(value: unknown): BookingRecord["status"] {
  if (value === "booked" || value === "cancelled" || value === "completed") return value;
  return "booked";
}

function normalizeProvider(value: unknown): BookingRecord["provider"] {
  if (value === "cal" || value === "calendly" || value === "google_calendar") return value;
  return "external_link";
}
