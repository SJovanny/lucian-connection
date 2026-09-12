import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStripeCheckoutGateway, type CheckoutSessionInput } from "@/lib/payments/stripe-checkout";

const mocks = vi.hoisted(() => ({
  productCreate: vi.fn(),
  couponCreate: vi.fn(),
  sessionCreate: vi.fn(),
  sessionExpire: vi.fn(),
}));

vi.mock("stripe", async (importOriginal) => {
  const { default: ActualStripe } = await importOriginal<typeof import("stripe")>();
  return { default: class {
    static errors = ActualStripe.errors;
    products = { create: mocks.productCreate };
    coupons = { create: mocks.couponCreate };
    checkout = { sessions: { create: mocks.sessionCreate, expire: mocks.sessionExpire } };
  } };
});

const input: CheckoutSessionInput = {
  orderId: "order-1",
  locale: "en",
  email: "account@example.com",
  metadata: { order_id: "order-1", user_id: "user-1", total_cents: "1213" },
  successUrl: "https://shop.example/en/checkout/success?session_id={CHECKOUT_SESSION_ID}",
  cancelUrl: "https://shop.example/en/checkout?payment=cancelled",
  quote: {
    currency: "eur",
    items: [
      { product_id: "item-1", product_name: "First", quantity: 2, unit_price_cents: 499, total_price_cents: 998 },
      { product_id: "item-2", product_name: "Second", quantity: 1, unit_price_cents: 317, total_price_cents: 317 },
    ],
    subtotal_cents: 1315,
    preparation_fee_cents: 123,
    discount_cents: 225,
    total_cents: 1213,
    coupon: { id: "coupon-1", code: "SAVE" },
  },
};

describe("Stripe checkout gateway", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
    mocks.productCreate.mockResolvedValueOnce({ id: "prod-1" })
      .mockResolvedValueOnce({ id: "prod-2" }).mockResolvedValueOnce({ id: "prod-fee" });
    mocks.couponCreate.mockResolvedValue({ id: "stripe-coupon" });
    mocks.sessionCreate.mockResolvedValue({ id: "session-1", url: "https://checkout.stripe.test/session-1" });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("keeps exact cents, excludes the fee from the discount, and supplies session idempotency parameters", async () => {
    const attempted = vi.fn();
    await createStripeCheckoutGateway().createSession(input, attempted);
    expect(mocks.productCreate.mock.calls).toEqual([
      [{ name: "First", metadata: { order_id: "order-1", product_id: "item-1" } }, { idempotencyKey: "checkout-product:order-1:item-1" }],
      [{ name: "Second", metadata: { order_id: "order-1", product_id: "item-2" } }, { idempotencyKey: "checkout-product:order-1:item-2" }],
      [{ name: "Preparation fee", metadata: { order_id: "order-1", type: "preparation_fee" } }, { idempotencyKey: "checkout-product:order-1:preparation-fee" }],
    ]);
    expect(mocks.couponCreate).toHaveBeenCalledWith({
      amount_off: 225, currency: "eur", duration: "once", applies_to: { products: ["prod-1", "prod-2"] },
    }, { idempotencyKey: "checkout-coupon:order-1" });
    expect(mocks.sessionCreate).toHaveBeenCalledWith({
      mode: "payment",
      customer_email: input.email,
      billing_address_collection: "required",
      invoice_creation: { enabled: true },
      line_items: [
        { quantity: 2, price_data: { currency: "eur", unit_amount: 499, product: "prod-1" } },
        { quantity: 1, price_data: { currency: "eur", unit_amount: 317, product: "prod-2" } },
        { quantity: 1, price_data: { currency: "eur", unit_amount: 123, product: "prod-fee" } },
      ],
      discounts: [{ coupon: "stripe-coupon" }],
      metadata: input.metadata,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    }, { idempotencyKey: "checkout-session:order-1" });
    expect(attempted).toHaveBeenCalledExactlyOnceWith("checkout-session:order-1");
    expect(attempted.mock.invocationCallOrder[0]).toBeGreaterThan(mocks.couponCreate.mock.invocationCallOrder[0]);
    expect(attempted.mock.invocationCallOrder[0]).toBeLessThan(mocks.sessionCreate.mock.invocationCallOrder[0]);
  });

  it("omits zero fees and discounts", async () => {
    await createStripeCheckoutGateway().createSession({
      ...input, quote: { ...input.quote, preparation_fee_cents: 0, discount_cents: 0, total_cents: 1315, coupon: null },
    }, vi.fn());
    expect(mocks.productCreate).toHaveBeenCalledTimes(2);
    expect(mocks.couponCreate).not.toHaveBeenCalled();
    expect(mocks.sessionCreate.mock.calls[0][0].line_items).toHaveLength(2);
    expect(mocks.sessionCreate.mock.calls[0][0].discounts).toBeUndefined();
  });

  it("does not signal a session attempt when coupon creation fails", async () => {
    const error = new Error("Coupon request failed");
    mocks.couponCreate.mockRejectedValue(error);
    const attempted = vi.fn();
    await expect(createStripeCheckoutGateway().createSession(input, attempted)).rejects.toBe(error);
    expect(attempted).not.toHaveBeenCalled();
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
  });

  it("requires confirmed expiration and classifies only invalid requests as definitive", async () => {
    const gateway = createStripeCheckoutGateway();
    mocks.sessionExpire.mockResolvedValueOnce({ status: "complete" }).mockResolvedValueOnce({ status: "expired" });
    await expect(gateway.expireSession("session-1")).rejects.toThrow("Checkout session expiration was not confirmed");
    await expect(gateway.expireSession("session-1")).resolves.toBeUndefined();
    expect(mocks.sessionExpire).toHaveBeenCalledWith("session-1");
    expect(gateway.isDefinitiveCreationError(new Stripe.errors.StripeInvalidRequestError({ message: "Invalid" }))).toBe(true);
    expect(gateway.isDefinitiveCreationError(new Stripe.errors.StripeConnectionError({ message: "Timeout" }))).toBe(false);
    expect(gateway.isDefinitiveCreationError(new Error("Unknown"))).toBe(false);
  });
});
