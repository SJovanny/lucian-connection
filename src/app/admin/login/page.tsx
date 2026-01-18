"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const supabase = createClient();

      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          setError("Email ou mot de passe incorrect");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Type assertion to handle potential "never" inference issues
        const profileData = profile as { role: string } | null;

        if (profileError || !profileData) {
          setError("Erreur lors de la vérification du profil");
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        if (profileData.role !== "admin") {
          setError("Accès refusé. Vous n'avez pas les droits administrateur.");
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Success - redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              Administration
            </h1>
            <p className="text-gray-500 mt-2">
              Lucian Connection - Espace Admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <a
              href="/"
              className="text-sm text-gray-500"
            >
              ← Retour au site
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
