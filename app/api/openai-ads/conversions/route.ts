import { NextResponse } from "next/server";
import { sendOpenAiAdsConversion, type ConversionEventName } from "@/lib/openai-ads-measurement";

const allowedEvents = new Set<ConversionEventName>([
  "lead_submitted",
  "qualified_lead",
  "booking_started",
  "booking_completed",
  "client_onboarded",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventName = body?.eventName as ConversionEventName;

  if (!allowedEvents.has(eventName)) {
    return NextResponse.json({ error: "Unsupported OpenAI Ads conversion event." }, { status: 400 });
  }

  try {
    const result = await sendOpenAiAdsConversion({
      eventName,
      eventId: typeof body.eventId === "string" ? body.eventId : undefined,
      occurredAt: typeof body.occurredAt === "string" ? body.occurredAt : undefined,
      value: typeof body.value === "number" ? body.value : undefined,
      currency: typeof body.currency === "string" ? body.currency : undefined,
      leadId: typeof body.leadId === "string" ? body.leadId : undefined,
      source: typeof body.source === "string" ? body.source : undefined,
      utm: typeof body.utm === "object" && body.utm ? body.utm : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send OpenAI Ads conversion." },
      { status: 500 },
    );
  }
}
