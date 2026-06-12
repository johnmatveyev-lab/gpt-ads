import AuditDetailClient from "@/components/platform/AuditDetailClient";
import PlatformShell from "@/components/platform/PlatformShell";
import { requirePlatformUser } from "@/lib/auth/session";

type AuditPageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function PlatformAuditPage({ params }: AuditPageProps) {
  const { leadId } = await params;
  const { profile } = await requirePlatformUser();

  return (
    <PlatformShell profile={profile}>
      <AuditDetailClient leadId={leadId} profile={profile} />
    </PlatformShell>
  );
}
