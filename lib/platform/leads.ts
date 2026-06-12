import type { ApiIntegrationRecord, LeadRecord } from "@/lib/types";

export function fromPlatformLeadRow(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    name: String(row.name ?? row.contact_name),
    email: String(row.email ?? row.contact_email),
    phone: row.phone || row.contact_phone ? String(row.phone ?? row.contact_phone) : undefined,
    businessName: String(row.business_name),
    businessType: String(row.business_type ?? row.niche_industry),
    location: String(row.location ?? row.target_geography),
    websiteUrl: row.website_url ? String(row.website_url) : undefined,
    primaryOffer: String(row.primary_offer ?? ""),
    targetCustomers: String(row.target_customers ?? ""),
    currentChannels: Array.isArray(row.current_channels) ? (row.current_channels as string[]) : [],
    monthlyAdBudgetRange: String(row.monthly_ad_budget_range ?? ""),
    urgency: String(row.urgency ?? ""),
    consentToContact: Boolean(row.consent_to_contact),
    source: row.source ? String(row.source) : undefined,
    utmSource: row.utm_source ? String(row.utm_source) : undefined,
    utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
    utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
    utmContent: row.utm_content ? String(row.utm_content) : undefined,
    utmTerm: row.utm_term ? String(row.utm_term) : undefined,
    readinessScore: Number(row.readiness_score ?? 0),
    fitLevel: String(row.fit_level ?? "low") as LeadRecord["fitLevel"],
    opportunities: Array.isArray(row.opportunities) ? (row.opportunities as string[]) : [],
    risks: Array.isArray(row.risks) ? (row.risks as string[]) : [],
    recommendedNextStep: String(row.recommended_next_step ?? ""),
    bookingRecommended: Boolean(row.booking_recommended),
    policyReviewRequired: Boolean(row.policy_review_required),
    status: String(row.status ?? "new") as LeadRecord["status"],
    bookingStatus: String(row.booking_status ?? "not_started") as LeadRecord["bookingStatus"],
    auditData:
      row.audit_data && typeof row.audit_data === "object" ? (row.audit_data as Record<string, unknown>) : {},
    agentSummary: row.agent_summary ? String(row.agent_summary) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    lastContactedAt: row.last_contacted_at ? String(row.last_contacted_at) : undefined,
  };
}

export function fromIntegrationRow(row: Record<string, unknown>): ApiIntegrationRecord {
  return {
    id: String(row.id),
    ownerProfileId: String(row.owner_profile_id),
    networkName: String(row.network_name) as ApiIntegrationRecord["networkName"],
    environment: String(row.environment ?? "production") as ApiIntegrationRecord["environment"],
    accountId: String(row.account_id),
    parameters:
      row.parameters && typeof row.parameters === "object" && !Array.isArray(row.parameters)
        ? (row.parameters as Record<string, unknown>)
        : {},
    status: String(row.status ?? (row.is_active ? "configured" : "inactive")) as ApiIntegrationRecord["status"],
    isActive: Boolean(row.is_active),
    lastVerifiedAt: row.last_verified_at ? String(row.last_verified_at) : undefined,
    updatedAt: String(row.updated_at),
  };
}
