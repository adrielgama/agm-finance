import { verifySession } from "@/lib/auth/dal";
import { Sidebar } from "./_components/sidebar";
import { Topbar } from "./_components/topbar";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const user = await verifySession();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
