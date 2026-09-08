"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { recordAuditClient } from "@/lib/audit-client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function installSessionFromHash() {
      const supabase = createClient();

      // Supabase admin invite/recovery emails redirect with the session
      // in the URL fragment (implicit-style: #access_token=...&refresh_token=...).
      // The browser client is configured with flowType "pkce" (hardcoded by
      // @supabase/ssr's createBrowserClient), which makes its automatic
      // getSession()/detectSessionInUrl logic reject implicit tokens as a
      // downgrade-attack safeguard. We bypass that by parsing the fragment
      // ourselves and installing the session directly via setSession(),
      // which does not enforce the flowType check.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError = hashParams.get("error_description");

      if (hashError) {
        if (isMounted) {
          setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
          setIsCheckingSession(false);
        }
        return;
      }

      if (!accessToken || !refreshToken) {
        // No token in the URL: maybe the session was already installed
        // (e.g. page refresh after the hash was cleared).
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (!session) setError("Ce lien d'invitation est invalide ou a expiré.");
          setIsCheckingSession(false);
        }
        return;
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Clean up the sensitive tokens from the URL bar regardless of outcome.
      window.history.replaceState(null, "", window.location.pathname);

      if (isMounted) {
        if (setSessionError) {
          setError("Ce lien d'invitation est invalide ou a expiré.");
        }
        setIsCheckingSession(false);
      }
    }

    void installSessionFromHash();

    return () => {
      isMounted = false;
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) {
      setError("Le mot de passe doit contenir au moins 8 caractères et les deux champs doivent correspondre.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      await recordAuditClient(supabase, {
        action: "auth.password_set",
        entityType: "auth",
        entityId: data.user?.id ?? null,
        summary: "Mot de passe défini",
      });
      router.push("/admin");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Créer votre mot de passe</h1>
        <p className="text-gray-500">Finalisez votre accès au dashboard.</p>
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirmation"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          isLoading={loading}
          disabled={isCheckingSession || Boolean(error)}
          className="w-full"
        >
          Continuer
        </Button>
      </form>
    </div>
  );
}
