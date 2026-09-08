"use client";

import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link, useRouter } from "@/i18n/routing";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { HCaptcha } from "@/components/auth/HCaptcha";
import type { Locale } from "@/i18n/routing";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setRedirectPath(getSafeRedirectPath(searchParams.get("next")));

    const oauthError = searchParams.get("oauth");
    if (oauthError === "cancelled") {
      setError(t("oauthCancelled"));
    } else if (oauthError === "failed") {
      setError(t("oauthFailed"));
    }
  }, [t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && !captchaToken) {
      setError(locale === "fr" ? "Veuillez valider le captcha." : "Please complete the captcha.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (signInError) {
        if (signInError.message === "Invalid login credentials") {
          setError(locale === "fr" ? "Email ou mot de passe incorrect" : "Invalid email or password");
        } else {
          setError(signInError.message);
        }
        setCaptchaToken(null);
        setCaptchaResetKey((value) => value + 1);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        router.push(redirectPath);
        router.refresh();
      }
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
              <h1 className="text-4xl font-bold text-gray-900 font-display">
                {t("title")}
              </h1>
            </div>

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
              />
              <Input
                label={t("password")}
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-gray-600">
                    {locale === "fr" ? "Se souvenir de moi" : "Remember me"}
                  </span>
                </label>
                <Link
                  href={`/forgot-password${redirectPath === "/" ? "" : `?next=${encodeURIComponent(redirectPath)}`}`}
                  className="text-primary-500 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

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

            <GoogleOAuthButton
              locale={locale as Locale}
              redirectPath={redirectPath}
              disabled={isLoading}
              onError={setError}
            />

            <div className="mt-6 text-center text-sm text-gray-600">
              {t("noAccount")}{" "}
              <Link
                href={`/register${redirectPath === "/" ? "" : `?next=${encodeURIComponent(redirectPath)}`}`}
                className="text-primary-500 font-medium hover:underline"
              >
                {t("register")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
