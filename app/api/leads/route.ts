import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { trackServerEvent } from "@/lib/analytics";
import { syncLeadToGoogleOperations } from "@/lib/google-sync";
import { saveLocalLead } from "@/lib/local-store";
import { notifyLead } from "@/lib/notifications";
import { sendOpenAiAdsConversion } from "@/lib/openai-ads-measurement";
import { scoreLead } from "@/lib/scoring";
import { isSupabaseConfigured, saveSupabaseLead } from "@/lib/supabase";
import type { LeadRecord } from "@/lib/types";
import { leadInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please complete the required fields.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const readinessResult = scoreLead(parsed.data);
  const now = new Date().toISOString();
  const lead: LeadRecord = {
    ...parsed.data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...readinessResult,
    status:
      readinessResult.fitLevel === "needs_human_review" || readinessResult.bookingRecommended ? "audit_ready" : "new",
    bookingStatus: "not_started",
  };

  try {
    await trackServerEvent({
      id: randomUUID(),
      event: "readiness_audit_completed",
      createdAt: now,
      payload: {
        fitLevel: readinessResult.fitLevel,
        readinessScore: readinessResult.readinessScore,
        businessType: lead.businessType,
        source: lead.source,
      },
    });

    await safeOpenAiAdsConversion({
      eventName: "lead_submitted",
      eventId: lead.id,
      occurredAt: now,
      leadId: lead.id,
      source: lead.source,
      utm: {
        source: lead.utmSource,
        medium: lead.utmMedium,
        campaign: lead.utmCampaign,
        content: lead.utmContent,
        term: lead.utmTerm,
      },
    });

    if (readinessResult.bookingRecommended) {
      await trackServerEvent({
        id: randomUUID(),
        event: "qualified_lead",
        createdAt: now,
        payload: {
          fitLevel: readinessResult.fitLevel,
          readinessScore: readinessResult.readinessScore,
          businessType: lead.businessType,
        },
      });
      await safeOpenAiAdsConversion({
        eventName: "qualified_lead",
        occurredAt: now,
        leadId: lead.id,
        source: lead.source,
      });
    }

    const notifications = await notifyLead(lead);
    const googleSync = await syncLeadToGoogleOperations(lead).catch((error) => ({
      ok: false,
      configured: true,
      skipped: false,
      error: error instanceof Error ? error.message : "Google operations sync failed.",
    }));

    if (isSupabaseConfigured()) {
      await saveSupabaseLead(lead);
      return NextResponse.json({ lead, readinessResult, storage: "supabase", notifications, googleSync });
    }

    await saveLocalLead(lead);
    return NextResponse.json({ lead, readinessResult, storage: "local-dev", notifications, googleSync });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : typeof error === "object" && error
              ? JSON.stringify(error)
              : "Unable to save lead.",
      },
      { status: 500 },
    );
  }
}

async function safeOpenAiAdsConversion(payload: Parameters<typeof sendOpenAiAdsConversion>[0]) {
  try {
    return await sendOpenAiAdsConversion(payload);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "OpenAI Ads conversion failed.",
    };
  }
}
