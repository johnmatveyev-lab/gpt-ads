export type FitLevel = "high" | "medium" | "low" | "needs_human_review";
export type UserRole = "owner" | "sales_rep" | "customer";
export type LeadStatus = "new" | "contacted" | "audit_ready" | "closed_won" | "closed_lost";
export type AdNetworkName = "openai" | "google" | "facebook" | "tiktok";
export type IntegrationEnvironment = "sandbox" | "production";
export type IntegrationStatus = "configured" | "needs_review" | "verified" | "inactive";

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  businessType: string;
  location: string;
  websiteUrl?: string;
  primaryOffer: string;
  targetCustomers: string;
  currentChannels: string[];
  monthlyAdBudgetRange: string;
  urgency: string;
  consentToContact: boolean;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

export type ReadinessResult = {
  fitLevel: FitLevel;
  readinessScore: number;
  opportunities: string[];
  risks: string[];
  recommendedNextStep: string;
  bookingRecommended: boolean;
  policyReviewRequired: boolean;
};

export type LeadRecord = LeadInput &
  ReadinessResult & {
    id: string;
    createdAt: string;
    updatedAt: string;
    ownerId?: string;
    status: LeadStatus;
    bookingStatus: "not_started" | "started" | "booked";
    auditData?: Record<string, unknown>;
    agentSummary?: string;
    adminNotes?: string;
    lastContactedAt?: string;
  };

export type ProfileRecord = {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type ApiIntegrationRecord = {
  id: string;
  ownerProfileId: string;
  networkName: AdNetworkName;
  environment: IntegrationEnvironment;
  accountId: string;
  parameters: Record<string, unknown>;
  status: IntegrationStatus;
  isActive: boolean;
  lastVerifiedAt?: string;
  updatedAt: string;
};

export type BookingRecord = {
  id: string;
  createdAt: string;
  leadId?: string;
  provider: "external_link" | "cal" | "calendly" | "google_calendar";
  externalEventId?: string;
  scheduledFor?: string;
  status: "started" | "booked" | "cancelled" | "completed";
};

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentSessionRecord = {
  id: string;
  createdAt: string;
  leadId?: string;
  sessionId: string;
  summary: string;
  readinessResult: ReadinessResult;
  handoffRecommended: boolean;
  policyReviewRequired: boolean;
  source?: string;
};
