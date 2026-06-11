import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { trackServerEvent } from "@/lib/analytics";

const allowedEvents = new Set([
  "page_view",
  "cta_click",
  "ava_started",
  "readiness_audit_completed",
  "qualified_lead",
  "booking_started",
  "booking_completed",
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const event = typeof body?.event === "string" ? body.event : "";

  if (!allowedEvents.has(event)) {
    return NextResponse.json({ error: "Unsupported analytics event." }, { status: 400 });
  }

  await trackServerEvent({
    id: randomUUID(),
    event,
    createdAt: new Date().toISOString(),
    payload: typeof body?.payload === "object" && body.payload ? body.payload : {},
  });

  return NextResponse.json({ ok: true });
}
