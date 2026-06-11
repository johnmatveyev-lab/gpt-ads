import AdminLeads from "@/components/AdminLeads";

export default function AdminPage() {
  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <h1>Lead Admin</h1>
          <p>
            Review readiness-audit leads, Ava summaries, booking status, and source data. Production
            deployments should set `ADMIN_ACCESS_TOKEN` and use Supabase Auth for full access control.
          </p>
        </div>
      </header>
      <AdminLeads />
    </main>
  );
}
