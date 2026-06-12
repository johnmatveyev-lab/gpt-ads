import { NextResponse } from "next/server";
import { listLocalLeads, updateLocalLead } from "@/lib/local-store";
import { isSupabaseConfigured, listSupabaseLeads, updateSupabaseLead } from "@/lib/supabase";
import type { LeadRecord } from "@/lib/types";

const statusValues = new Set(["new", "contacted", "audit_ready", "closed_won", "closed_lost"]);
const bookingStatusValues = new Set(["not_started", "started", "booked"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const auth = authorizeAdmin(request, url);
  if (auth) return auth;

  try {
    if (isSupabaseConfigured()) {
      const leads = await listSupabaseLeads();
      return NextResponse.json({ leads: leads ?? [], storage: "supabase" });
    }

    const leads = await listLocalLeads();
    return NextResponse.json({ leads, storage: "local-dev" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load leads." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const url = new URL(request.url);
  const auth = authorizeAdmin(request, url);
  if (auth) return auth;

  const body = await request.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  if (!leadId) return NextResponse.json({ error: "leadId is required." }, { status: 400 });

  const updates: Partial<Pick<LeadRecord, "status" | "bookingStatus" | "adminNotes" | "lastContactedAt">> = {};
  if (typeof body.status === "string" && statusValues.has(body.status)) updates.status = body.status;
  if (typeof body.bookingStatus === "string" && bookingStatusValues.has(body.bookingStatus)) {
    updates.bookingStatus = body.bookingStatus;
  }
  if (typeof body.adminNotes === "string") updates.adminNotes = body.adminNotes.slice(0, 3000);
  if (body.markContacted === true) updates.lastContactedAt = new Date().toISOString();

  try {
    const lead = isSupabaseConfigured()
      ? await updateSupabaseLead(leadId, updates)
      : await updateLocalLead(leadId, updates);

    return NextResponse.json({ lead, storage: isSupabaseConfigured() ? "supabase" : "local-dev" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update lead." },
      { status: 500 },
    );
  }
}

function authorizeAdmin(request: Request, url: URL) {
  const configuredToken = process.env.ADMIN_ACCESS_TOKEN;
  const providedToken = url.searchParams.get("token") || request.headers.get("x-admin-token");
  const isDevWithoutToken = process.env.NODE_ENV !== "production" && !configuredToken;

  if (!isDevWithoutToken && configuredToken && providedToken !== configuredToken) {
    return NextResponse.json({ error: "Invalid admin token." }, { status: 401 });
  }

  if (!isDevWithoutToken && !configuredToken) {
    return NextResponse.json({ error: "ADMIN_ACCESS_TOKEN is required in production." }, { status: 503 });
  }

  return null;
}
