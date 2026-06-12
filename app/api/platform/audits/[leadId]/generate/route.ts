import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { buildCompetitorAudit } from "@/lib/platform/dashboard";
import { fromPlatformLeadRow } from "@/lib/platform/leads";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { leadId } = await context.params;
  const { user, profile, role } = await getCurrentUserProfile();
  if (!user || !profile || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (role === "customer") return NextResponse.json({ error: "Customers cannot generate audits." }, { status: 403 });

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  let selectQuery = service.from("leads").select("*").eq("id", leadId);
  if (role === "sales_rep") selectQuery = selectQuery.eq("owner_id", user.id);

  const { data: existingRow, error: selectError } = await selectQuery.single();
  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: selectError.code === "PGRST116" ? 404 : 500 });
  }

  const lead = fromPlatformLeadRow(existingRow);
  const competitorAudit = buildCompetitorAudit(lead);
  const auditData = {
    ...(lead.auditData || {}),
    competitorAudit,
  };

  let updateQuery = service
    .from("leads")
    .update({ audit_data: auditData, status: "audit_ready", updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select("*");
  if (role === "sales_rep") updateQuery = updateQuery.eq("owner_id", user.id);

  const { data, error } = await updateQuery.single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ lead: fromPlatformLeadRow(data), competitorAudit });
}
