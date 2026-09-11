"use client";

import { useEffect } from "react";
import { useConsent } from "@/lib/client/useConsent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean;
  }
}

export function Analytics() {
  const { consent } = useConsent();
  const analyticsAllowed = consent?.analytics === true;
  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    window[`ga-disable-${measurementId}`] = !analyticsAllowed;
    if (!analyticsAllowed) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      document.getElementById("lucian-google-analytics")?.remove();
      return;
    }
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    if (!document.getElementById("lucian-google-analytics")) {
      const script = document.createElement("script");
      script.id = "lucian-google-analytics";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { anonymize_ip: true });
    }
  }, [analyticsAllowed]);

  return null;
}
