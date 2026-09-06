"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/routing";

type GoogleOAuthButtonProps = {
  locale: Locale;
  redirectPath: string;
  disabled?: boolean;
  onError: (message: string | null) => void;
};

export function GoogleOAuthButton({
  locale,
  redirectPath,
  disabled = false,
  onError,
}: GoogleOAuthButtonProps) {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    onError(null);

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      const safeRedirectPath = getSafeRedirectPath(redirectPath);

      callbackUrl.searchParams.set("locale", locale);
      if (safeRedirectPath !== "/") {
        callbackUrl.searchParams.set("next", safeRedirectPath);
      }

      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        onError(t("oauthError"));
        setIsLoading(false);
      }
    } catch {
      onError(t("oauthError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        <span>{t("or")}</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        isLoading={isLoading}
        disabled={disabled}
        onClick={handleClick}
      >
        <span
          aria-hidden="true"
          className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-bold text-primary-600"
        >
          G
        </span>
        {t("continueWithGoogle")}
      </Button>
    </div>
  );
}
