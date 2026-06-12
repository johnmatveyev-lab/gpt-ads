import LeadsClient from "@/components/platform/LeadsClient";
import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformUser } from "@/lib/auth/session";

export default async function PlatformLeadsPage() {
  const { profile } = await requirePlatformUser();

  return (
    <PlatformShell profile={profile}>
      <LeadsClient profile={profile} />
    </PlatformShell>
  );
}
