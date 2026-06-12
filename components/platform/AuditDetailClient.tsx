"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { LeadRecord, ProfileRecord } from "@/lib/types";
import { auditUpdateSchema } from "@/lib/validation";

type AuditInput = z.infer<typeof auditUpdateSchema>;
type AuditFormInput = z.input<typeof auditUpdateSchema>;

export default function AuditDetailClient({ leadId, profile }: { leadId: string; profile: ProfileRecord }) {
  const queryClient = useQueryClient();
  const { data, error } = useQuery({
    queryKey: ["platform-audit", leadId],
    queryFn: async () => {
      const response = await fetch(`/api/platform/audits/${leadId}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load audit.");
      return payload as { lead: LeadRecord };
    },
  });

  const form = useForm<AuditFormInput, unknown, AuditInput>({
    resolver: zodResolver(auditUpdateSchema),
    defaultValues: {
      auditData: {
        visibilityMetrics: {},
        opportunities: [],
        risks: [],
        nextAction: "",
      },
    },
  });

  useEffect(() => {
    if (!data?.lead) return;

    form.reset({
      auditData: {
        visibilityMetrics: data.lead.auditData?.visibilityMetrics as AuditInput["auditData"]["visibilityMetrics"],
        opportunities: data.lead.opportunities,
        risks: data.lead.risks,
        nextAction: data.lead.recommendedNextStep,
      },
    });
  }, [data?.lead, form]);

  const mutation = useMutation({
    mutationFn: async (values: AuditInput) => {
      const response = await fetch(`/api/platform/audits/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save audit.");
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-audit", leadId] }),
  });

  const lead = data?.lead;
  const competitorAudit = getCompetitorAudit(lead?.auditData);

  return (
    <div className="platformStack">
      {error ? <p className="platformError">{error.message}</p> : null}
      {lead ? (
        <section className="platformPanel">
          <div className="platformPanelHeader">
            <div>
              <h1>{lead.businessName}</h1>
              <p>{lead.businessType} · {lead.location} · {lead.email}</p>
            </div>
            <strong>{lead.readinessScore}/100</strong>
          </div>
          <div className="platformMetricGrid">
            <Metric label="Fit" value={lead.fitLevel.replace("_", " ")} />
            <Metric label="Status" value={lead.status.replace("_", " ")} />
            <Metric label="Booking" value={lead.bookingStatus.replace("_", " ")} />
            <Metric label="Policy review" value={lead.policyReviewRequired ? "Required" : "Not flagged"} />
          </div>
        </section>
      ) : null}

      <section className="platformPanel">
        <h2>Audit data</h2>
        {profile.role === "customer" ? (
          <p>Audit edits are handled by the GPT Ads team. Your current readiness details are visible above.</p>
        ) : (
          <form className="platformForm" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <label>
              Impressions
              <input type="number" {...form.register("auditData.visibilityMetrics.impressions")} />
            </label>
            <label>
              Clicks
              <input type="number" {...form.register("auditData.visibilityMetrics.clicks")} />
            </label>
            <label>
              Spend
              <input type="number" step="0.01" {...form.register("auditData.visibilityMetrics.spend")} />
            </label>
            <label>
              Next action
              <textarea {...form.register("auditData.nextAction")} />
            </label>
            {mutation.error ? <p className="platformError">{mutation.error.message}</p> : null}
            <button className="platformPrimaryButton" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save audit"}
            </button>
          </form>
        )}
      </section>

      {competitorAudit ? (
        <section className="platformPanel">
          <div className="platformPanelHeader">
            <div>
              <h2>Competitor indexing comparison</h2>
              <p>{competitorAudit.summary}</p>
            </div>
            <span>{new Date(competitorAudit.generatedAt).toLocaleDateString()}</span>
          </div>
          <div className="platformIntegrationGrid">
            {competitorAudit.competitors.map((competitor) => (
              <div className="platformIntegrationCard" key={competitor.domain}>
                <span>{competitor.domain}</span>
                <strong>{competitor.visibilityScore}/100</strong>
                <small>{competitor.name}</small>
                <small>{competitor.positioning}</small>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="platformMetric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type CompetitorAuditView = {
  generatedAt: string;
  summary: string;
  competitors: Array<{
    name: string;
    domain: string;
    visibilityScore: number;
    positioning: string;
  }>;
};

function getCompetitorAudit(auditData: LeadRecord["auditData"]): CompetitorAuditView | null {
  const value = auditData?.competitorAudit;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.generatedAt !== "string" || typeof record.summary !== "string") return null;
  if (!Array.isArray(record.competitors)) return null;

  const competitors = record.competitors.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const competitor = item as Record<string, unknown>;
    if (
      typeof competitor.name !== "string" ||
      typeof competitor.domain !== "string" ||
      typeof competitor.visibilityScore !== "number" ||
      typeof competitor.positioning !== "string"
    ) {
      return [];
    }

    return [
      {
        name: competitor.name,
        domain: competitor.domain,
        visibilityScore: competitor.visibilityScore,
        positioning: competitor.positioning,
      },
    ];
  });

  return {
    generatedAt: record.generatedAt,
    summary: record.summary,
    competitors,
  };
}
