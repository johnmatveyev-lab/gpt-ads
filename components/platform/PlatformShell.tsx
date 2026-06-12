import Link from "next/link";
import type { ReactNode } from "react";
import { getDashboardPathForRole } from "@/lib/platform/dashboard";
import type { ProfileRecord } from "@/lib/types";

export default function PlatformShell({ profile, children }: { profile: ProfileRecord; children: ReactNode }) {
  const dashboardPath = getDashboardPathForRole(profile.role);

  return (
    <div className="platformShell">
      <aside className="platformSidebar">
        <Link href="/" className="platformBrand">
          GPT Ads
          <span>Enterprise Platform</span>
        </Link>
        <nav>
          <Link href={dashboardPath}>Dashboard</Link>
          {profile.role !== "customer" ? <Link href="/platform/leads">Leads</Link> : null}
          {profile.role === "owner" ? <Link href="/platform/integrations">Integrations</Link> : null}
          <Link href="/platform/settings">Settings</Link>
        </nav>
        <div className="platformIdentity">
          <strong>{profile.fullName || profile.email}</strong>
          <span>{profile.role.replace("_", " ")}</span>
        </div>
      </aside>
      <main className="platformMain">{children}</main>
    </div>
  );
}
