"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { LeadRecord, ProfileRecord } from "@/lib/types";

type LeadsResponse = {
  leads: LeadRecord[];
  profile: ProfileRecord;
};

export default function DashboardClient({ profile }: { profile: ProfileRecord }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-leads"],
    queryFn: async () => {
      const response = await fetch("/api/platform/leads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load leads.");
      return payload as LeadsResponse;
    },
  });

  const leads = data?.leads ?? [];
  const auditReady = leads.filter((lead) => lead.status === "audit_ready").length;
  const booked = leads.filter((lead) => lead.bookingStatus === "booked").length;
  const averageScore = leads.length
    ? Math.round(leads.reduce((total, lead) => total + lead.readinessScore, 0) / leads.length)
    : 0;

  return (
    <div className="platformStack">
      <header className="platformHeader">
        <div>
          <p className="platformEyebrow">Command center</p>
          <h1>{profile.role === "customer" ? "Your ChatGPT Ads readiness" : "Sales automation dashboard"}</h1>
          <p>Track lead quality, audit readiness, booking momentum, and OpenAI Ads setup from one workspace.</p>
        </div>
        <Link href="/platform/leads" className="platformPrimaryLink">
          View pipeline
        </Link>
      </header>

      <section className="platformMetricGrid">
        <Metric label="Visible leads" value={isLoading ? "..." : String(leads.length)} />
        <Metric label="Audit ready" value={String(auditReady)} />
        <Metric label="Booked" value={String(booked)} />
        <Metric label="Avg. score" value={`${averageScore}/100`} />
      </section>

      {error ? <p className="platformError">{error.message}</p> : null}

      <section className="platformPanel">
        <div className="platformPanelHeader">
          <h2>Recent readiness activity</h2>
          <span>{profile.role.replace("_", " ")}</span>
        </div>
        <div className="platformList">
          {leads.slice(0, 6).map((lead) => (
            <Link className="platformListRow" href={`/platform/audits/${lead.id}`} key={lead.id}>
              <span>
                <strong>{lead.businessName}</strong>
                <small>{lead.businessType} · {lead.location}</small>
              </span>
              <span>{lead.readinessScore}/100</span>
              <span>{lead.status.replace("_", " ")}</span>
            </Link>
          ))}
          {!isLoading && leads.length === 0 ? <p>No platform-visible leads yet.</p> : null}
        </div>
      </section>
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
