"use client";

import Link from "next/link";
import { CreditCard, Gauge, SearchCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { summarizeClientStatus } from "@/lib/platform/dashboard";
import type { LeadRecord } from "@/lib/types";

type LeadsResponse = {
  leads: LeadRecord[];
};

const tierOneUrl = process.env.NEXT_PUBLIC_STRIPE_TIER1_CHECKOUT_URL;
const tierTwoUrl = process.env.NEXT_PUBLIC_STRIPE_TIER2_CHECKOUT_URL;

export default function ClientPortalDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform-leads"],
    queryFn: async () => {
      const response = await fetch("/api/platform/leads");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load your portal.");
      return payload as LeadsResponse;
    },
  });

  const leads = data?.leads ?? [];
  const lead = leads[0];
  const status = summarizeClientStatus(lead);

  return (
    <div className="platformStack">
      <header className="platformHeader">
        <div>
          <p className="platformEyebrow">Client portal</p>
          <h1>{status.heading}</h1>
          <p>
            Track your preparation status, estimated query coverage, payment readiness, and next actions from one
            private workspace.
          </p>
        </div>
        {lead ? (
          <Link href={`/platform/audits/${lead.id}`} className="platformPrimaryLink">
            View audit
          </Link>
        ) : null}
      </header>

      {error ? <p className="platformError">{error.message}</p> : null}

      <section className="platformStatusHero">
        <div>
          <span>{isLoading ? "Loading" : status.verificationLabel}</span>
          <strong>{formatStatus(status.indexReadinessState)}</strong>
          <p>{status.disclaimer}</p>
        </div>
        <SearchCheck aria-hidden="true" />
      </section>

      <section className="platformMetricGrid">
        <Metric label="Estimated query matches" value={String(status.queryMatches)} />
        <Metric label="Estimated opportunities" value={String(status.queryOpportunities)} />
        <Metric label="Readiness score" value={lead ? `${lead.readinessScore}/100` : "Pending"} />
        <Metric label="Selected package" value={formatStatus(status.packageTier)} />
      </section>

      <section className="platformTwoColumn">
        <div className="platformPanel">
          <div className="platformPanelHeader">
            <div>
              <h2>Live visibility status</h2>
              <p>Internal preparation states for campaign launch planning and beta availability review.</p>
            </div>
            <Gauge aria-hidden="true" />
          </div>
          <div className="platformProgressList">
            <Progress label="Offer clarity" value={lead?.readinessScore ?? 35} />
            <Progress label="Tracking readiness" value={lead?.policyReviewRequired ? 42 : 72} />
            <Progress label="Query coverage" value={Math.min(100, status.queryOpportunities * 4)} />
          </div>
        </div>

        <div className="platformPanel">
          <div className="platformPanelHeader">
            <div>
              <h2>Payment modules</h2>
              <p>Use the configured checkout links when your team is ready to move forward.</p>
            </div>
            <CreditCard aria-hidden="true" />
          </div>
          <div className="platformPaymentGrid">
            <PaymentLink label="Tier 1" price="$1,499" href={tierOneUrl} />
            <PaymentLink label="Tier 2" price="$2,450/mo" href={tierTwoUrl} />
          </div>
        </div>
      </section>

      {!isLoading && leads.length === 0 ? (
        <section className="platformPanel">
          <h2>No audit record yet</h2>
          <p>Complete the readiness audit on the public site to populate this client portal.</p>
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

function Progress({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="platformProgressItem">
      <span>
        {label}
        <strong>{safeValue}%</strong>
      </span>
      <i>
        <b style={{ width: `${safeValue}%` }} />
      </i>
    </div>
  );
}

function PaymentLink({ label, price, href }: { label: string; price: string; href?: string }) {
  return (
    <div className="platformPaymentCard">
      <span>{label}</span>
      <strong>{price}</strong>
      {href ? (
        <a className="platformPrimaryLink" href={href}>
          Checkout
        </a>
      ) : (
        <p>Checkout link not configured.</p>
      )}
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}
