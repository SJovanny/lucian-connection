import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  retrieve: vi.fn(),
  constructEvent: vi.fn(),
  syncStripeRefund: vi.fn(),
  safeLogError: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/stripe-refunds", () => ({ syncStripeRefund: mocks.syncStripeRefund }));
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
const userId = "22222222-2222-4222-8222-222222222222";
const session = {
  id: "cs_test_webhook",
  status: "complete",
  payment_status: "paid",
  currency: "eur",
  amount_total: 2000,
  metadata: { order_id: orderId, user_id: userId, total_cents: "2000" },
  payment_intent: "pi_test",
};
const refund = {
  id: "re_test_refund",
  metadata: { order_id: orderId, order_refund_id: "33333333-3333-4333-8333-333333333333" },
};

function request() {
  return new NextRequest("https://shop.example/api/payments/webhook", {
    method: "POST",
    headers: { "stripe-signature": "test" },
    body: "signed-event",
  });
}

describe("payment webhook reliability", () => {
  let event: { id: string; type: string; data: { object: unknown } };
  let order: {
    user_id: string;
    subtotal: number;
    total_amount: number;
    coupon_id: string | null;
    payment_status: string;
    payment_reference: string | null;
    payment_session_id: string | null;
  };
  const rpc = vi.fn();
  const from = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_mock");
    event = { id: "evt_test", type: "checkout.session.completed", data: { object: session } };
    order = {
      user_id: userId,
      subtotal: 20,
      total_amount: 20,
      coupon_id: "coupon-1",
      payment_status: "pending_payment",
      payment_reference: null,
      payment_session_id: session.id,
    };
    mocks.constructEvent.mockImplementation(() => event);
    mocks.retrieve.mockResolvedValue(session);
    mocks.syncStripeRefund.mockResolvedValue({
      refund: { id: "refund-1", stripe_status: "succeeded" },
      order: { payment_status: "refunded", status: "refunded", refunded_at: "2026-09-11T00:00:00.000Z" },
    });
    rpc.mockImplementation(async (name: string) => {
      if (name === "claim_stripe_webhook_event") return { data: true, error: null };
      if (name === "finalize_paid_order") return { data: [{ payment_status: "paid", processed: true }], error: null };
      if (name === "cancel_pending_order") return { data: true, error: null };
      if (name === "complete_stripe_webhook_event") return { data: true, error: null };
      if (name === "fail_stripe_webhook_event") return { data: true, error: null };
      throw new Error(`Unexpected RPC ${name}`);
    });
    from.mockImplementation((table: string) => {
      if (table !== "orders") throw new Error(`Unexpected table ${table}`);
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...order }, error: null }),
      };
      return builder;
    });
    mocks.createAdminClient.mockReturnValue({ from, rpc });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns service unavailable when Stripe is not configured", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(mocks.constructEvent).not.toHaveBeenCalled();
  });

  it("rejects requests without a Stripe signature", async () => {
    const response = await POST(new NextRequest("https://shop.example/api/payments/webhook", {
      method: "POST",
      body: "signed-event",
    }));
    expect(response.status).toBe(400);
    expect(mocks.constructEvent).not.toHaveBeenCalled();
  });

  it("rejects an invalid Stripe signature without touching the database", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("private signature detail"); });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("private signature detail");
    expect(mocks.safeLogError).toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("acknowledges unsupported event types without claiming them", async () => {
    event = { id: "evt_unsupported", type: "charge.succeeded", data: { object: {} } };
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("acknowledges an event already claimed by another worker", async () => {
    rpc.mockImplementation(async (name: string) => name === "claim_stripe_webhook_event"
      ? { data: false, error: null }
      : { data: true, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("finalizes a verified checkout through the atomic payment RPC", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(rpc).toHaveBeenNthCalledWith(1, "claim_stripe_webhook_event", {
      p_event_id: "evt_test",
      p_event_type: "checkout.session.completed",
    });
    expect(rpc).toHaveBeenCalledWith("finalize_paid_order", {
      p_order_id: orderId,
      p_session_id: session.id,
      p_payment_intent: "pi_test",
      p_event_id: "evt_test",
    });
    expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: "evt_test" });
    expect(rpc).not.toHaveBeenCalledWith("use_coupon", expect.anything());
    expect(rpc).not.toHaveBeenCalledWith("loyalty_earn_points", expect.anything());
  });

  it("acknowledges a completed event whose payment is still unpaid", async () => {
    mocks.retrieve.mockResolvedValue({ ...session, payment_status: "unpaid" });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(from).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalledWith("finalize_paid_order", expect.anything());
    expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: "evt_test" });
  });

  it("processes a delayed async payment success with the same finalization RPC", async () => {
    event = { id: "evt_success", type: "checkout.session.async_payment_succeeded", data: { object: session } };
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("finalize_paid_order", expect.objectContaining({ p_event_id: "evt_success" }));
  });

  it("rejects a payment with mismatched metadata and records a retryable failure", async () => {
    mocks.retrieve.mockResolvedValue({ ...session, metadata: { ...session.metadata, order_id: "44444444-4444-4444-8444-444444444444" } });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Payment metadata does not match order" });
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", {
      p_event_id: "evt_test",
      p_error_code: "WebhookProcessingError",
    });
    expect(rpc).not.toHaveBeenCalledWith("complete_stripe_webhook_event", expect.anything());
  });

  it("rejects a payment with an invalid amount", async () => {
    mocks.retrieve.mockResolvedValue({ ...session, amount_total: 1900 });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", expect.anything());
    expect(rpc).not.toHaveBeenCalledWith("finalize_paid_order", expect.anything());
  });

  it("retries when the finalization RPC fails", async () => {
    rpc.mockImplementation(async (name: string) => {
      if (name === "claim_stripe_webhook_event") return { data: true, error: null };
      if (name === "finalize_paid_order") return { data: null, error: { message: "database unavailable" } };
      if (name === "fail_stripe_webhook_event") return { data: true, error: null };
      return { data: true, error: null };
    });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to finalize order" });
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", expect.objectContaining({ p_event_id: "evt_test" }));
    expect(rpc).not.toHaveBeenCalledWith("complete_stripe_webhook_event", expect.anything());
  });

  it.each(["checkout.session.expired", "checkout.session.async_payment_failed"])(
    "cancels a pending checkout through the atomic RPC for %s",
    async (type) => {
      event = { id: `evt_${type}`, type, data: { object: { ...session, payment_status: "unpaid" } } };
      mocks.retrieve.mockResolvedValue({ ...session, payment_status: "unpaid" });
      const response = await POST(request());
      expect(response.status).toBe(200);
      expect(rpc).toHaveBeenCalledWith("cancel_pending_order", { p_order_id: orderId });
      expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: event.id });
    },
  );

  it("does not cancel an order already paid when a stale expiration arrives", async () => {
    order.payment_status = "paid";
    event = { id: "evt_expired", type: "checkout.session.expired", data: { object: session } };
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalledWith("cancel_pending_order", expect.anything());
    expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: event.id });
  });

  it("does not cancel when Stripe confirms the canonical session as paid", async () => {
    event = { id: "evt_expired", type: "checkout.session.expired", data: { object: { ...session, payment_status: "unpaid" } } };
    mocks.retrieve.mockResolvedValue(session);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(rpc).not.toHaveBeenCalledWith("cancel_pending_order", expect.anything());
    expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: event.id });
  });

  it("retries cancellation failures without completing the event", async () => {
    event = { id: "evt_expired", type: "checkout.session.expired", data: { object: { ...session, payment_status: "unpaid" } } };
    mocks.retrieve.mockResolvedValue({ ...session, payment_status: "unpaid" });
    rpc.mockImplementation(async (name: string) => {
      if (name === "claim_stripe_webhook_event") return { data: true, error: null };
      if (name === "cancel_pending_order") return { data: null, error: { message: "database unavailable" } };
      if (name === "fail_stripe_webhook_event") return { data: true, error: null };
      return { data: true, error: null };
    });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", expect.objectContaining({ p_event_id: event.id }));
    expect(rpc).not.toHaveBeenCalledWith("complete_stripe_webhook_event", expect.anything());
  });

  it.each(["refund.created", "refund.updated", "refund.failed"])(
    "synchronizes %s through the refund service",
    async (type) => {
      event = { id: `evt_${type}`, type, data: { object: refund } };
      const response = await POST(request());
      expect(response.status).toBe(200);
      expect(mocks.syncStripeRefund).toHaveBeenCalledWith(expect.objectContaining({
        stripeRefundId: refund.id,
        localRefundId: refund.metadata.order_refund_id,
      }));
      expect(rpc).toHaveBeenCalledWith("complete_stripe_webhook_event", { p_event_id: event.id });
    },
  );

  it("retries a refund event when Stripe synchronization fails", async () => {
    event = { id: "evt_refund", type: "refund.updated", data: { object: refund } };
    mocks.syncStripeRefund.mockRejectedValue(new Error("private refund detail"));
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("private refund detail");
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", expect.objectContaining({ p_event_id: event.id }));
    expect(rpc).not.toHaveBeenCalledWith("complete_stripe_webhook_event", expect.anything());
  });

  it("retries when marking a successfully processed event fails", async () => {
    rpc.mockImplementation(async (name: string) => {
      if (name === "claim_stripe_webhook_event") return { data: true, error: null };
      if (name === "complete_stripe_webhook_event") return { data: null, error: { message: "write failed" } };
      if (name === "fail_stripe_webhook_event") return { data: true, error: null };
      return { data: [{ payment_status: "paid", processed: true }], error: null };
    });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(rpc).toHaveBeenCalledWith("fail_stripe_webhook_event", expect.objectContaining({ p_event_id: "evt_test" }));
  });
});
