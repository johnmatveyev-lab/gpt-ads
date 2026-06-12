import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation";

export async function GET() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const { user } = await getCurrentUserProfile();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile update.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  const { data, error } = await service
    .from("profiles")
    .update({ full_name: parsed.data.fullName || null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
