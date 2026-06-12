import LoginPanel from "@/components/platform/LoginPanel";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function PlatformLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <main className="platformLoginPage">
      <LoginPanel nextPath={params.next || "/platform"} />
    </main>
  );
}
