"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setIsCheckingSession(false);
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setError("Ce lien d'invitation est invalide ou a expiré.");
      setIsCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) {
      setError("Le mot de passe doit contenir au moins 8 caractères et les deux champs doivent correspondre.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else router.push("/admin");
    setLoading(false);
  }

  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"><form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-4"><h1 className="text-2xl font-bold text-gray-900">Créer votre mot de passe</h1><p className="text-gray-500">Finalisez votre accès au dashboard.</p><Input label="Mot de passe" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /><Input label="Confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" />{error && <p className="text-sm text-red-600">{error}</p>}<Button type="submit" isLoading={loading} disabled={isCheckingSession || Boolean(error)} className="w-full">Continuer</Button></form></div>;
}
