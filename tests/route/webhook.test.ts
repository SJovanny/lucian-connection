import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createAdminClient: vi.fn(), retrieve: vi.fn(), constructEvent: vi.fn(), safeLogError: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/api-request", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/api-request")>(),
  safeLogError: mocks.safeLogError,
}));
vi.mock("stripe", () => ({ default: class {
  webhooks = { constructEvent: mocks.constructEvent };
  checkout = { sessions: { retrieve: mocks.retrieve } };
} }));
import { POST } from "@/app/api/payments/webhook/route";

const orderId = "11111111-1111-4111-8111-111111111111";
const session = {
  id: "cs_test_webhook", status: "complete", payment_status: "paid", currency: "eur",
  amount_total: 2000, metadata: { order_id: orderId, total_cents: "2000" }, payment_intent: "pi_test",
};
const deliver = () => POST(new NextRequest("https://shop.example/api/payments/webhook", {
  method: "POST", headers: { "stripe-signature": "test" }, body: "signed-event",
}));

describe("payment webhook reliability", () => {
  let order: { payment_status: string; paid_at: string | null; user_id: string; subtotal: number; total_amount: number; coupon_id: string };
  let settings: { loyalty_points_per_euro?: unknown } | null;
  let settingsError: object | null;
  let readError: object | null;
  let updateError: object | null;
  let concurrentStatus: string | undefined;
  const updates = vi.fn();
  const rpc = vi.fn();
  const from = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_mock");
    order = { payment_status: "pending_payment", paid_at: null, user_id: "user-1", subtotal: 20, total_amount: 20, coupon_id: "coupon-1" };
    settings = { loyalty_points_per_euro: 2 };
    settingsError = readError = updateError = null;
    concurrentStatus = undefined;
    mocks.constructEvent.mockReturnValue({ id: "evt_test", type: "checkout.session.completed", data: { object: session } });
    mocks.retrieve.mockResolvedValue(session);
    rpc.mockResolvedValue({ data: true, error: null });
    from.mockImplementation((table: string) => {
      let patch: Partial<typeof order> | undefined;
      const filters: Record<string, unknown> = {};
      const execute = async () => {
        if (table === "store_settings") return { data: settings, error: settingsError };
        if (!patch) return { data: readError ? null : { ...order }, error: readError };
        updates(patch, filters);
        if (updateError) return { data: null, error: updateError };
        if (concurrentStatus !== undefined) order.payment_status = concurrentStatus;
        if (filters.payment_status !== order.payment_status) return { data: null, error: null };
        Object.assign(order, patch);
        return { data: { id: orderId }, error: null };
      };
      const builder = {
        select: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
        eq: vi.fn((key: string, value: unknown) => { filters[key] = value; return builder; }),
        update: vi.fn((value: Partial<typeof order>) => { patch = value; return builder; }),
        single: execute, maybeSingle: execute,
      };
      return builder;
    });
    mocks.createAdminClient.mockReturnValue({ from, rpc });
  });
  afterEach(() => vi.unstubAllEnvs());

  function cancellation(type = "checkout.session.expired") {
    mocks.constructEvent.mockReturnValue({ id: "evt_cancel", type, data: { object: session } });
    mocks.retrieve.mockResolvedValue({ ...session, status: "expired", payment_status: "unpaid" });
  }

  it("retries a failed loyalty award without rewriting paid_at or skipping side effects", async () => {
    rpc.mockImplementation(async (name: string) => ({ data: true, error: name === "loyalty_earn_points" ? { message: "outage" } : null }));
    expect((await deliver()).status).toBe(500);
    expect(order.payment_status).toBe("paid");
    const paidAt = order.paid_at;
    expect(paidAt).toEqual(expect.any(String));
    rpc.mockResolvedValue({ data: false, error: null });
    expect((await deliver()).status).toBe(200);
    expect(order.paid_at).toBe(paidAt);
    expect(updates).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls.map(([name]) => name)).toEqual(["use_coupon", "loyalty_earn_points", "use_coupon", "loyalty_earn_points"]);
  });

  it.each([null, {}, { loyalty_points_per_euro: null }, { loyalty_points_per_euro: "" },
    { loyalty_points_per_euro: " " }, { loyalty_points_per_euro: "invalid" },
    { loyalty_points_per_euro: -1 }, { loyalty_points_per_euro: Infinity },
    { loyalty_points_per_euro: false }])("retries missing or invalid loyalty settings %j", async (value) => {
    settings = value;
    expect((await deliver()).status).toBe(500);
    expect(rpc).not.toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
    settings = { loyalty_points_per_euro: 2 };
    expect((await deliver()).status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("loyalty_earn_points", expect.objectContaining({ p_points: 40 }));
    expect(updates).toHaveBeenCalledTimes(1);
  });

  it("retries loyalty settings read errors even when data is returned", async () => {
    settingsError = { message: "database unavailable" };
    expect((await deliver()).status).toBe(500);
    expect(rpc).not.toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
    settingsError = null;
    expect((await deliver()).status).toBe(200);
  });

  it.each([0, "0"])("preserves a legitimate zero loyalty rate %j", async (rate) => {
    settings = { loyalty_points_per_euro: rate };
    expect((await deliver()).status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("loyalty_earn_points", expect.objectContaining({ p_points: 0 }));
  });

  it("acknowledges delayed unpaid completion and processes later async success", async () => {
    mocks.retrieve.mockResolvedValue({ ...session, payment_status: "unpaid" });
    expect((await deliver()).status).toBe(200);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
    mocks.constructEvent.mockReturnValue({ id: "evt_success", type: "checkout.session.async_payment_succeeded", data: { object: session } });
    mocks.retrieve.mockResolvedValue(session);
    expect((await deliver()).status).toBe(200);
    expect(order.payment_status).toBe("paid");
    expect(rpc).toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
  });

  it.each(["cancelled", "refunded", "partially_refunded"])("skips paid side effects for %s orders", async (status) => {
    order.payment_status = status;
    expect((await deliver()).status).toBe(200);
    expect(updates).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each(["cancelled", "refunded", "partially_refunded"])("detects a zero-row paid update racing with %s", async (status) => {
    concurrentStatus = status;
    expect((await deliver()).status).toBe(200);
    expect(updates).toHaveBeenCalledWith(expect.objectContaining({ payment_status: "paid" }), { id: orderId, payment_status: "pending_payment" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("retries side effects after a concurrent paid update without changing paid_at", async () => {
    concurrentStatus = "paid";
    order.paid_at = "2026-09-01T00:00:00.000Z";
    expect((await deliver()).status).toBe(200);
    expect(order.paid_at).toBe("2026-09-01T00:00:00.000Z");
    expect(rpc).toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
  });

  it("retries paid update errors before running side effects", async () => {
    updateError = { message: "write failed" };
    expect((await deliver()).status).toBe(500);
    expect(rpc).not.toHaveBeenCalled();
    updateError = null;
    expect((await deliver()).status).toBe(200);
  });

  it("retries coupon usage errors on a locally paid order", async () => {
    rpc.mockResolvedValueOnce({ error: { message: "coupon unavailable" } });
    expect((await deliver()).status).toBe(500);
    expect((await deliver()).status).toBe(200);
    expect(updates).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
  });

  it.each(["checkout.session.expired", "checkout.session.async_payment_failed"])("retries cancellation DB errors for %s before releasing coupon", async (type) => {
    cancellation(type);
    updateError = { message: "write failed" };
    expect((await deliver()).status).toBe(500);
    expect(rpc).not.toHaveBeenCalled();
    updateError = null;
    expect((await deliver()).status).toBe(200);
    expect(order.payment_status).toBe("cancelled");
    expect(rpc).toHaveBeenCalledWith("release_coupon_reservation", { p_order_id: orderId, p_user_id: null });
  });

  it("retries coupon release for an already cancelled order", async () => {
    cancellation();
    rpc.mockResolvedValueOnce({ error: { message: "release failed" } });
    expect((await deliver()).status).toBe(500);
    expect(order.payment_status).toBe("cancelled");
    expect((await deliver()).status).toBe(200);
    expect(updates).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it.each(["paid", "refunded", "partially_refunded"])("does not release coupons on a stale failure for a %s order", async (status) => {
    cancellation("checkout.session.async_payment_failed");
    order.payment_status = status;
    expect((await deliver()).status).toBe(200);
    expect(updates).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not cancel or release when canonical Stripe session is already paid", async () => {
    cancellation();
    mocks.retrieve.mockResolvedValue(session);
    expect((await deliver()).status).toBe(200);
    expect(updates).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not release a coupon if payment wins the cancellation update race", async () => {
    cancellation();
    concurrentStatus = "paid";
    expect((await deliver()).status).toBe(200);
    expect(order.payment_status).toBe("paid");
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each(["checkout.session.completed", "checkout.session.expired", "checkout.session.async_payment_failed"])("logs and retries external retrieval failure for %s", async (type) => {
    mocks.constructEvent.mockReturnValue({ id: "evt_test", type, data: { object: session } });
    const error = new Error("private Stripe detail");
    mocks.retrieve.mockRejectedValue(error);
    const response = await deliver();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("private Stripe detail");
    expect(mocks.safeLogError).toHaveBeenCalledWith(expect.any(String), error);
    expect(updates).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each(["checkout.session.completed", "checkout.session.expired"])("retries order read failures for %s", async (type) => {
    mocks.constructEvent.mockReturnValue({ id: "evt_test", type, data: { object: session } });
    readError = { message: "read failed" };
    expect((await deliver()).status).toBe(500);
    expect(updates).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
