"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent } from "./CookieConsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    const load = () => {
      if (!hasAnalyticsConsent() || document.getElementById("lucian-google-analytics")) return;
      const script = document.createElement("script");
      script.id = "lucian-google-analytics";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { anonymize_ip: true });
    };
    load();
    window.addEventListener("lucian:consent-updated", load);
    return () => window.removeEventListener("lucian:consent-updated", load);
  }, []);

  return null;
}
