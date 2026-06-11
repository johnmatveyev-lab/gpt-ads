import type { LeadRecord } from "@/lib/types";

export function isGoogleOperationalSyncConfigured() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL);
}

export async function syncLeadToGoogleOperations(lead: LeadRecord) {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return { ok: true, configured: false, skipped: true };
  }

  const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      createdAt: lead.createdAt,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      businessName: lead.businessName,
      businessType: lead.businessType,
      location: lead.location,
      readinessScore: lead.readinessScore,
      fitLevel: lead.fitLevel,
      status: lead.status,
      bookingStatus: lead.bookingStatus,
      source: lead.source,
      utmCampaign: lead.utmCampaign,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google operations sync failed with ${response.status}.`);
  }

  return { ok: true, configured: true, skipped: false };
}
