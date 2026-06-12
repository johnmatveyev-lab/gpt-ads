import { redirect } from "next/navigation";
import ClientPortalDashboard from "@/components/platform/ClientPortalDashboard";
import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformUser } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/platform/dashboard";

export default async function ClientPlatformPage() {
  const { profile } = await requirePlatformUser();
  if (profile.role !== "customer") redirect(getDashboardPathForRole(profile.role));

  return (
    <PlatformShell profile={profile}>
      <ClientPortalDashboard />
    </PlatformShell>
  );
}
