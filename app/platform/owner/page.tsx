import { redirect } from "next/navigation";
import OwnerDashboardClient from "@/components/platform/OwnerDashboardClient";
import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformUser } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/platform/dashboard";

export default async function OwnerPlatformPage() {
  const { profile } = await requirePlatformUser();
  if (profile.role !== "owner") redirect(getDashboardPathForRole(profile.role));

  return (
    <PlatformShell profile={profile}>
      <OwnerDashboardClient profile={profile} />
    </PlatformShell>
  );
}
