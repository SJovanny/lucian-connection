"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";

export function DocumentLanguage({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
