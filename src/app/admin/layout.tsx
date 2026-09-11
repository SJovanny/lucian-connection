import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOrderRealtimeProvider } from "@/components/admin/AdminOrderRealtimeProvider";
import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin - Lucian Connection",
  description: "Dashboard d'administration Lucian Connection",
  icons: {
    icon: "/logo_lc.svg",
    apple: "/logo_lc.svg",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffUser = await getStaffUser();
  if (!staffUser) redirect("/admin/login");

  return (
    <AdminOrderRealtimeProvider>
      <div className="min-h-screen flex bg-gray-50 admin-no-motion">
        <AdminSidebar isAdmin={staffUser.profile.role === "admin"} />
        <main className="min-w-0 flex-1 lg:ml-0">
          <div className="p-6 pt-20 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminOrderRealtimeProvider>
  );
}
