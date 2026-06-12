import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { fromPlatformLeadRow } from "@/lib/platform/leads";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { auditUpdateSchema } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { leadId } = await context.params;
  const { user, profile, role } = await getCurrentUserProfile();
  if (!user || !profile || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  let query = service.from("leads").select("*").eq("id", leadId);
  if (role === "sales_rep") query = query.eq("owner_id", user.id);
  if (role === "customer") query = query.eq("contact_email", profile.email);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === "PGRST116" ? 404 : 500 });

  return NextResponse.json({ lead: fromPlatformLeadRow(data) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { leadId } = await context.params;
  const { user, profile, role } = await getCurrentUserProfile();
  if (!user || !profile || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (role === "customer") return NextResponse.json({ error: "Customers cannot update audits." }, { status: 403 });

  const parsed = auditUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid audit update.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  let query = service
    .from("leads")
    .update({ audit_data: parsed.data.auditData, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select("*");
  if (role === "sales_rep") query = query.eq("owner_id", user.id);

  const { data, error } = await query.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ lead: fromPlatformLeadRow(data) });
}
