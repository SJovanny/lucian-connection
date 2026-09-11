import { NextRequest } from "next/server";
import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getPricingQuote: vi.fn(),
  validatePickupAt: vi.fn(),
  stripeConstructor: vi.fn(),
  productCreate: vi.fn(),
  couponCreate: vi.fn(),
  sessionCreate: vi.fn(),
  sessionExpire: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/pricing", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/pricing")>(),
  getPricingQuote: mocks.getPricingQuote,
}));
vi.mock("@/lib/pickup-rules", () => ({ validatePickupAt: mocks.validatePickupAt }));
vi.mock("stripe", async (importOriginal) => {
  const { default: ActualStripe } = await importOriginal<typeof import("stripe")>();
  return { default: class {
    static errors = ActualStripe.errors;
    constructor() { mocks.stripeConstructor(); }
    products = { create: mocks.productCreate };
    coupons = { create: mocks.couponCreate };
    checkout = { sessions: { create: mocks.sessionCreate, expire: mocks.sessionExpire } };
  } };
});

import { POST } from "@/app/api/payments/create-checkout-session/route";

const productId = "11111111-1111-4111-8111-111111111111";
const couponId = "22222222-2222-4222-8222-222222222222";
const payload = {
  items: [{ id: productId, quantity: 2 }],
  phone: "+33123456789",
  notes: "",
  locale: "fr",
  coupon_id: null,
  quote_total_cents: 1000,
  full_name: "Test Customer",
  email: "form@example.com",
  terms_accepted: true,
  age_confirmed: false,
  pickup_at: "2026-09-15T10:00:00.000Z",
};
const quote = {
  items: [{ product_id: productId, product_name: "Product", quantity: 2, unit_price_cents: 500, total_price_cents: 1000 }],
  subtotal_cents: 1000,
  preparation_fee_cents: 0,
  discount_cents: 0,
  total_cents: 1000,
  coupon: null,
};

function request(body: unknown = payload) {
  return new NextRequest("https://shop.example/api/payments/create-checkout-session", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "checkout-test" },
    body: JSON.stringify(body),
  });
}

function setupDatabase() {
  const orderInsert = vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null });
  const referenceWrite = vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null });
  const cancelWrite = vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null });
  const legalInsert = vi.fn().mockResolvedValue({ error: null });
  const itemsInsert = vi.fn().mockResolvedValue({ error: null });
  const products = vi.fn().mockResolvedValue({ data: [{ id: productId, is_alcoholic: false }], error: null });
  const release = vi.fn().mockResolvedValue({ data: false, error: null });
  const rpc = vi.fn((name: string) => name === "release_coupon_reservation"
    ? release()
    : Promise.resolve({ data: name === "reserve_coupon" ? true : [], error: null }));
  const update = vi.fn((values: Record<string, unknown>) => {
    const builder = {
      eq: vi.fn(() => builder),
      select: vi.fn(() => builder),
      single: "payment_reference" in values ? referenceWrite : cancelWrite,
    };
    return builder;
  });
  const from = vi.fn((table: string) => {
    switch (table) {
      case "orders": return { insert: () => ({ select: () => ({ single: orderInsert }) }), update };
      case "order_items": return { insert: itemsInsert };
      case "legal_acceptances": return { insert: legalInsert };
      case "products": return { select: () => ({ in: () => ({ eq: products }) }) };
      case "pickup_opening_hours": return { select: () => Promise.resolve({ data: [], error: null }) };
      default: throw new Error(`Unexpected table ${table}`);
    }
  });
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "account@example.com" } } });
  mocks.createClient.mockResolvedValue({ auth: { getUser }, from, rpc });
  return { orderInsert, referenceWrite, cancelWrite, legalInsert, itemsInsert, products, release, rpc, update, from, getUser };
}

describe("checkout route", () => {
  let db: ReturnType<typeof setupDatabase>;
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    db = setupDatabase();
    mocks.validatePickupAt.mockReturnValue(true);
    mocks.getPricingQuote.mockResolvedValue(quote);
    mocks.productCreate.mockResolvedValue({ id: "prod-1" });
    mocks.sessionCreate.mockResolvedValue({ id: "session-1", url: "https://checkout.stripe.test/session-1" });
    mocks.sessionExpire.mockResolvedValue({ id: "session-1", status: "expired" });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("accepts the current client payload, records legal documents, and saves the session before returning its URL", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.test/session-1", session_id: "session-1", quote });
    expect(mocks.getPricingQuote).toHaveBeenCalledWith(expect.anything(), payload.items, { couponId: null, userId: "user-1", locale: "fr" });
    expect(db.legalInsert).toHaveBeenCalledWith(["terms", "pickup_refunds"].map((document_type) => ({
      user_id: "user-1", order_id: "order-1", document_type, document_version: "1.0", user_agent: "checkout-test",
    })));
    expect(db.legalInsert.mock.invocationCallOrder[0]).toBeLessThan(mocks.stripeConstructor.mock.invocationCallOrder[0]);
    expect(db.update).toHaveBeenCalledWith({ payment_reference: "session-1" });
    expect(db.referenceWrite).toHaveBeenCalledOnce();
    expect(mocks.sessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "account@example.com" }),
      { idempotencyKey: "checkout-session:order-1" },
    );
    expect(mocks.sessionExpire).not.toHaveBeenCalled();
    expect(db.cancelWrite).not.toHaveBeenCalled();
  });

  it.each([false, true])("stops before all Stripe calls when legal recording fails (alcohol=%s)", async (alcohol) => {
    db.products.mockResolvedValue({ data: [{ id: productId, is_alcoholic: alcohol }], error: null });
    db.legalInsert.mockResolvedValue({ error: { code: "LEGAL_FAILURE" } });
    const response = await POST(request({ ...payload, age_confirmed: alcohol }));
    expect(response.status).toBe(500);
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(mocks.productCreate).not.toHaveBeenCalled();
    expect(mocks.couponCreate).not.toHaveBeenCalled();
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
    expect(db.rpc).toHaveBeenCalledWith("release_coupon_reservation", { p_order_id: "order-1", p_user_id: "user-1" });
    expect(db.cancelWrite).toHaveBeenCalledOnce();
    if (alcohol) expect(db.legalInsert).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ document_type: "alcohol_age" })]));
  });

  it.each([
    { data: null, error: { code: "WRITE_FAILURE" } },
    { data: null, error: null },
  ])("expires the created session when its reference is not saved: %j", async (result) => {
    db.referenceWrite.mockResolvedValue(result);
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to start payment" });
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
    expect(mocks.sessionExpire.mock.invocationCallOrder[0]).toBeLessThan(db.release.mock.invocationCallOrder[0]);
    expect(db.cancelWrite).toHaveBeenCalledOnce();
  });

  it("reports returned compensation errors and still attempts cancellation after release failure", async () => {
    db.referenceWrite.mockResolvedValue({ data: null, error: { code: "WRITE_FAILURE" } });
    db.release.mockResolvedValue({ data: null, error: { code: "RELEASE_FAILURE" } });
    db.cancelWrite.mockResolvedValue({ data: null, error: { code: "CANCEL_FAILURE" } });
    expect((await POST(request())).status).toBe(500);
    expect(db.cancelWrite).toHaveBeenCalledOnce();
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
    expect(console.error).toHaveBeenCalledWith("Unable to release failed payment coupon reservation", { code: "RELEASE_FAILURE" });
    expect(console.error).toHaveBeenCalledWith("Unable to cancel failed payment order", { code: "CANCEL_FAILURE" });
  });

  it("attempts cancellation even when the release RPC throws", async () => {
    db.itemsInsert.mockResolvedValue({ error: { code: "ITEM_FAILURE" } });
    db.release.mockRejectedValue(new Error("network failure"));
    expect((await POST(request())).status).toBe(500);
    expect(db.cancelWrite).toHaveBeenCalledOnce();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it("reports a cancellation that affected no order", async () => {
    db.legalInsert.mockResolvedValue({ error: { code: "LEGAL_FAILURE" } });
    db.cancelWrite.mockResolvedValue({ data: null, error: null });
    expect((await POST(request())).status).toBe(500);
    expect(console.error).toHaveBeenCalledWith("Unable to cancel failed payment order", { name: "Error" });
  });

  it("expires a session with no checkout URL", async () => {
    mocks.sessionCreate.mockResolvedValue({ id: "session-1", url: null });
    expect((await POST(request())).status).toBe(500);
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
  });

  it("compensates when Stripe definitively rejects session creation", async () => {
    mocks.sessionCreate.mockRejectedValue(new Stripe.errors.StripeInvalidRequestError({ message: "Invalid parameter" }));
    expect((await POST(request())).status).toBe(500);
    expect(db.cancelWrite).toHaveBeenCalledOnce();
    expect(db.release).toHaveBeenCalledOnce();
    expect(mocks.sessionExpire).not.toHaveBeenCalled();
  });

  it.each([
    new Stripe.errors.StripeConnectionError({ message: "Request timed out" }),
    new Stripe.errors.StripeAPIError({ message: "Internal API error" }),
    new Error("Unknown transport failure"),
  ])("retains the pending order and reservation on ambiguous session creation: %s", async (error) => {
    mocks.getPricingQuote.mockResolvedValue({ ...quote, coupon: { id: couponId } });
    mocks.sessionCreate.mockRejectedValue(error);
    const response = await POST(request({ ...payload, coupon_id: couponId }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to start payment" });
    expect(db.rpc).toHaveBeenCalledWith("reserve_coupon", expect.objectContaining({ p_order_id: "order-1" }));
    expect(mocks.sessionCreate).toHaveBeenCalledWith(expect.anything(), { idempotencyKey: "checkout-session:order-1" });
    expect(db.release).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(mocks.sessionExpire).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Checkout reconciliation required", {
      order_id: "order-1", session_id: null, idempotency_key: "checkout-session:order-1",
    });
  });

  it.each(["throw", "unconfirmed"])("retains the pending order and reservation when expiration fails: %s", async (failure) => {
    mocks.getPricingQuote.mockResolvedValue({ ...quote, coupon: { id: couponId } });
    db.referenceWrite.mockResolvedValue({ data: null, error: { code: "WRITE_FAILURE" } });
    if (failure === "throw") mocks.sessionExpire.mockRejectedValue(new Error("Stripe unavailable"));
    else mocks.sessionExpire.mockResolvedValue({ id: "session-1", status: "complete" });
    const response = await POST(request({ ...payload, coupon_id: couponId }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to start payment" });
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
    expect(db.release).not.toHaveBeenCalled();
    expect(db.cancelWrite).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalledWith(expect.objectContaining({ status: "cancelled" }));
    expect(console.error).toHaveBeenCalledWith("Unable to expire failed checkout session", expect.anything());
    expect(console.error).toHaveBeenCalledWith("Checkout reconciliation required", {
      order_id: "order-1", session_id: "session-1", idempotency_key: "checkout-session:order-1",
    });
  });

  it("compensates a Stripe product failure before session creation is attempted", async () => {
    mocks.productCreate.mockRejectedValue(new Stripe.errors.StripeConnectionError({ message: "Timed out" }));
    expect((await POST(request())).status).toBe(500);
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
    expect(db.release).toHaveBeenCalledOnce();
    expect(db.cancelWrite).toHaveBeenCalledOnce();
  });

  it("keeps coupon reservation and price-change checks", async () => {
    mocks.getPricingQuote.mockResolvedValue({ ...quote, coupon: { id: couponId } });
    expect((await POST(request({ ...payload, coupon_id: couponId }))).status).toBe(200);
    expect(db.rpc).toHaveBeenCalledWith("reserve_coupon", { p_coupon_id: couponId, p_order_id: "order-1", p_user_id: "user-1" });
    db.orderInsert.mockClear();
    const response = await POST(request({ ...payload, quote_total_cents: 999 }));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toBe("PRICE_CHANGED");
    expect(db.orderInsert).not.toHaveBeenCalled();
  });

  it("requires age confirmation for alcoholic products", async () => {
    db.products.mockResolvedValue({ data: [{ id: productId, is_alcoholic: true }], error: null });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "ALCOHOL_AGE_REQUIRED" });
    expect(db.orderInsert).not.toHaveBeenCalled();
  });

  it.each(["", "{", "undefined"])("returns INVALID_JSON for malformed JSON %j", async (body) => {
    const response = await POST(new NextRequest("https://shop.example/api", { method: "POST", body }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_JSON" });
    expect(db.from).not.toHaveBeenCalled();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it.each([
    null, [], {},
    { ...payload, items: [] },
    { ...payload, items: Array.from({ length: 101 }, () => payload.items[0]) },
    ...["2", 0, -1, 1.5, 101, null, true].map((quantity) => ({ ...payload, items: [{ id: productId, quantity }] })),
    { ...payload, items: [{ product_id: productId, quantity: 2 }] },
    { ...payload, items: [{ id: "invalid", quantity: 2 }] },
    { ...payload, items: [{ ...payload.items[0], price: 1 }] },
    ...["1000", -1, 1.5, null, Number.MAX_SAFE_INTEGER + 1].map((quote_total_cents) => ({ ...payload, quote_total_cents })),
    { ...payload, phone: 123 }, { ...payload, phone: " " }, { ...payload, phone: "1".repeat(33) },
    { ...payload, full_name: {} }, { ...payload, full_name: " " }, { ...payload, full_name: "a".repeat(201) },
    { ...payload, notes: false }, { ...payload, notes: "a".repeat(2001) },
    { ...payload, email: false }, { ...payload, email: "invalid" }, { ...payload, email: `${"a".repeat(250)}@test.com` },
    { ...payload, locale: "../admin" }, { ...payload, locale: null },
    { ...payload, pickup_at: 123 }, { ...payload, pickup_at: "not-a-date" },
    { ...payload, coupon_id: 123 }, { ...payload, coupon_id: "invalid" },
    { ...payload, terms_accepted: "true" }, { ...payload, terms_accepted: false },
    { ...payload, age_confirmed: "true" }, { ...payload, extra: true },
  ])("rejects invalid payload %# before database work", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_REQUEST" });
    expect(db.from).not.toHaveBeenCalled();
    expect(db.rpc).not.toHaveBeenCalled();
    expect(mocks.getPricingQuote).not.toHaveBeenCalled();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it.each([false, true])("bounds the request body with declared length=%s", async (declared) => {
    const response = await POST(new NextRequest("https://shop.example/api", {
      method: "POST",
      headers: declared ? { "content-length": "70000" } : {},
      body: JSON.stringify({ ...payload, notes: "a".repeat(70000) }),
    }));
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "PAYLOAD_TOO_LARGE" });
    expect(db.from).not.toHaveBeenCalled();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    db.getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request())).status).toBe(401);
    expect(db.from).not.toHaveBeenCalled();
  });
});
