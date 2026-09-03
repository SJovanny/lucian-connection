import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { headers } from "next/headers";

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
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Don't show sidebar for login page
  const isLoginPage = pathname === "/admin/login";
  
  if (isLoginPage) {
    return <div className="admin-no-motion">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 admin-no-motion">
      <AdminSidebar />
      <main className="min-w-0 flex-1 lg:ml-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
