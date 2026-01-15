"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

const locales = [
  { code: "fr" as const, label: "FR", flag: "🇫🇷" },
  { code: "en" as const, label: "EN", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(newLocale: "fr" | "en") {
    router.replace(pathname, { locale: newLocale });
  }

  const otherLocale = locale === "fr" ? "en" : "fr";
  const otherLocaleData = locales.find((l) => l.code === otherLocale);

  return (
    <button
      onClick={() => onChange(otherLocale)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-primary-600 rounded-lg transition-colors text-sm"
      aria-label="Change language"
    >
      <Globe className="w-4 h-4" />
      <span>{otherLocaleData?.flag}</span>
      <span>{otherLocaleData?.label}</span>
    </button>
  );
}
