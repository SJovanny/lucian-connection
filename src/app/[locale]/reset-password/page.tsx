"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link, useRouter } from "@/i18n/routing";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    setRedirectPath(
      getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"))
    );
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 6) {
      setError(t("minimumLength"));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsUpdated(true);
      window.setTimeout(() => {
        router.push(redirectPath);
        router.refresh();
      }, 1200);
    } catch {
      setError(locale === "fr" ? "Une erreur est survenue" : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <CartDrawer />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {t("title")}
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                {t("description")}
              </p>
            </div>

            {isUpdated ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                {t("success")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label={t("password")}
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <Input
                  label={t("confirmPassword")}
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {t("submit")}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-primary-500 font-medium hover:underline">
                {t("backToLogin")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
