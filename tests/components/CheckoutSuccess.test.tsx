// @vitest-environment jsdom
import { StrictMode, type ReactNode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCartStore } from "@/store/cartStore";

const mocks = vi.hoisted(() => ({ locale: "en", fetch: vi.fn() }));
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search) }));
vi.mock("@/components/legal/LegalPage", () => ({ LegalPage: ({ title, children }: { title: string; children: ReactNode }) => <main><h1>{title}</h1>{children}</main> }));
vi.mock("@/i18n/routing", () => ({ Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
import CheckoutSuccessPage from "@/app/[locale]/checkout/success/page";

const item = { id: "product-1", name: "Product", price: 5, quantity: 1, image_url: null, unit: "each", is_alcoholic: false };
const response = (payment_status: string, status = 200) => ({ ok: status === 200, status, json: async () => ({ order_id: "order-1", payment_status }) });
async function mount(strict = false) {
  await act(async () => { render(strict ? <StrictMode><CheckoutSuccessPage /></StrictMode> : <CheckoutSuccessPage />); });
}

describe("checkout success verification", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.locale = "en";
    mocks.fetch.mockReset();
    vi.stubGlobal("fetch", mocks.fetch);
    sessionStorage.clear();
    window.history.replaceState({}, "", "/en/checkout/success?session_id=cs_test_123abc");
    useCartStore.persist.setOptions({ storage: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    } });
    useCartStore.setState({ items: [item] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(["", "?session_id=bad", "?session_id=cs_test_a&session_id=cs_test_b"])("never confirms or clears on an invalid URL %s", async (query) => {
    window.history.replaceState({}, "", `/en/checkout/success${query}`);
    await mount();
    expect(screen.getByRole("heading").textContent).toBe("Invalid payment link");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([item]);
  });

  it("waits for local confirmation then clears once, including Strict Mode and repeat visits", async () => {
    sessionStorage.setItem("checkout-cart-snapshot:cs_test_123abc", JSON.stringify([item]));
    const clear = vi.spyOn(useCartStore.getState(), "clearCart");
    mocks.fetch.mockResolvedValue(response("pending_payment"));
    await mount(true);
    expect(screen.getByRole("heading").textContent).toBe("Checking payment");
    expect(clear).not.toHaveBeenCalled();
    mocks.fetch.mockResolvedValue(response("paid"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(screen.getByRole("heading").textContent).toBe("Payment confirmed");
    expect(clear).toHaveBeenCalledOnce();
    cleanup();
    useCartStore.setState({ items: [item] });
    await mount();
    expect(clear).toHaveBeenCalledOnce();
    expect(useCartStore.getState().items).toEqual([item]);
  });

  it("preserves cart edits made while verification is pending", async () => {
    sessionStorage.setItem("checkout-cart-snapshot:cs_test_123abc", JSON.stringify([item]));
    mocks.fetch.mockResolvedValue(response("pending_payment"));
    await mount();
    useCartStore.getState().addItem({ ...item, id: "new-product" });
    mocks.fetch.mockResolvedValue(response("paid"));
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(screen.getByRole("heading").textContent).toBe("Payment confirmed");
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it.each([
    ["partially_refunded", "Payment partially refunded"], ["refunded", "Payment refunded"],
    ["payment_failed", "Payment not confirmed"], ["cancelled", "Payment not confirmed"],
    ["unknown", "Verification unavailable"],
  ])("renders %s without clearing or polling", async (status, title) => {
    mocks.fetch.mockResolvedValue(response(status));
    await mount();
    expect(screen.getByRole("heading").textContent).toBe(title);
    expect(useCartStore.getState().items).toEqual([item]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([[401, "Sign in required"], [400, "Invalid payment link"], [404, "Invalid payment link"], [500, "Verification unavailable"]])("handles HTTP %s without clearing", async (status, title) => {
    mocks.fetch.mockResolvedValue(response("paid", status));
    await mount();
    expect(screen.getByRole("heading").textContent).toBe(title);
    expect(useCartStore.getState().items).toEqual([item]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("bounds pending retries and cancels timers on unmount", async () => {
    mocks.fetch.mockResolvedValue(response("pending_payment"));
    await mount();
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(mocks.fetch).toHaveBeenCalledTimes(6);
    expect(screen.getByRole("heading").textContent).toBe("Payment pending");
    expect(useCartStore.getState().items).toEqual([item]);
    cleanup();
    mocks.fetch.mockClear();
    await mount();
    cleanup();
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(mocks.fetch).toHaveBeenCalledOnce();
  });

  it("aborts on unmount and ignores a late paid response", async () => {
    sessionStorage.setItem("checkout-cart-snapshot:cs_test_123abc", JSON.stringify([item]));
    let resolve!: (value: ReturnType<typeof response>) => void;
    mocks.fetch.mockReturnValue(new Promise((done) => { resolve = done; }));
    await mount();
    const signal = mocks.fetch.mock.calls[0][1].signal as AbortSignal;
    cleanup();
    expect(signal.aborted).toBe(true);
    await act(async () => { resolve(response("paid")); });
    expect(useCartStore.getState().items).toEqual([item]);
  });

  it.each(["network", "json", "shape"])("fails closed on %s errors", async (failure) => {
    if (failure === "network") mocks.fetch.mockRejectedValue(new Error("offline"));
    else mocks.fetch.mockResolvedValue({ ok: true, json: failure === "json" ? async () => { throw new Error("bad json"); } : async () => ({ payment_status: "paid" }) });
    await mount();
    expect(screen.getByRole("heading").textContent).toBe("Verification unavailable");
    expect(useCartStore.getState().items).toEqual([item]);
  });

  it("uses French status copy and the account link", async () => {
    mocks.locale = "fr";
    mocks.fetch.mockResolvedValue(response("pending_payment"));
    await mount();
    expect(screen.getByRole("heading").textContent).toBe("Vérification du paiement");
    expect(screen.getByRole("link", { name: "Voir mes commandes" }).getAttribute("href")).toBe("/account");
  });

  it("preserves an unrelated cart when an old paid link has no checkout snapshot", async () => {
    mocks.fetch.mockResolvedValue(response("paid"));
    await mount();
    expect(screen.getByRole("heading").textContent).toBe("Payment confirmed");
    expect(useCartStore.getState().items).toEqual([item]);
  });

  it("preserves changes made before mounting and consumes a mismatched snapshot", async () => {
    sessionStorage.setItem("checkout-cart-snapshot:cs_test_123abc", JSON.stringify([{ ...item, quantity: 2 }]));
    mocks.fetch.mockResolvedValue(response("paid"));
    await mount();
    expect(useCartStore.getState().items).toEqual([item]);
    expect(sessionStorage.getItem("checkout-cart-snapshot:cs_test_123abc")).toBeNull();
    cleanup();
    useCartStore.setState({ items: [{ ...item, quantity: 2 }] });
    await mount();
    expect(useCartStore.getState().items).toEqual([{ ...item, quantity: 2 }]);
  });

  it("restarts on query changes, aborts old requests and ignores late paid responses", async () => {
    sessionStorage.setItem("checkout-cart-snapshot:cs_test_123abc", JSON.stringify([item]));
    let resolveOld!: (value: ReturnType<typeof response>) => void;
    mocks.fetch.mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }));
    const view = render(<CheckoutSuccessPage />);
    const oldSignal = mocks.fetch.mock.calls[0][1].signal as AbortSignal;
    mocks.fetch.mockResolvedValue(response("pending_payment"));
    window.history.replaceState({}, "", "/en/checkout/success?session_id=cs_test_new");
    await act(async () => { view.rerender(<CheckoutSuccessPage />); });
    expect(oldSignal.aborted).toBe(true);
    expect(mocks.fetch.mock.lastCall?.[0]).toBe("/api/payments/status?session_id=cs_test_new");
    await act(async () => { resolveOld(response("paid")); });
    expect(screen.getByRole("heading").textContent).toBe("Checking payment");
    expect(useCartStore.getState().items).toEqual([item]);
    window.history.replaceState({}, "", "/en/checkout/success");
    await act(async () => { view.rerender(<CheckoutSuccessPage />); });
    await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
    expect(screen.getByRole("heading").textContent).toBe("Invalid payment link");
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
  });

  it("does not retain a paid heading when navigating to a different session", async () => {
    mocks.fetch.mockResolvedValueOnce(response("paid"));
    const view = render(<CheckoutSuccessPage />);
    await act(async () => {});
    expect(screen.getByRole("heading").textContent).toBe("Payment confirmed");
    mocks.fetch.mockReturnValue(new Promise(() => {}));
    window.history.replaceState({}, "", "/en/checkout/success?session_id=cs_test_new");
    await act(async () => { view.rerender(<CheckoutSuccessPage />); });
    expect(screen.getByRole("heading").textContent).toBe("Checking payment");
  });
});
