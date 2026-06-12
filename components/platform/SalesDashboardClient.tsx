"use client";

import Link from "next/link";
import { ClipboardList, FileSearch, PhoneCall } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupLeadsByStatus, pipelineStatuses } from "@/lib/platform/dashboard";
import type { LeadRecord, LeadStatus } from "@/lib/types";

type LeadsResponse = {
  leads: LeadRecord[];
};

const warmPersonaScripts = [
  "Lead with the business goal: more qualified local demand when ChatGPT Ads availability expands.",
  "Use the readiness score to explain where offer, tracking, and query context are already strong.",
  "Ask for one concrete launch window before moving to package fit.",
];

const counterTactics = [
  "If they ask about guarantees, clarify that availability, review, pricing, and delivery are controlled by OpenAI.",
  "If budget is the objection, compare the fixed audit cost against one month of fragmented test spend.",
  "If timing is vague, offer a readiness audit now and a human review when beta access details are clearer.",
];

export default function SalesDashboardClient() {
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-leads"],
    queryFn: async () => {
      const response = await fetch("/api/platform/leads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load sales dashboard.");
      return payload as LeadsResponse;
    },
  });

  const leads = useMemo(() => data?.leads ?? [], [data?.leads]);
  const grouped = useMemo(() => groupLeadsByStatus(leads), [leads]);
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  const statusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const response = await fetch("/api/platform/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status, markContacted: status === "contacted" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update lead.");
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-leads"] }),
  });

  const auditMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/platform/audits/${leadId}/generate`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to generate audit.");
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-leads"] }),
  });

  return (
    <div className="platformStack">
      <header className="platformHeader">
        <div>
          <p className="platformEyebrow">Sales rep interface</p>
          <h1>High-conversion pipeline</h1>
          <p>Switch fast between active leads, talk tracks, objections, and one-click competitive audit visuals.</p>
        </div>
        <span className="platformStatus">{isLoading ? "Loading" : `${leads.length} assigned leads`}</span>
      </header>

      {error ? <p className="platformError">{error.message}</p> : null}
      {statusMutation.error ? <p className="platformError">{statusMutation.error.message}</p> : null}
      {auditMutation.error ? <p className="platformError">{auditMutation.error.message}</p> : null}

      <section className="platformSalesGrid">
        <div className="platformPipeline">
          {pipelineStatuses.map((status) => (
            <div className="platformPipelineColumn" key={status}>
              <div className="platformPipelineHeader">
                <strong>{status.replace("_", " ")}</strong>
                <span>{grouped[status].length}</span>
              </div>
              {grouped[status].map((lead) => (
                <button
                  type="button"
                  className={lead.id === selectedLead?.id ? "platformLeadCard active" : "platformLeadCard"}
                  onClick={() => setSelectedLeadId(lead.id)}
                  key={lead.id}
                >
                  <strong>{lead.businessName}</strong>
                  <span>{lead.businessType} · {lead.location}</span>
                  <small>{lead.readinessScore}/100 readiness</small>
                </button>
              ))}
            </div>
          ))}
        </div>

        <aside className="platformPlaybookPane">
          <div className="platformPanel">
            <div className="platformPanelHeader">
              <div>
                <h2>Lead data file</h2>
                <p>{selectedLead ? `${selectedLead.name} · ${selectedLead.email}` : "Select a lead to preview."}</p>
              </div>
              <ClipboardList aria-hidden="true" />
            </div>
            {selectedLead ? (
              <div className="platformLeadFacts">
                <span>
                  <strong>Offer</strong>
                  {selectedLead.primaryOffer}
                </span>
                <span>
                  <strong>Target</strong>
                  {selectedLead.targetCustomers}
                </span>
                <span>
                  <strong>Budget</strong>
                  {selectedLead.monthlyAdBudgetRange}
                </span>
                <span>
                  <strong>Next</strong>
                  {selectedLead.recommendedNextStep}
                </span>
              </div>
            ) : null}
          </div>

          <div className="platformPanel">
            <div className="platformPanelHeader">
              <h2>Warm persona scripts</h2>
              <PhoneCall aria-hidden="true" />
            </div>
            <ul className="platformCheckList">
              {warmPersonaScripts.map((script) => (
                <li key={script}>{script}</li>
              ))}
            </ul>
          </div>

          <div className="platformPanel">
            <h2>Friction counter-tactics</h2>
            <ul className="platformCheckList">
              {counterTactics.map((script) => (
                <li key={script}>{script}</li>
              ))}
            </ul>
          </div>

          {selectedLead ? (
            <div className="platformPanel">
              <div className="platformPanelHeader">
                <h2>Closing audit</h2>
                <FileSearch aria-hidden="true" />
              </div>
              <div className="platformActionRow">
                <button
                  type="button"
                  className="platformPrimaryButton"
                  disabled={auditMutation.isPending}
                  onClick={() => auditMutation.mutate(selectedLead.id)}
                >
                  {auditMutation.isPending ? "Generating..." : "Generate audit"}
                </button>
                <Link className="platformGhostButton" href={`/platform/audits/${selectedLead.id}`}>
                  Open detail
                </Link>
              </div>
              <label className="platformForm">
                Move status
                <select
                  value={selectedLead.status}
                  disabled={statusMutation.isPending}
                  onChange={(event) =>
                    statusMutation.mutate({ leadId: selectedLead.id, status: event.target.value as LeadStatus })
                  }
                >
                  {pipelineStatuses.map((status) => (
                    <option value={status} key={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
