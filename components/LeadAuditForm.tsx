"use client";

import { useMemo, useState } from "react";
import type { LeadInput, ReadinessResult } from "@/lib/types";

const channels = ["Google Ads", "Meta Ads", "SEO", "Local Services Ads", "Email", "None yet"];

const initialForm: LeadInput = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  businessType: "",
  location: "",
  websiteUrl: "",
  primaryOffer: "",
  targetCustomers: "",
  currentChannels: [],
  monthlyAdBudgetRange: "$1,000-$2,500/mo",
  urgency: "This month",
  consentToContact: false,
};

export default function LeadAuditForm({ bookingUrl }: { bookingUrl: string }) {
  const [form, setForm] = useState<LeadInput>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ReadinessResult | null>(null);

  const utms = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get("source") || "website",
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmContent: params.get("utm_content") || undefined,
      utmTerm: params.get("utm_term") || undefined,
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    setResult(null);

    const payload = { ...form, ...utms };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lead submission failed.");

      setResult(data.readinessResult);
      setStatus("success");
      setMessage("Your readiness audit is ready. We also saved the lead for admin review.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  function updateField<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleChannel(channel: string) {
    setForm((current) => ({
      ...current,
      currentChannels: current.currentChannels.includes(channel)
        ? current.currentChannels.filter((item) => item !== channel)
        : [...current.currentChannels, channel],
    }));
  }

  return (
    <form className="auditForm" onSubmit={handleSubmit}>
      <div className="formGrid">
        <label className="field">
          <span>Your name</span>
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </label>
        <label className="field">
          <span>Business name</span>
          <input
            value={form.businessName}
            onChange={(event) => updateField("businessName", event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Business type</span>
          <input
            value={form.businessType}
            onChange={(event) => updateField("businessType", event.target.value)}
            placeholder="Roofing, med spa, restaurant..."
            required
          />
        </label>
        <label className="field">
          <span>Location served</span>
          <input
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Miami, FL"
            required
          />
        </label>
        <label className="fullField">
          <span>Website URL</span>
          <input
            type="url"
            value={form.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
            placeholder="https://example.com"
          />
        </label>
        <label className="fullField">
          <span>Primary offer</span>
          <textarea
            value={form.primaryOffer}
            onChange={(event) => updateField("primaryOffer", event.target.value)}
            placeholder="What do you want new customers to buy, book, or request?"
            required
          />
        </label>
        <label className="fullField">
          <span>Target customers</span>
          <textarea
            value={form.targetCustomers}
            onChange={(event) => updateField("targetCustomers", event.target.value)}
            placeholder="Who is the best-fit customer and what are they trying to solve?"
            required
          />
        </label>
        <fieldset className="channelGroup">
          <legend>Current marketing channels</legend>
          <div className="checkboxGrid">
            {channels.map((channel) => (
              <label key={channel}>
                <input
                  type="checkbox"
                  checked={form.currentChannels.includes(channel)}
                  onChange={() => toggleChannel(channel)}
                />
                {channel}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Monthly ad budget</span>
          <select
            value={form.monthlyAdBudgetRange}
            onChange={(event) => updateField("monthlyAdBudgetRange", event.target.value)}
          >
            <option>$500-$1,000/mo</option>
            <option>$1,000-$2,500/mo</option>
            <option>$2,500-$5,000/mo</option>
            <option>$5,000-$10,000/mo</option>
            <option>$10,000+/mo</option>
          </select>
        </label>
        <label className="field">
          <span>Urgency</span>
          <select value={form.urgency} onChange={(event) => updateField("urgency", event.target.value)}>
            <option>This week</option>
            <option>This month</option>
            <option>Next 60 days</option>
            <option>Just researching</option>
          </select>
        </label>
        <label className="consent">
          <input
            type="checkbox"
            checked={form.consentToContact}
            onChange={(event) => updateField("consentToContact", event.target.checked)}
            required
          />
          I agree to be contacted about my ChatGPT Ads readiness audit. I understand this service is
          independent unless verified partnership proof is explicitly stated.
        </label>
        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Scoring readiness..." : "Get My Readiness Audit"}
        </button>

        {status !== "idle" && message ? (
          <div className={`formStatus ${status === "error" ? "error" : "success"}`}>
            <strong>{message}</strong>
            {result ? (
              <div>
                <p>
                  Score: {result.readinessScore}/100. Fit: {result.fitLevel.replaceAll("_", " ")}.
                </p>
                <p>{result.recommendedNextStep}</p>
                {result.bookingRecommended ? (
                  <p>
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        fetch("/api/bookings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ source: "readiness-audit" }),
                          keepalive: true,
                        }).catch(() => undefined);
                      }}
                    >
                      Book your launch-readiness call
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
