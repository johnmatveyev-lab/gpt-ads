"use client";

import { Activity, KeyRound, Timer, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import IntegrationClient from "@/components/platform/IntegrationClient";
import { calculateOwnerMetrics } from "@/lib/platform/dashboard";
import type { ApiIntegrationRecord, LeadRecord, ProfileRecord } from "@/lib/types";

type LeadsResponse = {
  leads: LeadRecord[];
};

type IntegrationsResponse = {
  integrations: ApiIntegrationRecord[];
};

const networkLabels: Record<string, string> = {
  google: "Google Ads API v17+",
  facebook: "Meta/Facebook Graph API v20.0+",
  tiktok: "TikTok Marketing API v1.3+",
  openai: "OpenAI Ads Platform Beta Adapter",
};

export default function OwnerDashboardClient({ profile }: { profile: ProfileRecord }) {
  const leadsQuery = useQuery({
    queryKey: ["platform-leads"],
    queryFn: async () => {
      const response = await fetch("/api/platform/leads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load owner metrics.");
      return payload as LeadsResponse;
    },
  });

  const integrationsQuery = useQuery({
    queryKey: ["platform-integrations"],
    queryFn: async () => {
      const response = await fetch("/api/platform/integrations");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load integrations.");
      return payload as IntegrationsResponse;
    },
  });

  const leads = leadsQuery.data?.leads ?? [];
  const integrations = integrationsQuery.data?.integrations ?? [];
  const metrics = calculateOwnerMetrics(leads);

  return (
    <div className="platformStack">
      <header className="platformHeader">
        <div>
          <p className="platformEyebrow">System owner control hub</p>
          <h1>Platform performance overview</h1>
          <p>Monitor conversion ratios, representative velocity, and production integration readiness.</p>
        </div>
        <span className="platformStatus">{leadsQuery.isLoading ? "Loading" : `${metrics.totalLeads} total leads`}</span>
      </header>

      {leadsQuery.error ? <p className="platformError">{leadsQuery.error.message}</p> : null}
      {integrationsQuery.error ? <p className="platformError">{integrationsQuery.error.message}</p> : null}

      <section className="platformMetricGrid">
        <Metric icon={<TrendingUp aria-hidden="true" />} label="Audit-ready rate" value={`${metrics.auditReadyRate}%`} />
        <Metric icon={<Activity aria-hidden="true" />} label="Booking rate" value={`${metrics.bookingRate}%`} />
        <Metric icon={<KeyRound aria-hidden="true" />} label="Close rate" value={`${metrics.closeRate}%`} />
        <Metric icon={<Timer aria-hidden="true" />} label="Close velocity" value={metrics.closeVelocityLabel} />
      </section>

      <section className="platformPanel">
        <div className="platformPanelHeader">
          <div>
            <h2>Unified ad network integration API grid</h2>
            <p>Credential status is owner-only. Secrets are encrypted server-side and never returned to the browser.</p>
          </div>
          <KeyRound aria-hidden="true" />
        </div>
        <div className="platformIntegrationGrid">
          {["google", "facebook", "tiktok", "openai"].map((network) => {
            const integration = integrations.find((item) => item.networkName === network);
            return (
              <div className="platformIntegrationCard" key={network}>
                <span>{networkLabels[network]}</span>
                <strong>{integration ? integration.status.replace("_", " ") : "not configured"}</strong>
                <small>
                  {integration
                    ? `${integration.environment} · ${integration.accountId}`
                    : network === "openai"
                      ? "Adapter-ready until verified endpoint access exists"
                      : "Credential vault ready"}
                </small>
              </div>
            );
          })}
        </div>
      </section>

      <IntegrationClient profile={profile} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="platformMetric platformMetricWithIcon">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
