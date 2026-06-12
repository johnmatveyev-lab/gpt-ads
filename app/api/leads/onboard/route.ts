import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const leadSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  websiteUrl: z.string().trim().url().max(300),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(180),
  contactPhone: z.string().trim().min(7).max(40),
  nicheIndustry: z.string().trim().min(2).max(120),
  targetGeography: z.string().trim().min(2).max(160),
});

const reviewRequiredTerms = [
  "health",
  "medical",
  "doctor",
  "clinic",
  "law",
  "legal",
  "attorney",
  "finance",
  "loan",
  "credit",
  "insurance",
  "gambling",
  "casino",
  "alcohol",
  "tobacco",
  "vape",
  "dating",
  "political",
  "weapon",
  "cannabis",
  "crypto",
];

type OnboardLeadInput = z.infer<typeof leadSchema>;

type SalesRep = {
  id: string;
  email: string | null;
  full_name: string | null;
  mobile_number: string | null;
};

type DeliveryResult = {
  ok: boolean;
  to?: string;
  repId?: string;
  provider: "twilio" | "resend" | "vapi";
  status?: number;
  skipped?: boolean;
  error?: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lead onboarding payload.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const now = new Date().toISOString();
  const leadId = randomUUID();
  const leadRow = buildLeadRow(parsed.data, leadId, now, req);

  const { data: lead, error: leadError } = await supabase.from("leads").insert(leadRow).select("*").single();
  if (leadError) {
    return NextResponse.json({ error: leadError.message || "Unable to insert lead." }, { status: 500 });
  }

  const warnings: string[] = [];
  const { reps, warning } = await getActiveSalesReps(supabase);
  if (warning) warnings.push(warning);
  if (reps.length === 0) warnings.push("No active sales reps with SMS or email recipients were found.");

  const dashboardUrl = buildDashboardUrl(leadId);
  const sms = await Promise.all(
    reps
      .filter((rep) => Boolean(rep.mobile_number))
      .map((rep) => sendTwilioSms(rep, parsed.data.businessName, parsed.data.targetGeography)),
  );
  const email = await Promise.all(
    reps
      .filter((rep) => Boolean(rep.email))
      .map((rep) => sendResendEmail(rep, parsed.data, leadId, dashboardUrl)),
  );
  const voice = await queueVapiScreening(parsed.data, leadId, dashboardUrl);

  return NextResponse.json(
    {
      lead,
      notifications: { sms, email },
      voice,
      warnings,
    },
    { status: 201 },
  );
}

function buildLeadRow(input: OnboardLeadInput, id: string, now: string, req: NextRequest) {
  return {
    id,
    created_at: now,
    updated_at: now,
    name: input.contactName,
    email: input.contactEmail,
    phone: input.contactPhone,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
    business_name: input.businessName,
    business_type: input.nicheIndustry,
    niche_industry: input.nicheIndustry,
    location: input.targetGeography,
    target_geography: input.targetGeography,
    website_url: input.websiteUrl,
    primary_offer: "Conversational lead onboarding request",
    target_customers: `Local customers in ${input.targetGeography}`,
    current_channels: [],
    monthly_ad_budget_range: "Not provided",
    urgency: "Speed-to-lead onboarding",
    source: "lead_onboard_api",
    status: "new",
    booking_status: "not_started",
    opportunities: [],
    risks: [],
    booking_recommended: false,
    policy_review_required: isReviewRequired(input.nicheIndustry),
    audit_data: {
      onboardPayload: input,
      source: "lead_onboard_api",
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      receivedAt: now,
    },
  };
}

async function getActiveSalesReps(supabase: ReturnType<typeof createSupabaseServiceClient>) {
  if (!supabase) return { reps: [] as SalesRep[], warning: "Supabase service role is not configured." };

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,mobile_number")
    .eq("role", "sales_rep")
    .eq("is_active", true);

  if (error) {
    return { reps: [] as SalesRep[], warning: `Unable to load active sales reps: ${error.message}` };
  }

  const reps = ((data || []) as SalesRep[]).filter((rep) => Boolean(rep.mobile_number || rep.email));
  return { reps };
}

async function sendTwilioSms(rep: SalesRep, businessName: string, geography: string): Promise<DeliveryResult> {
  const to = rep.mobile_number || undefined;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!to) return { ok: true, provider: "twilio", repId: rep.id, skipped: true };
  if (!accountSid || !authToken || !from) {
    return { ok: false, provider: "twilio", repId: rep.id, to, error: "Twilio is not configured." };
  }

  const message = `🔥 NEW CONVERSATIONAL LEAD: ${businessName} just applied. Target City: ${geography}. Speed-to-lead mode engaged!`;
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: to, Body: message }),
  }).catch((error) => error);

  return normalizeFetchResult(response, "twilio", to, rep.id);
}

async function sendResendEmail(
  rep: SalesRep,
  input: OnboardLeadInput,
  leadId: string,
  dashboardUrl: string,
): Promise<DeliveryResult> {
  const to = rep.email || undefined;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "GPT Ads Launch <onboarding@resend.dev>";

  if (!to) return { ok: true, provider: "resend", repId: rep.id, skipped: true };
  if (!apiKey) return { ok: false, provider: "resend", repId: rep.id, to, error: "Resend is not configured." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New conversational lead: ${input.businessName}`,
      html: buildLeadEmailHtml(input, leadId, dashboardUrl),
      text: [
        `New conversational lead: ${input.businessName}`,
        `Contact: ${input.contactName} <${input.contactEmail}> ${input.contactPhone}`,
        `Industry: ${input.nicheIndustry}`,
        `Target city: ${input.targetGeography}`,
        `Website: ${input.websiteUrl}`,
        `Dashboard: ${dashboardUrl}`,
      ].join("\n"),
    }),
  }).catch((error) => error);

  return normalizeFetchResult(response, "resend", to, rep.id);
}

async function queueVapiScreening(
  input: OnboardLeadInput,
  leadId: string,
  dashboardUrl: string,
): Promise<DeliveryResult> {
  if (!input.contactPhone) return { ok: true, provider: "vapi", skipped: true };
  if (isReviewRequired(input.nicheIndustry)) {
    return { ok: true, provider: "vapi", skipped: true, error: "Skipped for human policy review." };
  }

  const webhookUrl = process.env.VAPI_WEBHOOK_URL;
  if (!webhookUrl) return { ok: false, provider: "vapi", error: "VAPI webhook is not configured." };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.VAPI_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${process.env.VAPI_WEBHOOK_TOKEN}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event: "lead_screening_requested",
      leadId,
      dashboardUrl,
      contact: {
        name: input.contactName,
        email: input.contactEmail,
        phone: input.contactPhone,
      },
      business: {
        name: input.businessName,
        nicheIndustry: input.nicheIndustry,
        targetGeography: input.targetGeography,
        websiteUrl: input.websiteUrl,
      },
    }),
  }).catch((error) => error);

  return normalizeFetchResult(response, "vapi");
}

function normalizeFetchResult(
  response: Response | Error,
  provider: DeliveryResult["provider"],
  to?: string,
  repId?: string,
): DeliveryResult {
  if (response instanceof Error) {
    return { ok: false, provider, to, repId, error: response.message };
  }

  if (!response.ok) {
    return { ok: false, provider, to, repId, status: response.status, error: `${provider} request failed.` };
  }

  return { ok: true, provider, to, repId, status: response.status };
}

function buildDashboardUrl(leadId: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  const path = `/platform/audits/${leadId}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

function buildLeadEmailHtml(input: OnboardLeadInput, leadId: string, dashboardUrl: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#0d1117;color:#f8fafc;padding:28px;">
      <div style="max-width:640px;margin:0 auto;background:#151b23;border:1px solid #30363d;border-radius:12px;padding:28px;">
        <p style="margin:0 0 10px;color:#7dd3fc;font-size:13px;text-transform:uppercase;letter-spacing:.08em;">New conversational lead</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${escapeHtml(input.businessName)} just applied</h1>
        <p style="margin:0 0 22px;color:#cbd5e1;">Speed-to-lead mode is engaged for ${escapeHtml(input.targetGeography)}.</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
          ${emailRow("Lead ID", leadId)}
          ${emailRow("Contact", `${input.contactName} (${input.contactEmail})`)}
          ${emailRow("Phone", input.contactPhone)}
          ${emailRow("Industry", input.nicheIndustry)}
          ${emailRow("Website", input.websiteUrl)}
        </table>
        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#7dd3fc;color:#08111f;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">Open rep dashboard</a>
      </div>
    </div>
  `;
}

function emailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;color:#94a3b8;border-bottom:1px solid #30363d;width:140px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#f8fafc;border-bottom:1px solid #30363d;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isReviewRequired(category: string) {
  const normalized = category.toLowerCase();
  return reviewRequiredTerms.some((term) => normalized.includes(term));
}
