// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoyaltySection } from "@/components/account/LoyaltySection";
import { useLoyalty, type LoyaltyData } from "@/lib/client/useLoyalty";

const locale = vi.hoisted(() => ({ value: "en" }));
vi.mock("next-intl", () => ({ useLocale: () => locale.value }));

const createdAt = "2026-06-15T12:00:00Z";
const data: LoyaltyData = {
  balance: 1234,
  rewards: [{ id: "reward", name: "Reward", points_cost: 1000, discount_type: "fixed",
    discount_value: 12.5, is_active: true, created_at: createdAt, updated_at: createdAt }],
  ledger: [{ id: "entry", user_id: "user", order_id: null, order_refund_id: null,
    type: "earn", points: 1234, balance_after: 1234, description: "Purchase", created_at: createdAt }],
  redemptions: [],
};
const json = (value: unknown) => new Response(JSON.stringify(value));
function failure(kind: string) {
  if (kind === "network") return Promise.reject(new TypeError("Failed to fetch"));
  if (kind === "http") return Promise.resolve(new Response("Internal error", { status: 500 }));
  if (kind === "json") return Promise.resolve(new Response("not json"));
  return Promise.resolve(json({}));
}
beforeEach(() => { locale.value = "en"; });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("loyalty requests", () => {
  it.each(["network", "http", "json", "shape"])("recovers from a %s load failure", async (kind) => {
    const fetchMock = vi.fn().mockImplementationOnce(() => failure(kind)).mockResolvedValueOnce(json(data));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useLoyalty());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loadError).toBe(true);
    expect(result.current.data).toBeNull();
    await act(() => result.current.load());
    expect(result.current.data).toEqual(data);
    expect(result.current.loadError).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it.each(["network", "http", "json", "shape"])("resets redeeming after a %s failure and supports recovery", async (kind) => {
    const refreshed = { ...data, balance: 234 };
    const fetchMock = vi.fn().mockResolvedValueOnce(json(data))
      .mockImplementationOnce(() => failure(kind))
      .mockResolvedValueOnce(json(data))
      .mockResolvedValueOnce(json({ coupon_code: "LOYALTY" }))
      .mockResolvedValueOnce(json(refreshed));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useLoyalty());
    await waitFor(() => expect(result.current.data).toEqual(data));
    await act(() => result.current.redeem("reward"));
    expect(result.current.redeeming).toBeNull();
    expect(result.current.redeemError).toBe("reward");
    expect(result.current.couponCode).toBeNull();
    await act(() => result.current.load());
    expect(result.current.redeemError).toBeNull();
    await act(() => result.current.redeem("reward"));
    expect(result.current.couponCode).toBe("LOYALTY");
    expect(result.current.data).toEqual(refreshed);
    expect(result.current.redeeming).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith("/api/loyalty/redeem", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reward_id: "reward" }),
    });
  });

  it("keeps redemption success when reload fails and retries only the load", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json(data))
      .mockResolvedValueOnce(json({ coupon_code: "LOYALTY" }))
      .mockRejectedValueOnce(new TypeError("Offline"))
      .mockResolvedValueOnce(json({ ...data, balance: 234 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<LoyaltySection />);
    fireEvent.click((await screen.findAllByRole("button", { name: "Échanger" }))[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to refresh");
    expect(screen.getByRole("status")).toHaveTextContent("Your coupon LOYALTY");
    expect(screen.getAllByRole("button", { name: "Échanger" })[0]).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByText("234 points");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/loyalty/redeem")).toHaveLength(1);
  });

  it("prevents duplicate redemption while a request is pending and releases the flag on rejection", async () => {
    let reject!: (reason: Error) => void;
    const pending = new Promise<Response>((_, no) => { reject = no; });
    const fetchMock = vi.fn().mockResolvedValueOnce(json(data)).mockReturnValueOnce(pending);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useLoyalty());
    await waitFor(() => expect(result.current.loading).toBe(false));
    let request!: Promise<void>;
    act(() => { request = result.current.redeem("reward"); void result.current.redeem("reward"); });
    expect(result.current.redeeming).toBe("reward");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => { reject(new Error("Offline")); await request; });
    expect(result.current.redeeming).toBeNull();
  });
});

describe.each(["fr", "en"])("loyalty UI in %s", (language) => {
  beforeEach(() => { locale.value = language; });

  it("shows a translated actionable load error and retries successfully with locale formatting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(json(data)));
    render(<LoyaltySection />);
    expect(await screen.findByRole("alert")).toHaveTextContent(language === "en" ? "Check your connection" : "Vérifiez votre connexion");
    fireEvent.click(screen.getByRole("button", { name: language === "en" ? "Retry" : "Réessayer" }));
    const balance = new Intl.NumberFormat(language).format(data.balance);
    await screen.findByText(`${balance} points`, { exact: true, normalizer: (text) => text });
    expect(screen.getByText(new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(createdAt)))).toBeInTheDocument();
    const currency = new Intl.NumberFormat(language, { style: "currency", currency: "EUR" }).format(12.5);
    expect(screen.getAllByText(currency, { exact: true, normalizer: (text) => text }).length).toBeGreaterThan(0);
  });

  it("shows a translated redemption error with a working refresh action", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(json(data)).mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(json(data)));
    render(<LoyaltySection />);
    fireEvent.click((await screen.findAllByRole("button", { name: "Échanger" }))[0]);
    expect(await screen.findByRole("alert")).toHaveTextContent(language === "en" ? "Unable to confirm" : "Impossible de confirmer");
    expect(screen.getAllByRole("button", { name: "Échanger" })[0]).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: language === "en" ? "Refresh points and coupons" : "Actualiser les points et bons" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });
});
