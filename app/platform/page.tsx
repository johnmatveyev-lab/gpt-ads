import { redirect } from "next/navigation";
import { requirePlatformUser } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/platform/dashboard";

export default async function PlatformPage() {
  const { profile } = await requirePlatformUser();

  redirect(getDashboardPathForRole(profile.role));
}
