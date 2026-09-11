// @vitest-environment jsdom
import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { Analytics } from "@/components/privacy/Analytics";

vi.mock("next-intl", () => ({ useLocale: () => "en" }));

const key = "lucian-cookie-consent";
const measurementId = "G-CONSENT-TEST";
const choice = (analytics: boolean) => ({ necessary: true, analytics, version: "1.0" });
const script = () => document.getElementById("lucian-google-analytics");
const preferences = () => screen.queryByRole("complementary", { name: "Cookie preferences" });
const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const openSettings = () => act(() => {
  document.dispatchEvent(new Event("lucian:cookie-settings", { cancelable: true }));
});
function mount() {
  return render(<StrictMode><CookieConsent /><Analytics /></StrictMode>);
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", measurementId);
  const stored = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => { stored.set(key, value); },
  });
  document.cookie = `${key}=; Max-Age=0; Path=/`;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  script()?.remove();
  delete window.gtag;
  window.dataLayer = [];
  delete window[`ga-disable-${measurementId}`];
});

describe("cookie consent", () => {
  it("defaults to necessary-only and saves customization without analytics opt-in", () => {
    mount();
    expect(preferences()).toBeInTheDocument();
    expect(script()).toBeNull();
    click("Customize");
    expect(screen.getByRole("switch", { name: "Necessary always active" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Necessary always active" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch", { name: "Analytics off" })).toHaveAttribute("aria-checked", "false");
    click("Save choices");
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(choice(false));
    expect(preferences()).not.toBeInTheDocument();
    expect(script()).toBeNull();
  });

  it.each([true, false])("persists analytics=%s through accept/reject and reload", (analytics) => {
    const updated = vi.fn();
    window.addEventListener("lucian:consent-updated", updated);
    const view = mount();
    click(analytics ? "Accept all" : "Reject all");
    expect(preferences()).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(choice(analytics));
    expect(document.cookie).toContain(`${key}=${encodeURIComponent(JSON.stringify(choice(analytics)))}`);
    expect(updated).toHaveBeenCalledTimes(1);
    expect(updated.mock.calls[0][0].detail).toEqual(choice(analytics));
    window.removeEventListener("lucian:consent-updated", updated);
    expect(Boolean(script())).toBe(analytics);
    view.unmount();
    mount();
    expect(preferences()).not.toBeInTheDocument();
    expect(Boolean(script())).toBe(analytics);
    expect(document.querySelectorAll("#lucian-google-analytics")).toHaveLength(analytics ? 1 : 0);
  });

  it("opens settings through nested link content and custom events, revokes and reaccepts", () => {
    mount();
    click("Accept all");
    render(<a href="#cookie-settings" data-cookie-settings><span>Cookie settings</span></a>);
    fireEvent.click(screen.getByText("Cookie settings"));
    expect(screen.getByRole("switch", { name: "Analytics on" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("switch", { name: "Analytics on" }));
    // Draft changes do not revoke consent until saved.
    expect(script()).not.toBeNull();
    click("Save choices");
    expect(script()).toBeNull();
    expect(window[`ga-disable-${measurementId}`]).toBe(true);
    expect(window.dataLayer).toContainEqual(["consent", "update", { analytics_storage: "denied" }]);
    expect(JSON.parse(localStorage.getItem(key)!)).toEqual(choice(false));
    openSettings();
    fireEvent.click(screen.getByRole("switch", { name: "Analytics off" }));
    click("Save choices");
    expect(script()).not.toBeNull();
    expect(window[`ga-disable-${measurementId}`]).toBe(false);
  });

  it("handles a revocation event and cross-tab updates", () => {
    mount();
    click("Accept all");
    act(() => window.dispatchEvent(new CustomEvent("lucian:consent-updated", { detail: choice(false) })));
    expect(script()).toBeNull();
    expect(window[`ga-disable-${measurementId}`]).toBe(true);
    act(() => window.dispatchEvent(new StorageEvent("storage", { key })));
    expect(script()).not.toBeNull();
    act(() => {
      localStorage.setItem(key, JSON.stringify(choice(false)));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    });
    expect(script()).toBeNull();
  });

  it.each(["null", "invalid JSON", JSON.stringify({ ...choice(true), version: "0.9" }),
    JSON.stringify({ ...choice(true), necessary: false }), JSON.stringify({ ...choice(true), analytics: "true" })])(
    "requires a new choice for invalid stored consent: %s", (value) => {
      localStorage.setItem(key, value);
      mount();
      expect(preferences()).toBeInTheDocument();
      expect(script()).toBeNull();
    },
  );

  it("falls back to cookies when localStorage reads and writes are denied, including reload", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new DOMException("Denied", "SecurityError"); });
    const view = mount();
    click("Accept all");
    expect(preferences()).not.toBeInTheDocument();
    expect(script()).not.toBeNull();
    view.unmount();
    mount();
    expect(preferences()).not.toBeInTheDocument();
    openSettings();
    expect(screen.getByRole("switch", { name: "Analytics on" })).toBeInTheDocument();
    click("Reject all");
    expect(script()).toBeNull();
  });

  it("uses localStorage when cookies are denied", () => {
    vi.spyOn(document, "cookie", "get").mockImplementation(() => { throw new Error("Denied"); });
    vi.spyOn(document, "cookie", "set").mockImplementation(() => { throw new Error("Denied"); });
    const view = mount();
    click("Accept all");
    expect(preferences()).not.toBeInTheDocument();
    view.unmount();
    mount();
    expect(preferences()).not.toBeInTheDocument();
    expect(script()).not.toBeNull();
  });

  it("honors acceptance and revocation in mounted consumers when all storage throws", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new Error("Denied"); });
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("Denied"); });
    vi.spyOn(document, "cookie", "get").mockImplementation(() => { throw new Error("Denied"); });
    vi.spyOn(document, "cookie", "set").mockImplementation(() => { throw new Error("Denied"); });
    const view = mount();
    click("Accept all");
    expect(preferences()).not.toBeInTheDocument();
    expect(script()).not.toBeNull();
    openSettings();
    expect(screen.getByRole("switch", { name: "Analytics on" })).toBeInTheDocument();
    click("Reject all");
    expect(preferences()).not.toBeInTheDocument();
    expect(script()).toBeNull();
    view.unmount();
    mount();
    expect(preferences()).toBeInTheDocument();
    expect(script()).toBeNull();
  });
});
