import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-actions";
import { createClient } from "@/lib/supabase/server";
import { AuditLogExplorer } from "@/components/admin/AuditLogExplorer";

const PAGE_SIZE = 25;

export default async function AdminLogsPage() {
  const admin = await getAdminUser();
  if (!admin || admin.profile.role !== "admin") {
    redirect("/admin");
  }

  const supabase = await createClient();
  const [{ data: logs, count }, { data: staffProfiles }] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["admin", "employee"])
      .order("full_name"),
  ]);

  const actorOptions = (staffProfiles ?? []).map((profile) => ({
    id: profile.id,
    label: profile.full_name || "Sans nom",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Journal d&apos;activité
        </h1>
        <p className="text-gray-500 mt-1">
          Historique des actions effectuées par les administrateurs et les employés.
        </p>
      </div>

      <AuditLogExplorer
        initialLogs={logs ?? []}
        initialTotal={count ?? 0}
        pageSize={PAGE_SIZE}
        actorOptions={actorOptions}
      />
    </div>
  );
}
