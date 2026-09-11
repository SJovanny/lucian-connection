import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function UsersPage() {
  const currentUser = await getAdminUser();
  if (currentUser?.profile.role !== "admin") redirect("/admin");

  const adminClient = createAdminClient();
  const [{ data: profiles }, { data: authUsers }] = await Promise.all([
    adminClient.from("profiles").select("id, full_name, role, created_at").in("role", ["admin", "employee"]).order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const authUsersById = new Map((authUsers?.users ?? []).map((user) => [user.id, user]));
  const users = (profiles ?? []).map((profile) => {
    const authUser = authUsersById.get(profile.id);
    return {
      ...profile,
      email: authUser?.email ?? "",
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">Utilisateurs</h1>
        <p className="text-gray-500 mt-1">Invitez des administrateurs et des employés.</p>
      </div>
      <AddUserForm />
      <UsersTable users={users} />
    </div>
  );
}
