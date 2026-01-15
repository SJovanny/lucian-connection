"use client";

import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (password !== confirmPassword) {
      setError(locale === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(locale === "fr" ? "Le mot de passe doit contenir au moins 6 caractères" : "Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        setSuccess(true);
        // Redirect after short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      setError(locale === "fr" ? "Une erreur est survenue" : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {t("title")}
              </h1>
            </div>

            {success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                <p className="font-medium">
                  {locale === "fr" ? "Compte créé avec succès !" : "Account created successfully!"}
                </p>
                <p className="text-sm mt-1">
                  {locale === "fr" ? "Redirection en cours..." : "Redirecting..."}
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              <Input
                label={t("fullName")}
                name="fullName"
                required
                placeholder="John Doe"
              />
              <Input
                label={t("email")}
                name="email"
                type="email"
                required
                placeholder="email@example.com"
              />
              <Input
                label={t("password")}
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
              />
              <Input
                label={t("confirmPassword")}
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
              />

              <div className="text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
            )}
                  <span className="text-gray-600">
                    {locale === "fr"
                      ? "J'accepte les conditions générales et la politique de confidentialité"
                      : "I agree to the terms of service and privacy policy"}
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                {t("submit")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t("hasAccount")}{" "}
              <Link
                href="/login"
                className="text-primary-500 font-medium hover:underline"
              >
                {t("login")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
