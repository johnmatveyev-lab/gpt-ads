import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { createOpenAiAdsPlatformClient } from "@/lib/openai-ads/platform-client";
import { fromIntegrationRow } from "@/lib/platform/leads";
import { encryptSecret } from "@/lib/security/crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { integrationInputSchema } from "@/lib/validation";

export async function GET() {
  const { user, role } = await getCurrentUserProfile();
  if (!user || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (role !== "owner") return NextResponse.json({ error: "Only owners can manage API integrations." }, { status: 403 });

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  const { data, error } = await service
    .from("api_integrations")
    .select("id, owner_profile_id, network_name, environment, account_id, parameters, status, is_active, last_verified_at, updated_at")
    .eq("owner_profile_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ integrations: (data || []).map(fromIntegrationRow) });
}

export async function POST(request: Request) {
  return upsertIntegration(request);
}

export async function PATCH(request: Request) {
  return upsertIntegration(request);
}

async function upsertIntegration(request: Request) {
  const { user, role } = await getCurrentUserProfile();
  if (!user || !role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (role !== "owner") return NextResponse.json({ error: "Only owners can manage API integrations." }, { status: 403 });

  const parsed = integrationInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid integration.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  if (!service) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  const encryptedApiKey = encryptSecret(parsed.data.apiKey);
  const encryptedAccessToken = parsed.data.accessToken ? encryptSecret(parsed.data.accessToken) : null;
  const status = parsed.data.isActive ? "configured" : "inactive";
  const { data, error } = await service
    .from("api_integrations")
    .upsert(
      {
        owner_profile_id: user.id,
        network_name: parsed.data.networkName,
        environment: parsed.data.environment,
        encrypted_api_key: encryptedApiKey,
        encrypted_access_token: encryptedAccessToken,
        account_id: parsed.data.accountId,
        parameters: parsed.data.parameters,
        status,
        is_active: parsed.data.isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_profile_id,network_name" },
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const readiness =
    parsed.data.networkName === "openai" && parsed.data.isActive
      ? await createOpenAiAdsPlatformClient({
          encryptedApiKey,
          accountId: parsed.data.accountId,
          isActive: parsed.data.isActive,
        }).assertReady()
      : null;

  return NextResponse.json({ integration: fromIntegrationRow(data), readiness });
}
