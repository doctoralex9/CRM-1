import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <main className="md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">{children}</div>
      </main>
    </div>
  );
}
