import { randomUUID } from "node:crypto";
import { trackServerEvent } from "@/lib/analytics";

export type ConversionEventName =
  | "lead_submitted"
  | "qualified_lead"
  | "booking_started"
  | "booking_completed"
  | "client_onboarded";

export type ConversionPayload = {
  eventName: ConversionEventName;
  eventId?: string;
  occurredAt?: string;
  value?: number;
  currency?: string;
  leadId?: string;
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};

export function isOpenAiAdsCapiConfigured() {
  return Boolean(process.env.OPENAI_ADS_API_KEY && process.env.OPENAI_ADS_CAPI_ENDPOINT);
}

export function isOpenAiAdsPixelConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_ID && process.env.NEXT_PUBLIC_OPENAI_ADS_PIXEL_SRC);
}

export async function sendOpenAiAdsConversion(payload: ConversionPayload) {
  const eventId = payload.eventId || randomUUID();
  const occurredAt = payload.occurredAt || new Date().toISOString();

  await trackServerEvent({
    id: eventId,
    event: `openai_ads_${payload.eventName}`,
    createdAt: occurredAt,
    payload: {
      configured: isOpenAiAdsCapiConfigured(),
      leadId: payload.leadId ?? null,
      source: payload.source ?? null,
      value: payload.value ?? null,
      currency: payload.currency ?? null,
      utm: payload.utm ?? {},
    },
  });

  if (!isOpenAiAdsCapiConfigured()) {
    return {
      ok: true,
      configured: false,
      recordedOnly: true,
      eventId,
    };
  }

  const response = await fetch(process.env.OPENAI_ADS_CAPI_ENDPOINT as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_ADS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_name: payload.eventName,
      event_id: eventId,
      occurred_at: occurredAt,
      value: payload.value,
      currency: payload.currency,
      lead_id: payload.leadId,
      source: payload.source,
      utm: payload.utm,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI Ads conversion request failed with ${response.status}.`);
  }

  return {
    ok: true,
    configured: true,
    recordedOnly: false,
    eventId,
  };
}
