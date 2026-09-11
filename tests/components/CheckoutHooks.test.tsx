// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckoutQuote } from "@/lib/client/useCheckoutQuote";
import { useCheckoutCoupon } from "@/lib/client/useCheckoutCoupon";
import { useCheckoutAgeRequirement } from "@/lib/client/useCheckoutAgeRequirement";
import { useCheckoutContact } from "@/lib/client/useCheckoutContact";
import { fetchPricingQuote } from "@/lib/client-pricing";
import type { PricingQuote } from "@/lib/pricing-types";
import type { CartItem } from "@/store/cartStore";

const { getUser, maybeSingle } = vi.hoisted(() => ({ getUser: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({
  auth: { getUser }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
}) }));
vi.mock("@/lib/client-pricing", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/client-pricing")>(), fetchPricingQuote: vi.fn(),
}));

const items: CartItem[] = [{ id: "product", name: "Product", price: 10, quantity: 1, image_url: null, unit: "each", is_alcoholic: false }];
const quote: PricingQuote = { currency: "eur", items: [], subtotal_cents: 1000, total_cents: 1000, preparation_fee_cents: 0, discount_cents: 0, coupon: null };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
beforeEach(() => { vi.resetAllMocks(); vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("checkout quotes", () => {
  it.each(["resolve", "reject"] as const)("ignores an older request that finishes with %s", async (completion) => {
    const old = deferred<PricingQuote>();
    const current = deferred<PricingQuote>();
    vi.mocked(fetchPricingQuote).mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const { result, rerender } = renderHook(({ cart }) => useCheckoutQuote(cart, null, "en"), { initialProps: { cart: items } });
    rerender({ cart: [{ ...items[0], quantity: 2 }] });
    await act(async () => { current.resolve({ ...quote, total_cents: 2000 }); });
    await act(async () => { if (completion === "resolve") old.resolve(quote); else old.reject(new Error("Old network failure")); });
    expect(result.current.displayQuote?.total_cents).toBe(2000);
    expect(result.current.currentQuoteError).toBeNull();
  });

  it("hides stale totals immediately when coupon/locale changes and reports current network errors", async () => {
    vi.mocked(fetchPricingQuote).mockResolvedValueOnce(quote);
    const { result, rerender } = renderHook(({ couponId, locale }: { couponId: string | null; locale: "en" | "fr" }) => useCheckoutQuote(items, couponId, locale), { initialProps: { couponId: null, locale: "en" } });
    await waitFor(() => expect(result.current.displayQuote).toEqual(quote));
    const next = deferred<PricingQuote>();
    vi.mocked(fetchPricingQuote).mockReturnValueOnce(next.promise);
    rerender({ couponId: "coupon", locale: "fr" });
    expect(result.current.displayQuote).toBeNull();
    await act(async () => { next.reject(new Error("Network unavailable")); });
    expect(result.current.currentQuoteError).toBe("Network unavailable");
    expect(fetchPricingQuote).toHaveBeenLastCalledWith({ items: [{ id: "product", quantity: 1 }], couponId: "coupon", locale: "fr" });
  });
});

describe("checkout coupons", () => {
  it("recovers from network errors and normalizes a successful retry", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(new Response(JSON.stringify({ valid: true, coupon: { id: "coupon", code: "SAVE" } })));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useCheckoutCoupon(items, "en"));
    act(() => result.current.setCouponCode(" save "));
    await act(() => result.current.handleApplyCoupon());
    expect(result.current.couponError).toBe("Error validating coupon");
    expect(result.current.isValidatingCoupon).toBe(false);
    expect(result.current.appliedCoupon).toBeNull();
    await act(() => result.current.handleApplyCoupon());
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ code: "SAVE", items: [{ id: "product", quantity: 1 }], locale: "en" });
    expect(result.current.appliedCoupon).toEqual({ id: "coupon", code: "SAVE" });
    expect(result.current.couponCode).toBe("");
    expect(result.current.couponError).toBeNull();
    act(() => result.current.removeCoupon());
    expect(result.current.appliedCoupon).toBeNull();
  });
});

describe("checkout age requirements", () => {
  it.each(["network", "http", "malformed"])("blocks on %s failure", async (failure) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => failure === "network"
      ? Promise.reject(new Error("Offline"))
      : Promise.resolve(new Response(JSON.stringify(failure === "http" ? { containsAlcohol: false } : {}), { status: failure === "http" ? 500 : 200 }))));
    const { result } = renderHook(() => useCheckoutAgeRequirement(items));
    expect(result.current.status).toBe("pending");
    await waitFor(() => expect(result.current.status).toBe("error"));
  });

  it("requires a fresh check for changed products and preserves a server-required age confirmation", async () => {
    const old = deferred<Response>();
    const next = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise));
    const { result, rerender } = renderHook(({ cart }) => useCheckoutAgeRequirement(cart), { initialProps: { cart: items } });
    rerender({ cart: [{ ...items[0], id: "other" }] });
    await act(async () => old.resolve(new Response(JSON.stringify({ containsAlcohol: false }))));
    expect(result.current.status).toBe("pending");
    act(() => result.current.requireAgeConfirmation());
    await act(async () => next.resolve(new Response(JSON.stringify({ containsAlcohol: false }))));
    expect(result.current.status).toBe("ready");
    expect(result.current.containsAlcohol).toBe(true);
  });
});

describe("checkout contact", () => {
  it("fails closed when authentication cannot be loaded", async () => {
    getUser.mockRejectedValue(new Error("Offline"));
    const { result } = renderHook(() => useCheckoutContact());
    await waitFor(() => expect(result.current.authStatus).toBe("unauthenticated"));
  });

  it("loads profile defaults without overwriting contact edits made while loading", async () => {
    const profile = deferred<{ data: { full_name: string; phone: string } }>();
    getUser.mockResolvedValue({ data: { user: { id: "user", email: "user@example.com", user_metadata: {} } } });
    maybeSingle.mockReturnValue(profile.promise);
    const { result } = renderHook(() => useCheckoutContact());
    await waitFor(() => expect(result.current.authStatus).toBe("authenticated"));
    act(() => result.current.setContactInfo({ fullName: "Edited name", email: "edited@example.com", phone: "123" }));
    await act(async () => profile.resolve({ data: { full_name: "Profile name", phone: "456" } }));
    expect(result.current.contactInfo).toEqual({ fullName: "Edited name", email: "edited@example.com", phone: "123" });
  });
});
