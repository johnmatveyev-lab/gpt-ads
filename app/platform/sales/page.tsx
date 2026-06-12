import { redirect } from "next/navigation";
import PlatformShell from "@/components/platform/PlatformShell";
import SalesDashboardClient from "@/components/platform/SalesDashboardClient";
import { requirePlatformUser } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/platform/dashboard";

export default async function SalesPlatformPage() {
  const { profile } = await requirePlatformUser();
  if (profile.role !== "sales_rep") redirect(getDashboardPathForRole(profile.role));

  return (
    <PlatformShell profile={profile}>
      <SalesDashboardClient />
    </PlatformShell>
  );
}
