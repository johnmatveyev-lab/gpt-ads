import { describe, expect, it } from "vitest";
import type { LeadRecord } from "@/lib/types";
import {
  buildCompetitorAudit,
  calculateOwnerMetrics,
  getDashboardPathForRole,
  groupLeadsByStatus,
  summarizeClientStatus,
} from "@/lib/platform/dashboard";

const baseLead: LeadRecord = {
  id: "lead-1",
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-06-02T12:00:00.000Z",
  name: "Dana Lee",
  email: "dana@example.com",
  businessName: "Atlas Roofing",
  businessType: "Roofing",
  location: "Austin, TX",
  websiteUrl: "https://atlas.example",
  primaryOffer: "Roof replacement consultations",
  targetCustomers: "Homeowners with storm damage",
  currentChannels: ["google", "meta"],
  monthlyAdBudgetRange: "$2,500-$5,000",
  urgency: "This month",
  consentToContact: true,
  readinessScore: 82,
  fitLevel: "high",
  opportunities: ["Storm-damage quote intent"],
  risks: ["Tracking needs verification"],
  recommendedNextStep: "Book a launch-readiness call.",
  bookingRecommended: true,
  policyReviewRequired: false,
  status: "audit_ready",
  bookingStatus: "booked",
  auditData: {},
};

describe("platform dashboard helpers", () => {
  it("routes each platform role to its dedicated dashboard", () => {
    expect(getDashboardPathForRole("customer")).toBe("/platform/client");
    expect(getDashboardPathForRole("sales_rep")).toBe("/platform/sales");
    expect(getDashboardPathForRole("owner")).toBe("/platform/owner");
  });

  it("calculates owner metrics for empty and populated lead sets", () => {
    expect(calculateOwnerMetrics([])).toMatchObject({
      totalLeads: 0,
      auditReadyRate: 0,
      bookingRate: 0,
      closeRate: 0,
      averageReadinessScore: 0,
      closeVelocityLabel: "Unavailable",
    });

    const metrics = calculateOwnerMetrics([
      baseLead,
      { ...baseLead, id: "lead-2", readinessScore: 68, status: "closed_won", bookingStatus: "not_started" },
      { ...baseLead, id: "lead-3", readinessScore: 30, status: "new", bookingStatus: "not_started" },
    ]);

    expect(metrics).toMatchObject({
      totalLeads: 3,
      auditReadyRate: 67,
      bookingRate: 33,
      closeRate: 33,
      averageReadinessScore: 60,
    });
  });

  it("groups sales leads by pipeline status", () => {
    const grouped = groupLeadsByStatus([
      baseLead,
      { ...baseLead, id: "lead-2", status: "new" },
      { ...baseLead, id: "lead-3", status: "closed_lost" },
    ]);

    expect(grouped.new.map((lead) => lead.id)).toEqual(["lead-2"]);
    expect(grouped.audit_ready.map((lead) => lead.id)).toEqual(["lead-1"]);
    expect(grouped.closed_lost.map((lead) => lead.id)).toEqual(["lead-3"]);
    expect(grouped.contacted).toEqual([]);
  });

  it("summarizes client index-readiness without guaranteeing placement", () => {
    const status = summarizeClientStatus({
      ...baseLead,
      auditData: {
        clientStatus: {
          indexReadinessState: "pending_beta_verification",
          verificationLabel: "Pending Beta Verification",
          queryMatches: 14,
          queryOpportunities: 22,
          packageTier: "tier_1",
        },
      },
    });

    expect(status.heading).toBe("AI Conversational Index Status");
    expect(status.verificationLabel).toBe("Pending Beta Verification");
    expect(status.queryMatches).toBe(14);
    expect(status.queryOpportunities).toBe(22);
    expect(status.disclaimer).toContain("readiness signal");
    expect(status.disclaimer).not.toMatch(/guarantee/i);
  });

  it("builds deterministic competitor audit comparisons from lead context", () => {
    const audit = buildCompetitorAudit(baseLead);
    const secondAudit = buildCompetitorAudit(baseLead);

    expect(audit.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(audit.industry).toBe("Roofing");
    expect(audit.location).toBe("Austin, TX");
    expect(audit.competitors).toHaveLength(3);
    expect(audit.competitors[0].visibilityScore).toBe(secondAudit.competitors[0].visibilityScore);
    expect(audit.summary).toContain("estimated");
  });
});
