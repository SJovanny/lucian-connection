"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/Modal";

type StaffUser = {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
};

export function UsersTable({ users }: { users: StaffUser[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(user: StaffUser) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Impossible de supprimer cet utilisateur");
        return;
      }

      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Accès dashboard</h2></div>
      {error && <p className="px-6 py-3 text-sm text-red-600 bg-red-50">{error}</p>}
      {users.length === 0 ? <p className="p-6 text-gray-500">Aucun utilisateur staff.</p> : (
        <div className="divide-y divide-gray-100">
           {users.map((user) => <div key={user.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
             <div className="min-w-0"><p className="font-medium text-gray-900 truncate">{user.full_name || user.email}</p><p className="text-sm text-gray-500 truncate">{user.email}</p></div>
             <div className="flex items-center gap-2 shrink-0">
               <span className={`px-3 py-1 rounded-full text-sm ${user.email_confirmed_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                 {user.email_confirmed_at ? "Compte validé" : "En attente de validation"}
               </span>
               <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm capitalize">{user.role}</span>
               <button
                type="button"
                onClick={() => setDeleteTarget(user)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Supprimer ${user.email}`}
                title="Supprimer l'utilisateur"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
             </div>
           </div>)}
        </div>
      )}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void handleDelete(deleteTarget);
        }}
        title="Supprimer l'utilisateur"
        message={deleteTarget ? `Êtes-vous sûr de vouloir supprimer « ${deleteTarget.email} » ? Cette action est irréversible.` : ""}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
