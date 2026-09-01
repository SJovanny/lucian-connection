"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

type Consent = {
  necessary: true;
  analytics: boolean;
  version: string;
};

const CONSENT_KEY = "lucian-cookie-consent";
const CONSENT_VERSION = "1.0";

function readConsent(): Consent | null {
  try {
    const localValue = localStorage.getItem(CONSENT_KEY);
    const cookieValue = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${CONSENT_KEY}=`))
      ?.split("=")[1];
    const value = localValue || (cookieValue ? decodeURIComponent(cookieValue) : null);
    if (!value) return null;

    const parsed = JSON.parse(value) as Partial<Consent>;
    if (
      parsed.version !== CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.analytics !== "boolean"
    ) {
      return null;
    }
    return parsed as Consent;
  } catch {
    return null;
  }
}

function getConsentSnapshot() {
  try {
    return localStorage.getItem(CONSENT_KEY) || document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${CONSENT_KEY}=`))
      ?.split("=")[1] || null;
  } catch {
    return null;
  }
}

function subscribeToConsent(onChange: () => void) {
  window.addEventListener("lucian:consent-updated", onChange);
  return () => window.removeEventListener("lucian:consent-updated", onChange);
}

function ConsentToggle({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange?: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? "bg-primary-700" : "bg-gray-300"} ${disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function hasAnalyticsConsent() {
  const consent = readConsent();
  return consent?.version === CONSENT_VERSION && consent.analytics === true;
}

export function CookieConsent() {
  const locale = useLocale();
  const french = locale === "fr";
  const consentValue = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, () => null);
  const consent = consentValue ? readConsent() : null;
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const openSettings = (event: Event) => {
      event.preventDefault();
      setCustomizing(true);
      setAnalytics(readConsent()?.analytics === true);
    };
    const handleSettingsLink = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-cookie-settings]")) openSettings(event);
    };
    document.addEventListener("lucian:cookie-settings", openSettings);
    document.addEventListener("click", handleSettingsLink);
    return () => {
      document.removeEventListener("lucian:cookie-settings", openSettings);
      document.removeEventListener("click", handleSettingsLink);
    };
  }, []);

  const save = (allowAnalytics: boolean) => {
    const next: Consent = { necessary: true, analytics: allowAnalytics, version: CONSENT_VERSION };
    const serialized = encodeURIComponent(JSON.stringify(next));
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    } catch {
      // The cookie fallback still lets the user make a persistent choice.
    }
    document.cookie = `${CONSENT_KEY}=${serialized}; Max-Age=31536000; Path=/; SameSite=Lax`;
    setCustomizing(false);
    window.dispatchEvent(new CustomEvent("lucian:consent-updated", { detail: next }));
  };

  if (consent && !customizing) return null;

  return (
    <aside
      aria-label={french ? "Préférences cookies" : "Cookie preferences"}
      className="fixed inset-x-4 bottom-4 z-50 max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:left-auto sm:right-6"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        {french ? "Votre confidentialité" : "Your privacy"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        {french
          ? "Les cookies nécessaires font fonctionner le compte et le panier. Les statistiques facultatives restent désactivées sans votre accord."
          : "Necessary cookies keep your account and cart working. Optional analytics remain disabled without your consent."}
      </p>
      {customizing && (
        <div className="mt-4 space-y-3 text-sm text-gray-700">
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{french ? "Nécessaires" : "Necessary"}</p>
                <p className="mt-1 text-gray-500">{french ? "Compte, sécurité et panier. Toujours actifs." : "Account, security and cart. Always active."}</p>
              </div>
              <div className="flex items-center gap-2">
                <ConsentToggle checked disabled label={french ? "Nécessaires toujours actifs" : "Necessary always active"} />
                <span className="text-xs font-semibold text-primary-700">ON</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {french ? "Supabase (session) et stockage local lucian-cart. Durée : session ou jusqu’à 1 an pour le panier." : "Supabase (session) and lucian-cart local storage. Duration: session or up to 1 year for the cart."}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{french ? "Statistiques" : "Analytics"}</p>
                <p className="mt-1 text-gray-500">{french ? "Mesurer la fréquentation et améliorer le site." : "Measure traffic and improve the site."}</p>
              </div>
              <div className="flex items-center gap-2">
                <ConsentToggle checked={analytics} onChange={() => setAnalytics((value) => !value)} label={french ? (analytics ? "Statistiques activées" : "Statistiques désactivées") : (analytics ? "Analytics on" : "Analytics off")} />
                <span className={`text-xs font-semibold ${analytics ? "text-primary-700" : "text-gray-500"}`}>{analytics ? "ON" : "OFF"}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {french ? "Google Analytics. Aucun cookie ni script statistique avant votre accord." : "Google Analytics. No analytics cookie or script before your consent."}
            </p>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => save(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {french ? "Tout refuser" : "Reject all"}
        </button>
        {!customizing && (
          <button type="button" onClick={() => setCustomizing(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {french ? "Personnaliser" : "Customize"}
          </button>
        )}
        <button type="button" onClick={() => save(customizing ? analytics : true)} className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800">
          {customizing ? (french ? "Enregistrer" : "Save choices") : (french ? "Tout accepter" : "Accept all")}
        </button>
      </div>
    </aside>
  );
}
