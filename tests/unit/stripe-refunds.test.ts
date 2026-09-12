import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { syncStripeRefund } from "@/lib/stripe-refunds";
import type { Database } from "@/types/database.types";

const orderId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const refundId = "33333333-3333-4333-8333-333333333333";
const itemId = "44444444-4444-4444-8444-444444444444";

const storedRefund = {
  id: refundId,
  order_id: orderId,
  user_id: userId,
  request_key: "admin-refund:request-key-123456789",
  amount: 15,
  product_amount: 10,
  items: [{ order_item_id: itemId, product_id: "55555555-5555-4555-8555-555555555555", quantity: 1, amount: 10 }],
  status: "pending",
  stripe_refund_id: null,
  stripe_status: "pending",
  stripe_reference: null,
  stripe_reference_status: null,
  stripe_reference_type: null,
} as const;

const order = {
  id: orderId,
  user_id: userId,
  subtotal: 10,
  total_amount: 15,
  discount_amount: 0,
  payment_reference: "pi_test123",
};

function stripeRefund(overrides: Partial<Stripe.Refund> = {}) {
  return {
    id: "re_test123",
    payment_intent: "pi_test123",
    status: "succeeded",
    amount: 1500,
    failure_reason: null,
    pending_reason: null,
    metadata: {
      order_id: orderId,
      order_refund_id: refundId,
      product_amount: "10.00",
      items: JSON.stringify(storedRefund.items),
    },
    destination_details: null,
    ...overrides,
  } as unknown as Stripe.Refund;
}

function createSupabase({
  stored = storedRefund,
  final = storedRefund,
  orderData = order,
  rpcRows = [{
    refund_id: refundId,
    refund_order_id: orderId,
    refund_status: "succeeded",
    stripe_status: "succeeded",
    refund_amount: 15,
    refund_product_amount: 10,
    refund_items: storedRefund.items,
    payment_status: "refunded",
    order_status: "refunded",
    refunded_at: "2026-09-11T00:00:00.000Z",
    points_adjustment: -10,
  }],
}: {
  stored?: typeof storedRefund | null;
  final?: typeof storedRefund;
  orderData?: typeof order;
  rpcRows?: unknown[] | null;
} = {}) {
  const rpc = vi.fn().mockResolvedValue({ data: rpcRows, error: null });
  const from = vi.fn((table: string) => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => table === "order_refunds"
        ? { data: stored, error: null }
        : { data: null, error: null }),
      single: vi.fn(async () => table === "orders"
        ? { data: orderData, error: null }
        : { data: final, error: null }),
    };
    return builder;
  });
  return {
    client: { from, rpc } as unknown as SupabaseClient<Database>,
    from,
    rpc,
  };
}

describe("Stripe refund synchronization", () => {
  let stripe: { refunds: { retrieve: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    stripe = { refunds: { retrieve: vi.fn().mockResolvedValue(stripeRefund()) } };
  });

  afterEach(() => vi.restoreAllMocks());

  it("retrieves the canonical refund and synchronizes the reserved allocation", async () => {
    const supabase = createSupabase();
    const result = await syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
      localRefundId: refundId,
    });

    expect(stripe.refunds.retrieve).toHaveBeenCalledWith("re_test123");
    expect(supabase.rpc).toHaveBeenCalledWith("sync_stripe_refund", expect.objectContaining({
      p_local_refund_id: refundId,
      p_order_id: orderId,
      p_user_id: userId,
      p_stripe_refund_id: "re_test123",
      p_payment_intent: "pi_test123",
      p_amount: 15,
      p_product_amount: 10,
      p_items: storedRefund.items,
      p_status: "succeeded",
    }));
    expect(result.refund.id).toBe(refundId);
    expect(result.order.payment_status).toBe("refunded");
  });

  it("accepts a payment intent object returned by Stripe", async () => {
    const supabase = createSupabase();
    stripe.refunds.retrieve.mockResolvedValue(stripeRefund({
      payment_intent: { id: "pi_test123" } as unknown as Stripe.PaymentIntent,
    }));
    await syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
      localRefundId: refundId,
    });
    expect(supabase.rpc).toHaveBeenCalledWith("sync_stripe_refund", expect.objectContaining({ p_payment_intent: "pi_test123" }));
  });

  it("does not replace an empty local allocation with Stripe metadata", async () => {
    const supabase = createSupabase({
      stored: { ...storedRefund, items: [] } as unknown as typeof storedRefund,
    });
    await syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
      localRefundId: refundId,
    });
    expect(supabase.rpc).toHaveBeenCalledWith("sync_stripe_refund", expect.objectContaining({ p_items: [] }));
  });

  it("preserves a zero product allocation for a fee-only refund", async () => {
    const feeOnlyRefund = {
      ...storedRefund,
      amount: 5,
      product_amount: 0,
      items: [],
    } as unknown as typeof storedRefund;
    const supabase = createSupabase({ stored: feeOnlyRefund });
    stripe.refunds.retrieve.mockResolvedValue(stripeRefund({
      amount: 500,
      metadata: { order_id: orderId, order_refund_id: refundId, product_amount: "0" },
    }));

    await syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
      localRefundId: refundId,
    });

    expect(supabase.rpc).toHaveBeenCalledWith("sync_stripe_refund", expect.objectContaining({
      p_product_amount: 0,
      p_items: [],
    }));
  });

  it("rejects malformed Stripe identifiers before making external calls", async () => {
    const supabase = createSupabase();
    await expect(syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "refund-not-safe",
      localRefundId: refundId,
    })).rejects.toThrow("Invalid Stripe refund identifier");
    expect(stripe.refunds.retrieve).not.toHaveBeenCalled();
  });

  it("rejects an invalid product allocation from Stripe metadata", async () => {
    const supabase = createSupabase({ stored: null });
    stripe.refunds.retrieve.mockResolvedValue(stripeRefund({
      metadata: { order_id: orderId, product_amount: "not-a-number" },
      amount: 1000,
    }));
    await expect(syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
    })).rejects.toThrow("Stripe refund product amount is invalid");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rejects an untrusted partial external refund without a local allocation", async () => {
    const supabase = createSupabase({ stored: null });
    stripe.refunds.retrieve.mockResolvedValue(stripeRefund({
      metadata: { order_id: orderId },
      amount: 1000,
    }));
    await expect(syncStripeRefund({
      supabase: supabase.client,
      stripe: stripe as unknown as Stripe,
      stripeRefundId: "re_test123",
    })).rejects.toThrow("Partial Stripe refund has no trusted product allocation");
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
