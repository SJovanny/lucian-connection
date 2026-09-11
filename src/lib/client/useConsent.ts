"use client";

import { useMemo, useSyncExternalStore } from "react";

type Consent = {
  necessary: true;
  analytics: boolean;
  version: string;
};

const CONSENT_KEY = "lucian-cookie-consent";
const CONSENT_VERSION = "1.0";
const CONSENT_EVENT = "lucian:consent-updated";

function validateConsent(value: unknown): Consent | null {
  if (!value || typeof value !== "object") return null;
  const consent = value as Partial<Consent>;
  return consent.version === CONSENT_VERSION && consent.necessary === true &&
    typeof consent.analytics === "boolean" ? consent as Consent : null;
}

function readConsent(): Consent | null {
  let value: string | null = null;
  try {
    value = localStorage.getItem(CONSENT_KEY);
  } catch {
    // Cookies may still be available when local storage is denied.
  }
  try {
    if (!value) {
      const cookie = document.cookie.split("; ")
        .find((entry) => entry.startsWith(`${CONSENT_KEY}=`))?.split("=")[1];
      value = cookie ? decodeURIComponent(cookie) : null;
    }
    return value ? validateConsent(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  const next: Consent = { necessary: true, analytics, version: CONSENT_VERSION };
  const serialized = JSON.stringify(next);
  try {
    localStorage.setItem(CONSENT_KEY, serialized);
  } catch {
    // The cookie fallback can persist the choice independently.
  }
  try {
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(serialized)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  } catch {
    // Mounted consumers still receive the choice if persistence is denied.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
}

function createConsentStore() {
  let snapshot: Consent | null = null;
  return {
    getSnapshot: () => snapshot,
    subscribe(onChange: () => void) {
      const update = (event?: Event) => {
        snapshot = event instanceof CustomEvent && event.detail !== undefined
          ? validateConsent(event.detail) : readConsent();
        onChange();
      };
      const storage = (event: StorageEvent) => {
        if (event.key === CONSENT_KEY || event.key === null) update();
      };
      window.addEventListener(CONSENT_EVENT, update);
      window.addEventListener("storage", storage);
      update();
      return () => {
        window.removeEventListener(CONSENT_EVENT, update);
        window.removeEventListener("storage", storage);
      };
    },
  };
}

export function useConsent() {
  // Each consumer owns its snapshot; events synchronize choices without global DOM state.
  const store = useMemo(() => createConsentStore(), []);
  const consent = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  return { consent, saveConsent };
}
