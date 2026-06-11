"use client";

import { useState } from "react";
import type { LeadRecord } from "@/lib/types";

export default function AdminLeads() {
  const [token, setToken] = useState("");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Enter the admin token to load leads. In local development, no token is required.");

  async function loadLeads() {
    setStatus("Loading leads...");
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    const response = await fetch(`/api/admin/leads${query}`);
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Unable to load leads.");
      return;
    }

    setLeads(data.leads);
    setStatus(`Loaded ${data.leads.length} lead${data.leads.length === 1 ? "" : "s"} from ${data.storage}.`);
  }

  async function updateLead(updates: Partial<Pick<LeadRecord, "status" | "bookingStatus" | "adminNotes">> & { markContacted?: boolean }) {
    if (!selectedLead) return;
    setSaving(true);
    const response = await fetch(`/api/admin/leads${token ? `?token=${encodeURIComponent(token)}` : ""}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: selectedLead.id, ...updates }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setStatus(data.error || "Unable to update lead.");
      return;
    }

    setSelectedLead(data.lead);
    setLeads((current) => current.map((lead) => (lead.id === data.lead.id ? data.lead : lead)));
    setStatus("Lead updated.");
  }

  const exportUrl = `/api/admin/leads/export${token ? `?token=${encodeURIComponent(token)}` : ""}`;

  return (
    <div>
      <div className="adminControls">
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Admin access token"
          type="password"
        />
        <button type="button" onClick={loadLeads}>
          Load leads
        </button>
        <a href={exportUrl}>Export CSV</a>
      </div>
      <p>{status}</p>
      {selectedLead ? (
        <section className="leadDetail" aria-label="Lead detail">
          <button type="button" onClick={() => setSelectedLead(null)}>
            Close detail
          </button>
          <h2>{selectedLead.businessName}</h2>
          <p>
            {selectedLead.name} · {selectedLead.email} · {selectedLead.location}
          </p>
          <div className="detailGrid">
            <label>
              <strong>Status</strong>
              <select
                value={selectedLead.status}
                onChange={(event) => updateLead({ status: event.target.value as LeadRecord["status"] })}
                disabled={saving}
              >
                <option value="new">new</option>
                <option value="qualified">qualified</option>
                <option value="review">review</option>
                <option value="booked">booked</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <label>
              <strong>Booking status</strong>
              <select
                value={selectedLead.bookingStatus}
                onChange={(event) =>
                  updateLead({ bookingStatus: event.target.value as LeadRecord["bookingStatus"] })
                }
                disabled={saving}
              >
                <option value="not_started">not_started</option>
                <option value="started">started</option>
                <option value="booked">booked</option>
              </select>
            </label>
            <div>
              <strong>Offer</strong>
              <p>{selectedLead.primaryOffer}</p>
            </div>
            <div>
              <strong>Target customers</strong>
              <p>{selectedLead.targetCustomers}</p>
            </div>
            <div>
              <strong>Opportunities</strong>
              <ul>
                {selectedLead.opportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Risks</strong>
              <ul>
                {selectedLead.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <label className="notesField">
              <strong>Admin notes</strong>
              <textarea
                value={selectedLead.adminNotes || ""}
                onChange={(event) => setSelectedLead({ ...selectedLead, adminNotes: event.target.value })}
                placeholder="Add qualification notes, follow-up context, or next action..."
              />
              <span>
                Last contacted: {selectedLead.lastContactedAt ? new Date(selectedLead.lastContactedAt).toLocaleString() : "not marked"}
              </span>
              <div className="detailActions">
                <button type="button" onClick={() => updateLead({ adminNotes: selectedLead.adminNotes || "" })} disabled={saving}>
                  Save notes
                </button>
                <button type="button" onClick={() => updateLead({ markContacted: true })} disabled={saving}>
                  Mark contacted
                </button>
              </div>
            </label>
          </div>
        </section>
      ) : null}

      <table className="leadTable">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Business</th>
            <th>Score</th>
            <th>Status</th>
            <th>Next step</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <button className="textButton" type="button" onClick={() => setSelectedLead(lead)}>
                  View
                </button>
                <br />
                <strong>{lead.name}</strong>
                <br />
                {lead.email}
                {lead.phone ? (
                  <>
                    <br />
                    {lead.phone}
                  </>
                ) : null}
              </td>
              <td>
                <strong>{lead.businessName}</strong>
                <br />
                {lead.businessType}
                <br />
                {lead.location}
              </td>
              <td>
                <span className="scorePill">{lead.readinessScore}/100</span>
                <br />
                {lead.fitLevel.replaceAll("_", " ")}
              </td>
              <td>
                {lead.status}
                <br />
                Booking: {lead.bookingStatus}
                {lead.policyReviewRequired ? (
                  <>
                    <br />
                    Policy review
                  </>
                ) : null}
              </td>
              <td>{lead.recommendedNextStep}</td>
              <td>
                {lead.source || "website"}
                {lead.utmCampaign ? (
                  <>
                    <br />
                    {lead.utmCampaign}
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
