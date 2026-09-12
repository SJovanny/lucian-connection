import Stripe from "stripe";
import { PRICING_CURRENCY, type PricingQuote } from "@/lib/pricing-types";

export interface CheckoutSessionInput {
  quote: PricingQuote;
  orderId: string;
  locale: "fr" | "en";
  email: string | undefined;
  metadata: { order_id: string; user_id: string; total_cents: string };
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutGateway {
  createSession(
    input: CheckoutSessionInput,
    onSessionCreationAttempt: (idempotencyKey: string) => void,
  ): Promise<{ id: string; url: string | null }>;
  retrieveSession(sessionId: string): Promise<{ id: string; url: string | null; status: string | null }>;
  expireSession(sessionId: string): Promise<void>;
  isDefinitiveCreationError(error: unknown): boolean;
}

export function createStripeCheckoutGateway(): CheckoutGateway {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  const stripe = new Stripe(key);

  return {
    async createSession(input, onSessionCreationAttempt) {
      const { quote, orderId, locale } = input;
      const products = await Promise.all(
        quote.items.map((item) => stripe.products.create(
          {
            name: item.product_name,
            metadata: { order_id: orderId, product_id: item.product_id },
          },
          { idempotencyKey: `checkout-product:${orderId}:${item.product_id}` },
        ))
      );
      const feeProduct = quote.preparation_fee_cents > 0
        ? await stripe.products.create(
            {
              name: locale === "en" ? "Preparation fee" : "Frais de préparation",
              metadata: { order_id: orderId, type: "preparation_fee" },
            },
            { idempotencyKey: `checkout-product:${orderId}:preparation-fee` },
          )
        : null;
      const discounts = quote.discount_cents > 0
        ? [{
            coupon: (await stripe.coupons.create(
              {
                amount_off: quote.discount_cents,
                currency: PRICING_CURRENCY,
                duration: "once",
                applies_to: { products: products.map((product) => product.id) },
              },
              { idempotencyKey: `checkout-coupon:${orderId}` },
            )).id,
          }]
        : undefined;

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = quote.items.map((item, index) => ({
        quantity: item.quantity,
        price_data: {
          currency: PRICING_CURRENCY,
          unit_amount: item.unit_price_cents,
          product: products[index].id,
        },
      }));
      if (feeProduct) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: PRICING_CURRENCY,
            unit_amount: quote.preparation_fee_cents,
            product: feeProduct.id,
          },
        });
      }

      const idempotencyKey = `checkout-session:${orderId}`;
      // Signal only after preparation succeeds, immediately before the external request.
      onSessionCreationAttempt(idempotencyKey);
      return stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.email,
        billing_address_collection: "required",
        invoice_creation: { enabled: true },
        line_items: lineItems,
        discounts,
        metadata: input.metadata,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }, { idempotencyKey });
    },
    async expireSession(sessionId) {
      const session = await stripe.checkout.sessions.expire(sessionId);
      if (session.status !== "expired") throw new Error("Checkout session expiration was not confirmed");
    },
    async retrieveSession(sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return { id: session.id, url: session.url, status: session.status };
    },
    isDefinitiveCreationError(error) {
      return error instanceof Stripe.errors.StripeInvalidRequestError;
    },
  };
}
