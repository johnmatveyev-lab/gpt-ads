export type FitLevel = "high" | "medium" | "low" | "needs_human_review";

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
    status: "new" | "qualified" | "review" | "booked" | "closed";
    bookingStatus: "not_started" | "started" | "booked";
    agentSummary?: string;
    adminNotes?: string;
    lastContactedAt?: string;
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
