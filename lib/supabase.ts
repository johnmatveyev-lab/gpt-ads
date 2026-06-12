import { createClient } from "@supabase/supabase-js";
import type { AgentSessionRecord, BookingRecord, LeadRecord } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && (serviceRoleKey || anonKey));
}

function getServerClient() {
  const key = serviceRoleKey || anonKey;
  if (!supabaseUrl || !key) return null;

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function saveSupabaseLead(lead: LeadRecord) {
  const supabase = getServerClient();
  if (!supabase) return null;

  const query = supabase.from("leads").insert(toLeadRow(lead));
  const { data, error } = serviceRoleKey ? await query.select("*").single() : await query;
  if (error) throw error;
  return data ?? lead;
}

export async function listSupabaseLeads() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin lead listing.");
  }

  const supabase = getServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromLeadRow);
}

export async function updateSupabaseLead(
  leadId: string,
  updates: Partial<Pick<LeadRecord, "status" | "bookingStatus" | "adminNotes" | "lastContactedAt" | "ownerId">>,
) {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin lead updates.");
  }

  const supabase = getServerClient();
  if (!supabase) return null;

  const rowUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status) rowUpdates.status = updates.status;
  if (updates.bookingStatus) rowUpdates.booking_status = updates.bookingStatus;
  if (updates.adminNotes !== undefined) rowUpdates.admin_notes = updates.adminNotes;
  if (updates.lastContactedAt !== undefined) rowUpdates.last_contacted_at = updates.lastContactedAt;
  if (updates.ownerId !== undefined) rowUpdates.owner_id = updates.ownerId;

  const { data, error } = await supabase.from("leads").update(rowUpdates).eq("id", leadId).select("*").single();
  if (error) throw error;
  return fromLeadRow(data);
}

export async function saveSupabaseAgentSession(session: AgentSessionRecord) {
  const supabase = getServerClient();
  if (!supabase) return null;

  const query = supabase
    .from("agent_sessions")
    .insert({
      id: session.id,
      created_at: session.createdAt,
      lead_id: session.leadId ?? null,
      session_id: session.sessionId,
      summary: session.summary,
      readiness_result: session.readinessResult,
      handoff_recommended: session.handoffRecommended,
      policy_review_required: session.policyReviewRequired,
      source: session.source ?? null,
    });
  const { data, error } = serviceRoleKey ? await query.select("*").single() : await query;

  if (error) throw error;
  return data ?? session;
}

export async function saveSupabaseBooking(booking: BookingRecord) {
  const supabase = getServerClient();
  if (!supabase) return null;

  const query = supabase.from("bookings").insert({
    id: booking.id,
    created_at: booking.createdAt,
    lead_id: booking.leadId ?? null,
    provider: booking.provider,
    external_event_id: booking.externalEventId ?? null,
    scheduled_for: booking.scheduledFor ?? null,
    status: booking.status,
  });
  const { data, error } = serviceRoleKey ? await query.select("*").single() : await query;
  if (error) throw error;
  return data ?? booking;
}

function toLeadRow(lead: LeadRecord) {
  return {
    id: lead.id,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
    name: lead.name,
    email: lead.email,
    phone: lead.phone || null,
    owner_id: lead.ownerId || null,
    contact_name: lead.name,
    contact_email: lead.email,
    contact_phone: lead.phone || "",
    niche_industry: lead.businessType,
    target_geography: lead.location,
    business_name: lead.businessName,
    business_type: lead.businessType,
    location: lead.location,
    website_url: lead.websiteUrl || "",
    primary_offer: lead.primaryOffer,
    target_customers: lead.targetCustomers,
    current_channels: lead.currentChannels,
    monthly_ad_budget_range: lead.monthlyAdBudgetRange,
    urgency: lead.urgency,
    consent_to_contact: lead.consentToContact,
    source: lead.source || null,
    utm_source: lead.utmSource || null,
    utm_medium: lead.utmMedium || null,
    utm_campaign: lead.utmCampaign || null,
    utm_content: lead.utmContent || null,
    utm_term: lead.utmTerm || null,
    readiness_score: lead.readinessScore,
    fit_level: lead.fitLevel,
    status: lead.status,
    booking_status: lead.bookingStatus,
    opportunities: lead.opportunities,
    risks: lead.risks,
    recommended_next_step: lead.recommendedNextStep,
    booking_recommended: lead.bookingRecommended,
    policy_review_required: lead.policyReviewRequired,
    agent_summary: lead.agentSummary || null,
    audit_data: lead.auditData || {},
  };
}

function fromLeadRow(row: Record<string, unknown>): LeadRecord {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone ? String(row.phone) : undefined,
    ownerId: row.owner_id ? String(row.owner_id) : undefined,
    businessName: String(row.business_name),
    businessType: String(row.business_type ?? row.niche_industry ?? ""),
    location: String(row.location ?? row.target_geography ?? ""),
    websiteUrl: row.website_url ? String(row.website_url) : undefined,
    primaryOffer: String(row.primary_offer),
    targetCustomers: String(row.target_customers),
    currentChannels: Array.isArray(row.current_channels) ? (row.current_channels as string[]) : [],
    monthlyAdBudgetRange: String(row.monthly_ad_budget_range),
    urgency: String(row.urgency),
    consentToContact: Boolean(row.consent_to_contact),
    source: row.source ? String(row.source) : undefined,
    utmSource: row.utm_source ? String(row.utm_source) : undefined,
    utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
    utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
    utmContent: row.utm_content ? String(row.utm_content) : undefined,
    utmTerm: row.utm_term ? String(row.utm_term) : undefined,
    readinessScore: Number(row.readiness_score ?? 0),
    fitLevel: String(row.fit_level) as LeadRecord["fitLevel"],
    status: normalizeLeadStatus(row.status),
    bookingStatus: String(row.booking_status ?? "not_started") as LeadRecord["bookingStatus"],
    opportunities: Array.isArray(row.opportunities) ? (row.opportunities as string[]) : [],
    risks: Array.isArray(row.risks) ? (row.risks as string[]) : [],
    recommendedNextStep: String(row.recommended_next_step ?? ""),
    bookingRecommended: Boolean(row.booking_recommended),
    policyReviewRequired: Boolean(row.policy_review_required),
    agentSummary: row.agent_summary ? String(row.agent_summary) : undefined,
    adminNotes: row.admin_notes ? String(row.admin_notes) : undefined,
    lastContactedAt: row.last_contacted_at ? String(row.last_contacted_at) : undefined,
    auditData:
      row.audit_data && typeof row.audit_data === "object" ? (row.audit_data as Record<string, unknown>) : undefined,
  };
}

function normalizeLeadStatus(status: unknown): LeadRecord["status"] {
  if (status === "qualified" || status === "review" || status === "booked") return "audit_ready";
  if (status === "closed") return "closed_won";
  if (
    status === "new" ||
    status === "contacted" ||
    status === "audit_ready" ||
    status === "closed_won" ||
    status === "closed_lost"
  ) {
    return status;
  }

  return "new";
}
