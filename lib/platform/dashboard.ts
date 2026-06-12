import type { LeadRecord, LeadStatus, UserRole } from "@/lib/types";

export const pipelineStatuses: LeadStatus[] = ["new", "contacted", "audit_ready", "closed_won", "closed_lost"];

export type ClientIndexStatus = {
  heading: "AI Conversational Index Status";
  indexReadinessState: string;
  verificationLabel: string;
  queryMatches: number;
  queryOpportunities: number;
  packageTier: string;
  disclaimer: string;
};

export type OwnerMetrics = {
  totalLeads: number;
  auditReadyRate: number;
  bookingRate: number;
  closeRate: number;
  averageReadinessScore: number;
  closeVelocityLabel: string;
};

export type CompetitorAudit = {
  generatedAt: string;
  industry: string;
  location: string;
  summary: string;
  competitors: Array<{
    name: string;
    domain: string;
    visibilityScore: number;
    queryCoverage: number;
    positioning: string;
  }>;
};

export function getDashboardPathForRole(role: UserRole) {
  if (role === "owner") return "/platform/owner";
  if (role === "sales_rep") return "/platform/sales";
  return "/platform/client";
}

export function groupLeadsByStatus(leads: LeadRecord[]) {
  return pipelineStatuses.reduce(
    (groups, status) => {
      groups[status] = leads.filter((lead) => lead.status === status);
      return groups;
    },
    {} as Record<LeadStatus, LeadRecord[]>,
  );
}

export function calculateOwnerMetrics(leads: LeadRecord[]): OwnerMetrics {
  if (leads.length === 0) {
    return {
      totalLeads: 0,
      auditReadyRate: 0,
      bookingRate: 0,
      closeRate: 0,
      averageReadinessScore: 0,
      closeVelocityLabel: "Unavailable",
    };
  }

  const auditReady = leads.filter((lead) => lead.status === "audit_ready" || lead.status === "closed_won").length;
  const booked = leads.filter((lead) => lead.bookingStatus === "booked").length;
  const closedWon = leads.filter((lead) => lead.status === "closed_won").length;
  const averageReadinessScore = Math.round(
    leads.reduce((total, lead) => total + lead.readinessScore, 0) / leads.length,
  );

  return {
    totalLeads: leads.length,
    auditReadyRate: percentage(auditReady, leads.length),
    bookingRate: percentage(booked, leads.length),
    closeRate: percentage(closedWon, leads.length),
    averageReadinessScore,
    closeVelocityLabel: calculateCloseVelocityLabel(leads),
  };
}

export function summarizeClientStatus(lead?: LeadRecord): ClientIndexStatus {
  const clientStatus = getRecord(lead?.auditData?.clientStatus);
  const estimatedMatches = lead ? Math.max(3, Math.round(lead.readinessScore / 6)) : 0;
  const estimatedOpportunities = lead ? Math.max(estimatedMatches + 4, Math.round(lead.readinessScore / 4)) : 0;

  return {
    heading: "AI Conversational Index Status",
    indexReadinessState: getString(clientStatus.indexReadinessState, "pending_beta_verification"),
    verificationLabel: getString(clientStatus.verificationLabel, "Pending Beta Verification"),
    queryMatches: getNumber(clientStatus.queryMatches, estimatedMatches),
    queryOpportunities: getNumber(clientStatus.queryOpportunities, estimatedOpportunities),
    packageTier: getString(clientStatus.packageTier, "unselected"),
    disclaimer:
      "This is an internal readiness signal based on available audit data, platform availability, and campaign preparation status.",
  };
}

export function buildCompetitorAudit(lead: LeadRecord, generatedAt = new Date().toISOString()): CompetitorAudit {
  const seed = hash(`${lead.businessName}|${lead.businessType}|${lead.location}|${lead.websiteUrl || ""}`);
  const industry = lead.businessType || "Local services";
  const location = lead.location || "Target market";
  const baseNames = [
    `Leading ${industry} Provider`,
    `${location.split(",")[0]} Search Competitor`,
    `High-Intent ${industry} Brand`,
  ];

  return {
    generatedAt,
    industry,
    location,
    summary: `Generated estimated competitor indexing signals for ${industry} in ${location}. Replace with live network/search data after account access is verified.`,
    competitors: baseNames.map((name, index) => {
      const score = 48 + ((seed + index * 17) % 39);
      return {
        name,
        domain: `competitor-${index + 1}.example`,
        visibilityScore: score,
        queryCoverage: Math.max(12, score - 18),
        positioning:
          index === 0
            ? "Strong local-intent coverage"
            : index === 1
              ? "Broader category visibility"
              : "Offer clarity gap visible in comparison",
      };
    }),
  };
}

function calculateCloseVelocityLabel(leads: LeadRecord[]) {
  const closed = leads.filter((lead) => lead.status === "closed_won");
  if (closed.length === 0) return "Unavailable";

  const averageDays =
    closed.reduce((total, lead) => {
      const created = new Date(lead.createdAt).getTime();
      const updated = new Date(lead.updatedAt).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(updated) || updated < created) return total;
      return total + Math.max(1, Math.round((updated - created) / 86_400_000));
    }, 0) / closed.length;

  if (!Number.isFinite(averageDays) || averageDays <= 0) return "Unavailable";
  return `${Math.round(averageDays)} days avg`;
}

function percentage(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output * 31 + value.charCodeAt(index)) % 100_000;
  }
  return output;
}
