import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  getPricingQuote: vi.fn(),
  validatePickupAt: vi.fn(),
  stripeConstructor: vi.fn(),
  productCreate: vi.fn(),
  couponCreate: vi.fn(),
  sessionCreate: vi.fn(),
  sessionRetrieve: vi.fn(),
  sessionExpire: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
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
    checkout = { sessions: { create: mocks.sessionCreate, retrieve: mocks.sessionRetrieve, expire: mocks.sessionExpire } };
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

function request(body: unknown = payload, headers: Record<string, string> = {}) {
  return new NextRequest("https://shop.example/api/payments/create-checkout-session", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "checkout-test", ...headers },
    body: JSON.stringify(body),
  });
}

function setupDatabase() {
  const prepare = vi.fn().mockResolvedValue({
    data: [{ order_id: "order-1", session_id: null, session_url: null, is_existing: false }],
    error: null,
  });
  const link = vi.fn().mockResolvedValue({ data: true, error: null });
  const cancel = vi.fn().mockResolvedValue({ data: true, error: null });
  const checkoutAttempt = vi.fn().mockResolvedValue({ data: null, error: null });
  const checkoutOrder = vi.fn().mockResolvedValue({
    data: {
      id: "order-1",
      status: "pending",
      payment_status: "pending_payment",
      subtotal: 10,
      delivery_fee: 0,
      total_amount: 10,
      discount_amount: 0,
      coupon_id: null,
      contains_alcohol: false,
    },
    error: null,
  });
  const orderItems = vi.fn().mockResolvedValue({ data: [], error: null });
  const adminRpc = vi.fn((name: string) => {
    if (name === "prepare_checkout_order") return prepare();
    if (name === "link_checkout_session") return link();
    if (name === "cancel_pending_order") return cancel();
    throw new Error(`Unexpected admin RPC ${name}`);
  });
  const products = vi.fn().mockResolvedValue({ data: [{ id: productId, is_alcoholic: false }], error: null });
  const from = vi.fn((table: string) => {
    if (table === "products") return { select: () => ({ in: () => ({ eq: products }) }) };
    if (table === "pickup_opening_hours") return { select: () => Promise.resolve({ data: [], error: null }) };
    if (table === "checkout_attempts") {
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: checkoutAttempt }) }) }) };
    }
    if (table === "orders") {
      return { select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: checkoutOrder }) }) }) };
    }
    if (table === "order_items") return { select: () => ({ eq: orderItems }) };
    throw new Error(`Unexpected table ${table}`);
  });
  const rpc = vi.fn((name: string) => {
    if (name === "get_pickup_closed_dates") return Promise.resolve({ data: [], error: null });
    throw new Error(`Unexpected user RPC ${name}`);
  });
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "account@example.com" } } });
  mocks.createClient.mockResolvedValue({ auth: { getUser }, from, rpc });
  mocks.createAdminClient.mockReturnValue({ rpc: adminRpc, from });
  return { prepare, link, cancel, adminRpc, products, from, rpc, getUser, checkoutAttempt, checkoutOrder, orderItems };
}

function requestFingerprint(overrides: Partial<typeof payload> = {}) {
  const input = { ...payload, ...overrides };
  return createHash("sha256").update(JSON.stringify({
    user_id: "user-1",
    items: [...input.items].sort((left, right) => left.id.localeCompare(right.id)),
    phone: input.phone,
    full_name: input.full_name,
    email: input.email,
    notes: input.notes || null,
    locale: input.locale,
    pickup_at: input.pickup_at,
    coupon_id: input.coupon_id,
    quote_total_cents: input.quote_total_cents,
    age_confirmed: input.age_confirmed === true,
    terms_version: "1.0",
  })).digest("hex");
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
    mocks.couponCreate.mockResolvedValue({ id: "stripe-coupon" });
    mocks.sessionCreate.mockResolvedValue({ id: "session-1", url: "https://checkout.stripe.test/session-1" });
    mocks.sessionRetrieve.mockResolvedValue({ id: "session-1", url: "https://checkout.stripe.test/session-1", status: "open" });
    mocks.sessionExpire.mockResolvedValue({ id: "session-1", status: "expired" });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("prepares the order atomically and links the Stripe session", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.test/session-1", session_id: "session-1", quote });
    expect(db.adminRpc).toHaveBeenCalledWith("prepare_checkout_order", expect.objectContaining({
      p_user_id: "user-1",
      p_request_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_items: quote.items,
      p_terms_version: "1.0",
    }));
    expect(db.adminRpc).toHaveBeenCalledWith("link_checkout_session", expect.objectContaining({
      p_order_id: "order-1",
      p_session_id: "session-1",
    }));
    expect(mocks.sessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: "form@example.com" }),
      { idempotencyKey: "checkout-session:order-1" },
    );
    expect(db.cancel).not.toHaveBeenCalled();
  });

  it("returns the stored session without calling Stripe again on an idempotent retry", async () => {
    db.checkoutAttempt.mockResolvedValue({
      data: {
        request_fingerprint: requestFingerprint(),
        order_id: "order-1",
        stripe_session_id: "cs_test_existing123",
        stripe_session_url: "https://checkout.stripe.test/existing",
      },
      error: null,
    });
    mocks.getPricingQuote.mockRejectedValue(new Error("stock is now reserved"));
    const response = await POST(request(payload, { "Idempotency-Key": "checkout-request-key-123456" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://checkout.stripe.test/existing",
      session_id: "cs_test_existing123",
    });
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(db.link).not.toHaveBeenCalled();
  });

  it("recovers a session linked by the webhook before the checkout request saved its URL", async () => {
    db.prepare.mockResolvedValue({
      data: [{ order_id: "order-1", session_id: "cs_test_recovered123", session_url: null, is_existing: true }],
      error: null,
    });
    mocks.sessionRetrieve.mockResolvedValue({
      id: "cs_test_recovered123",
      url: "https://checkout.stripe.test/recovered",
      status: "complete",
    });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://checkout.stripe.test/recovered",
      session_id: "cs_test_recovered123",
      quote,
    });
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
    expect(db.adminRpc).toHaveBeenCalledWith("link_checkout_session", expect.objectContaining({
      p_session_id: "cs_test_recovered123",
      p_session_url: "https://checkout.stripe.test/recovered",
    }));
  });

  it.each([
    [{ code: "P0001", message: "checkout quote is stale" }, 409, "PRICE_CHANGED"],
    [{ code: "P0001", message: "coupon reservation unavailable" }, 400, "COUPON_UNAVAILABLE"],
    [{ code: "P0001", message: "product is unavailable" }, 409, "PRODUCT_UNAVAILABLE"],
  ])("maps domain RPC errors by message: %j", async (error, status, errorCode) => {
    db.prepare.mockResolvedValue({ data: null, error });
    const response = await POST(request());
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: errorCode });
  });

  it("rejects reuse of an idempotency key with different request data", async () => {
    db.checkoutAttempt.mockResolvedValue({
      data: {
        request_fingerprint: "a".repeat(64),
        order_id: "order-1",
        stripe_session_id: null,
        stripe_session_url: null,
      },
      error: null,
    });
    db.prepare.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "checkout request key was reused with different data" },
    });
    const response = await POST(request(payload, { "Idempotency-Key": "checkout-request-key-123456" }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "IDEMPOTENCY_KEY_REUSED" });
  });

  it("cancels the prepared order when Stripe session creation definitively fails", async () => {
    mocks.sessionCreate.mockRejectedValue(new Stripe.errors.StripeInvalidRequestError({ message: "Invalid parameter" }));
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(db.cancel).toHaveBeenCalledOnce();
    expect(mocks.sessionExpire).not.toHaveBeenCalled();
  });

  it("retains the prepared order on an ambiguous Stripe failure", async () => {
    mocks.sessionCreate.mockRejectedValue(new Stripe.errors.StripeConnectionError({ message: "Request timed out" }));
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(db.cancel).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Checkout reconciliation required", expect.objectContaining({ order_id: "order-1" }));
  });

  it("expires a created session before cancelling when linking fails", async () => {
    db.link.mockResolvedValue({ data: null, error: { code: "WRITE_FAILURE" } });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
    expect(db.cancel).toHaveBeenCalledOnce();
  });

  it("keeps the order pending if session expiration is not confirmed", async () => {
    db.link.mockResolvedValue({ data: null, error: { code: "WRITE_FAILURE" } });
    mocks.sessionExpire.mockResolvedValue({ id: "session-1", status: "complete" });
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(db.cancel).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Checkout reconciliation required", expect.objectContaining({ session_id: "session-1" }));
  });

  it("passes the coupon through the atomic preparation RPC", async () => {
    mocks.getPricingQuote.mockResolvedValue({ ...quote, coupon: { id: couponId, code: "SAVE" } });
    const response = await POST(request({ ...payload, coupon_id: couponId }));
    expect(response.status).toBe(200);
    expect(db.adminRpc).toHaveBeenCalledWith("prepare_checkout_order", expect.objectContaining({ p_coupon_id: couponId }));
  });

  it("returns PRICE_CHANGED before preparing an order", async () => {
    expect((await POST(request({ ...payload, quote_total_cents: 999 }))).status).toBe(409);
    expect(db.adminRpc).not.toHaveBeenCalledWith("prepare_checkout_order", expect.anything());
  });

  it("requires age confirmation for alcoholic products", async () => {
    db.products.mockResolvedValue({ data: [{ id: productId, is_alcoholic: true }], error: null });
    const response = await POST(request());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "ALCOHOL_AGE_REQUIRED" });
    expect(db.adminRpc).not.toHaveBeenCalledWith("prepare_checkout_order", expect.anything());
  });

  it.each(["", "{", "undefined"]) ("returns INVALID_JSON for malformed JSON %j", async (body) => {
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
  ]) ("rejects invalid payload %# before database work", async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_REQUEST" });
    expect(db.from).not.toHaveBeenCalled();
    expect(db.adminRpc).not.toHaveBeenCalled();
    expect(mocks.getPricingQuote).not.toHaveBeenCalled();
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it("rejects an invalid idempotency key before database work", async () => {
    const response = await POST(request(payload, { "Idempotency-Key": "bad key" }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "INVALID_REQUEST" });
    expect(db.from).not.toHaveBeenCalled();
  });

  it.each([false, true]) ("bounds the request body with declared length=%s", async (declared) => {
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
