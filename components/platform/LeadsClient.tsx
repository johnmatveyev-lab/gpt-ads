"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeadRecord, LeadStatus, ProfileRecord } from "@/lib/types";

const statuses: LeadStatus[] = ["new", "contacted", "audit_ready", "closed_won", "closed_lost"];

export default function LeadsClient({ profile }: { profile: ProfileRecord }) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-leads"],
    queryFn: async () => {
      const response = await fetch("/api/platform/leads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load leads.");
      return payload as { leads: LeadRecord[] };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const response = await fetch("/api/platform/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update lead.");
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform-leads"] }),
  });

  return (
    <section className="platformPanel">
      <div className="platformPanelHeader">
        <div>
          <h1>Lead pipeline</h1>
          <p>Owner sees all leads; sales reps see assigned leads; customers see their own records.</p>
        </div>
        <span>{isLoading ? "Loading" : `${data?.leads.length ?? 0} leads`}</span>
      </div>
      {error ? <p className="platformError">{error.message}</p> : null}
      <div className="platformTable">
        <div className="platformTableHead">
          <span>Business</span>
          <span>Score</span>
          <span>Status</span>
          <span>Next step</span>
        </div>
        {(data?.leads ?? []).map((lead) => (
          <div className="platformTableRow" key={lead.id}>
            <span>
              <Link href={`/platform/audits/${lead.id}`}>
                <strong>{lead.businessName}</strong>
              </Link>
              <small>{lead.name} · {lead.email}</small>
            </span>
            <span>{lead.readinessScore}/100</span>
            <span>
              {profile.role === "customer" ? (
                lead.status.replace("_", " ")
              ) : (
                <select
                  value={lead.status}
                  onChange={(event) => mutation.mutate({ leadId: lead.id, status: event.target.value as LeadStatus })}
                  disabled={mutation.isPending}
                >
                  {statuses.map((status) => (
                    <option value={status} key={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              )}
            </span>
            <span>{lead.recommendedNextStep}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
