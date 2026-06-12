import PlatformShell from "@/components/platform/PlatformShell";
import SettingsClient from "@/components/platform/SettingsClient";
import { requirePlatformUser } from "@/lib/auth/session";

export default async function PlatformSettingsPage() {
  const { profile } = await requirePlatformUser();

  return (
    <PlatformShell profile={profile}>
      <SettingsClient profile={profile} />
    </PlatformShell>
  );
}
