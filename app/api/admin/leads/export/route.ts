import { NextResponse } from "next/server";
import { listLocalLeads } from "@/lib/local-store";
import { isSupabaseConfigured, listSupabaseLeads } from "@/lib/supabase";
import type { LeadRecord } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const configuredToken = process.env.ADMIN_ACCESS_TOKEN;
  const providedToken = url.searchParams.get("token") || request.headers.get("x-admin-token");
  const isDevWithoutToken = process.env.NODE_ENV !== "production" && !configuredToken;

  if (!isDevWithoutToken && configuredToken && providedToken !== configuredToken) {
    return NextResponse.json({ error: "Invalid admin token." }, { status: 401 });
  }

  if (!isDevWithoutToken && !configuredToken) {
    return NextResponse.json({ error: "ADMIN_ACCESS_TOKEN is required in production." }, { status: 503 });
  }

  try {
    const leads = isSupabaseConfigured() ? await listSupabaseLeads() : await listLocalLeads();
    const csv = toCsv(leads ?? []);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="gpt-ads-leads.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to export leads." },
      { status: 500 },
    );
  }
}

function toCsv(leads: LeadRecord[]) {
  const headers = [
    "createdAt",
    "name",
    "email",
    "phone",
    "businessName",
    "businessType",
    "location",
    "readinessScore",
    "fitLevel",
    "status",
    "bookingStatus",
    "source",
    "utmCampaign",
  ];

  const rows = leads.map((lead) =>
    headers.map((header) => csvEscape(String(lead[header as keyof LeadRecord] ?? ""))).join(","),
  );

  return `${headers.join(",")}\n${rows.join("\n")}\n`;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
