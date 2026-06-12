import { redirect } from "next/navigation";
import { resolveUserRole } from "@/lib/auth/roles";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ProfileRecord, UserRole } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { user: null, profile: null, role: null as UserRole | null };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { user: null, profile: null, role: null as UserRole | null };

  const service = createSupabaseServiceClient();
  const role = resolveUserRole(user.email);

  if (service) {
    await service.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  }

  const profileQuery = service || supabase;
  const { data } = await profileQuery.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const profile = data ? fromProfileRow(data) : fallbackProfile(user, role);

  return {
    user,
    profile,
    role,
  };
}

export async function requirePlatformUser() {
  const session = await getCurrentUserProfile();
  if (!session.user) redirect("/platform/login");
  return session as Awaited<ReturnType<typeof getCurrentUserProfile>> & {
    user: NonNullable<typeof session.user>;
    profile: ProfileRecord;
    role: UserRole;
  };
}

export function fromProfileRow(row: Record<string, unknown>): ProfileRecord {
  return {
    id: String(row.id),
    email: String(row.email),
    fullName: row.full_name ? String(row.full_name) : undefined,
    role: String(row.role || "customer") as UserRole,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function fallbackProfile(user: User, role: UserRole): ProfileRecord {
  const now = new Date().toISOString();
  return {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || user.user_metadata?.name,
    role,
    createdAt: now,
    updatedAt: now,
  };
}
