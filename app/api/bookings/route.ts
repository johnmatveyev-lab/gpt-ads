import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { trackServerEvent } from "@/lib/analytics";
import { saveLocalBooking } from "@/lib/local-store";
import { sendOpenAiAdsConversion } from "@/lib/openai-ads-measurement";
import { isSupabaseConfigured, saveSupabaseBooking } from "@/lib/supabase";
import type { BookingRecord } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const booking: BookingRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    leadId: typeof body.leadId === "string" ? body.leadId : undefined,
    provider: "external_link",
    status: "started",
  };

  await trackServerEvent({
    id: booking.id,
    event: "booking_started",
    createdAt: booking.createdAt,
    payload: {
      leadId: booking.leadId ?? null,
      provider: booking.provider,
    },
  });
  await sendOpenAiAdsConversion({
    eventName: "booking_started",
    eventId: booking.id,
    occurredAt: booking.createdAt,
    leadId: booking.leadId,
  }).catch(() => undefined);

  if (isSupabaseConfigured()) {
    await saveSupabaseBooking(booking);
  } else {
    await saveLocalBooking(booking);
  }

  return NextResponse.json({
    status: booking.status,
    bookingUrl: process.env.BOOKING_URL || "https://cal.com",
    leadId: booking.leadId ?? null,
    bookingId: booking.id,
  });
}
