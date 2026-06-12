import IntegrationClient from "@/components/platform/IntegrationClient";
import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformUser } from "@/lib/auth/session";

export default async function PlatformIntegrationsPage() {
  const { profile } = await requirePlatformUser();

  return (
    <PlatformShell profile={profile}>
      <IntegrationClient profile={profile} />
    </PlatformShell>
  );
}
