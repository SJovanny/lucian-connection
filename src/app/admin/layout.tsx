import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "@/app/globals.css";

export const metadata = {
  title: "Admin - Lucian Connection",
  description: "Dashboard d'administration Lucian Connection",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 lg:ml-0">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
