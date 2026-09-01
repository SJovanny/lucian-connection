"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

const locales = [
  { code: "fr" as const, label: "FR", flag: "🇫🇷" },
  { code: "en" as const, label: "EN", flag: "🇱🇨" },
];

// Composant pour afficher les drapeaux en CSS (compatible Windows)
function Flag({ code }: { code: "fr" | "en" }) {
  if (code === "fr") {
    return (
      <span className="inline-flex w-5 h-3.5 rounded-sm overflow-hidden shadow-sm">
        <span className="w-1/3 bg-blue-600"></span>
        <span className="w-1/3 bg-white"></span>
        <span className="w-1/3 bg-red-600"></span>
      </span>
    );
  }
  return (
    <span className="inline-flex w-5 h-3.5 rounded-sm overflow-hidden shadow-sm relative bg-[#66c7d5]">
      <span
        className="absolute inset-0 bg-white"
        style={{ clipPath: "polygon(50% 18%, 82% 82%, 18% 82%)" }}
      ></span>
      <span
        className="absolute inset-0 bg-black"
        style={{ clipPath: "polygon(50% 25%, 76% 78%, 24% 78%)" }}
      ></span>
      <span
        className="absolute inset-0 bg-[#fcd116]"
        style={{ clipPath: "polygon(50% 34%, 68% 75%, 32% 75%)" }}
      ></span>
    </span>
  );
}

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
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white transition-colors hover:bg-gray-200"
      aria-label="Change language"
    >
      <Flag code={otherLocale} />
      <span className="font-medium">{otherLocaleData?.label}</span>
    </button>
  );
}
