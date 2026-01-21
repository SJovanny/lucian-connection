import { redirect } from "next/navigation";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import { getAdminUser } from "@/lib/admin-actions";

export default async function AdminSettingsPage() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const { user, profile } = admin;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Paramètres
        </h1>
        <p className="text-gray-500 mt-1">
          Gérez votre profil et la langue du dashboard.
        </p>
      </div>

      <AdminSettingsForm
        userId={profile.id}
        initialEmail={user.email || ""}
        initialFullName={profile.full_name || ""}
        initialPhone={profile.phone || ""}
        initialDashboardLocale={profile.dashboard_locale || "fr"}
      />
    </div>
  );
}
