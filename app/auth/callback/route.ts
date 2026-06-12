import { NextResponse } from "next/server";
import { resolveUserRole } from "@/lib/auth/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/platform";
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/platform/login?error=oauth", requestUrl.origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.headers.get("cookie")?.split("; ").map((cookie) => {
          const [name, ...rest] = cookie.split("=");
          return { name, value: rest.join("=") };
        }) ?? [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    return NextResponse.redirect(new URL("/platform/login?error=session", requestUrl.origin));
  }

  const service = createSupabaseServiceClient();
  if (service) {
    await service.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
        role: resolveUserRole(data.user.email),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  }

  return response;
}
