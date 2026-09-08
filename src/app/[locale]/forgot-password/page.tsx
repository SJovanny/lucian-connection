"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@/i18n/routing";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";
import { HCaptcha } from "@/components/auth/HCaptcha";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth.forgotPassword");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  useEffect(() => {
    setRedirectPath(
      getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"))
    );
  }, []);

  const loginPath = `/login${redirectPath === "/" ? "" : `?next=${encodeURIComponent(redirectPath)}`}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken) {
      setError(locale === "fr" ? "Veuillez valider le captcha." : "Please complete the captcha.");
      setIsLoading(false);
      return;
    }

    try {
      const resetUrl = new URL(`/${locale}/reset-password`, window.location.origin);
      if (redirectPath !== "/") resetUrl.searchParams.set("next", redirectPath);

      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl.toString(),
        captchaToken: captchaToken ?? undefined,
      });

      if (resetError) {
        setError(resetError.message);
        setCaptchaToken(null);
        setCaptchaResetKey((value) => value + 1);
        return;
      }

      setIsSubmitted(true);
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
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 font-display">
                {t("title")}
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                {t("description")}
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                <p className="font-medium">{t("successTitle")}</p>
                <p className="text-sm mt-1">{t("successMessage")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label={t("email")}
                  name="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  autoComplete="email"
                />
                <HCaptcha
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  resetKey={captchaResetKey}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken)}
                >
                  {t("submit")}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <Link href={loginPath} className="text-primary-500 font-medium hover:underline">
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
