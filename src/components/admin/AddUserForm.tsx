"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export function AddUserForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), role: form.get("role") }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: result.error ?? "Une erreur est survenue" });
        return;
      }

      formElement.reset();
      setMessage({
        type: "success",
        text: result.warning ?? "Invitation envoyée par email.",
      });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Impossible de contacter le serveur. Réessayez." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Ajouter un utilisateur</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
          <Input label="Email" name="email" type="email" required placeholder="prenom@exemple.com" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select name="role" defaultValue="employee" className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" isLoading={isLoading}>Envoyer l&apos;invitation</Button>
        </div>
      </form>

      <Modal
        isOpen={message !== null}
        onClose={() => setMessage(null)}
        title={message?.type === "success" ? "Invitation envoyée" : "Échec de la création"}
        size="sm"
      >
        <div className="flex flex-col items-center text-center">
          {message?.type === "success" ? (
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-600" aria-hidden="true" />
          ) : (
            <XCircle className="mb-4 h-12 w-12 text-red-600" aria-hidden="true" />
          )}
          <p className="text-gray-600">{message?.text}</p>
          <Button type="button" className="mt-6" onClick={() => setMessage(null)}>
            Fermer
          </Button>
        </div>
      </Modal>
    </>
  );
}
