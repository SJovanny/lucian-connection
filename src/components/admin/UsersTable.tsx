type StaffUser = { id: string; email: string; full_name: string | null; role: string; created_at: string };

export function UsersTable({ users }: { users: StaffUser[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Accès dashboard</h2></div>
      {users.length === 0 ? <p className="p-6 text-gray-500">Aucun utilisateur staff.</p> : (
        <div className="divide-y divide-gray-100">
          {users.map((user) => <div key={user.id} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="font-medium text-gray-900 truncate">{user.full_name || user.email}</p><p className="text-sm text-gray-500 truncate">{user.email}</p></div>
            <span className="shrink-0 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm capitalize">{user.role}</span>
          </div>)}
        </div>
      )}
    </div>
  );
}
