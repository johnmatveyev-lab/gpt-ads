import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { fromPlatformLeadRow } from "@/lib/platform/leads";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { leadPipelineUpdateSchema } from "@/lib/validation";

export async function GET() {
  const { user, profile, role } = await getCurrentUserProfile();
  if (!user || !profile || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  let query = service.from("leads").select("*").order("created_at", { ascending: false });
  if (role === "sales_rep") query = query.eq("owner_id", user.id);
  if (role === "customer") query = query.eq("contact_email", profile.email);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ leads: (data || []).map(fromPlatformLeadRow), profile });
}

export async function PATCH(request: Request) {
  const { user, profile, role } = await getCurrentUserProfile();
  if (!user || !profile || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (role === "customer") return NextResponse.json({ error: "Customers cannot update lead pipeline." }, { status: 403 });

  const parsed = leadPipelineUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lead update.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.status) updates.status = parsed.data.status;
  if (parsed.data.ownerId !== undefined) updates.owner_id = parsed.data.ownerId;
  if (parsed.data.bookingStatus) updates.booking_status = parsed.data.bookingStatus;
  if (parsed.data.adminNotes !== undefined) updates.admin_notes = parsed.data.adminNotes;
  if (parsed.data.markContacted) updates.last_contacted_at = new Date().toISOString();
  if (parsed.data.markContacted && !parsed.data.status) updates.status = "contacted";

  let query = service.from("leads").update(updates).eq("id", parsed.data.leadId).select("*");
  if (role === "sales_rep") query = query.eq("owner_id", user.id);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ lead: fromPlatformLeadRow(data) });
}
