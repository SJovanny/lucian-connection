import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPricingQuote,
  PricingError,
} from "@/lib/pricing";
import { PRICING_CURRENCY, type PricingQuote } from "@/lib/pricing-types";
import { validatePickupAt } from "@/lib/pickup-rules";
import { checkoutSchema } from "@/lib/payments/checkout-schema";
import { createStripeCheckoutGateway, type CheckoutGateway } from "@/lib/payments/stripe-checkout";
import { apiRequestErrorResponse, readBoundedJson, safeLogError } from "@/lib/api-request";

const TERMS_VERSION = "1.0";
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9:_-]+$/;

type PreparedCheckout = {
  order_id: string;
  session_id: string | null;
  session_url: string | null;
  is_existing: boolean;
};

type ExistingCheckout = {
  orderId: string;
  sessionId: string | null;
  sessionUrl: string | null;
  containsAlcohol: boolean;
  quote: PricingQuote | null;
};

function toStoredCents(value: unknown): number | null {
  const amount = Number(value);
  const cents = Math.round(amount * 100);
  return Number.isFinite(amount) && amount >= 0 && Number.isSafeInteger(cents) ? cents : null;
}

async function findExistingCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  requestKey: string,
  requestFingerprint: string,
): Promise<ExistingCheckout | null> {
  const { data: attempt, error: attemptError } = await supabase
    .from("checkout_attempts")
    .select("request_fingerprint, order_id, stripe_session_id, stripe_session_url")
    .eq("user_id", userId)
    .eq("request_key", requestKey)
    .maybeSingle();
  if (attemptError) throw attemptError;
  if (!attempt || attempt.request_fingerprint !== requestFingerprint || !attempt.order_id) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, payment_status, payment_session_id, subtotal, delivery_fee, total_amount, discount_amount, coupon_id, contains_alcohol")
    .eq("id", attempt.order_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order
    || !(
      ["paid", "partially_refunded"].includes(order.payment_status)
      || (order.payment_status === "pending_payment" && order.status === "pending")
    )) return null;

  if (attempt.stripe_session_id && attempt.stripe_session_url) {
    return {
      orderId: order.id,
      sessionId: attempt.stripe_session_id,
      sessionUrl: attempt.stripe_session_url,
      containsAlcohol: order.contains_alcohol,
      quote: null,
    };
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity, unit_price, total_price")
    .eq("order_id", order.id);
  if (itemsError) throw itemsError;

  const items = (orderItems || []).map((item) => {
    const unitPriceCents = toStoredCents(item.unit_price);
    const totalPriceCents = toStoredCents(item.total_price);
    return item.product_id && unitPriceCents !== null && totalPriceCents !== null
      ? {
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price_cents: unitPriceCents,
          total_price_cents: totalPriceCents,
        }
      : null;
  });
  const subtotalCents = toStoredCents(order.subtotal);
  const preparationFeeCents = toStoredCents(order.delivery_fee);
  const discountCents = toStoredCents(order.discount_amount);
  const totalCents = toStoredCents(order.total_amount);
  let coupon: PricingQuote["coupon"] = null;
  if (order.coupon_id) {
    const { data: couponRow, error: couponError } = await supabase
      .from("coupons")
      .select("id, code")
      .eq("id", order.coupon_id)
      .maybeSingle();
    if (couponError) throw couponError;
    if (couponRow) coupon = couponRow;
  }
  const quote = items.length > 0
    && items.every((item) => item !== null)
    && subtotalCents !== null
    && preparationFeeCents !== null
    && discountCents !== null
    && totalCents !== null
    ? {
        currency: PRICING_CURRENCY,
        items: items.filter((item): item is NonNullable<typeof item> => item !== null),
        subtotal_cents: subtotalCents,
        preparation_fee_cents: preparationFeeCents,
        discount_cents: discountCents,
        total_cents: totalCents,
        coupon,
      }
    : null;

  return {
    orderId: order.id,
    sessionId: attempt.stripe_session_id || order.payment_session_id,
    sessionUrl: attempt.stripe_session_url,
    containsAlcohol: order.contains_alcohol,
    quote,
  };
}

function getRequestFingerprint(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function getCheckoutRpcResponse(error: unknown): NextResponse | null {
  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate?.message === "string" ? candidate.message : "";

  if (/insufficient stock|product is unavailable/i.test(message)) {
    return NextResponse.json({ error: "PRODUCT_UNAVAILABLE" }, { status: 409 });
  }
  if (/coupon/i.test(message)) {
    return NextResponse.json({ error: "COUPON_UNAVAILABLE" }, { status: 400 });
  }
  if (/pickup slot|pickup date|outside booking/i.test(message)) {
    return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
  }
  if (/checkout quote|invalid checkout item|invalid checkout contact/i.test(message)) {
    return NextResponse.json({ error: "PRICE_CHANGED" }, { status: 409 });
  }
  if (/checkout request was cancelled|checkout order is no longer pending/i.test(message)) {
    return NextResponse.json({ error: "CHECKOUT_RETRY_REQUIRED" }, { status: 409 });
  }
  if (/request key was reused with different data/i.test(message)) {
    return NextResponse.json({ error: "IDEMPOTENCY_KEY_REUSED" }, { status: 409 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null;
  let checkoutGateway: CheckoutGateway | null = null;
  let serviceSupabase: ReturnType<typeof createAdminClient> | null = null;
  let createdSessionId: string | null = null;
  let sessionCreationAttempted = false;
  let sessionIdempotencyKey: string | null = null;
  let existingSessionRecoveryAttempted = false;

  try {
    const suppliedRequestKey = request.headers.get("idempotency-key")?.trim() || null;
    if (suppliedRequestKey
      && (suppliedRequestKey.length < 16
        || suppliedRequestKey.length > 200
        || !IDEMPOTENCY_KEY_PATTERN.test(suppliedRequestKey))) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await readBoundedJson(request, checkoutSchema);
    const {
      items,
      phone,
      notes,
      locale,
      pickup_at,
      coupon_id,
      quote_total_cents,
      age_confirmed,
      full_name,
      email,
    } = body;

    const requestFingerprint = getRequestFingerprint({
      user_id: user.id,
      items: [...items].sort((left, right) => left.id.localeCompare(right.id)),
      phone,
      full_name,
      email: email || user.email || null,
      notes: notes || null,
      locale,
      pickup_at,
      coupon_id: coupon_id || null,
      quote_total_cents: quote_total_cents ?? null,
      age_confirmed: age_confirmed === true,
      terms_version: TERMS_VERSION,
    });
    const requestKey = suppliedRequestKey || `checkout:${requestFingerprint}`;

    serviceSupabase = createAdminClient();
    const existingCheckout = await findExistingCheckout(
      serviceSupabase,
      user.id,
      requestKey,
      requestFingerprint,
    );
    if (existingCheckout?.sessionId && existingCheckout.sessionUrl) {
      return NextResponse.json({
        url: existingCheckout.sessionUrl,
        session_id: existingCheckout.sessionId,
      });
    }

    let quote: PricingQuote;
    let containsAlcohol: boolean;
    if (existingCheckout?.quote) {
      quote = existingCheckout.quote;
      containsAlcohol = existingCheckout.containsAlcohol;
    } else {
      const [{ data: closedDates, error: closuresError }, { data: openingHours, error: openingHoursError }] = await Promise.all([
        supabase.rpc("get_pickup_closed_dates"),
        supabase.from("pickup_opening_hours").select("weekday, is_open, start_time, end_time"),
      ]);
      if (closuresError || openingHoursError || !validatePickupAt(pickup_at, new Date(), (closedDates || []).map((row) => row.closed_on), openingHours || undefined)) {
        return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
      }

      quote = await getPricingQuote(supabase, items, {
        couponId: coupon_id ?? null,
        userId: user.id,
        locale: locale || "fr",
      });

      const ids = quote.items.map((item) => item.product_id);
      const { data: productFlags, error: productFlagsError } = await supabase
        .from("products")
        .select("id, is_alcoholic")
        .in("id", ids)
        .eq("is_active", true);

      if (productFlagsError || !productFlags || productFlags.length !== ids.length) {
        return NextResponse.json({ error: "PRODUCT_UNAVAILABLE" }, { status: 409 });
      }

      if (quote_total_cents !== undefined && quote_total_cents !== quote.total_cents) {
        return NextResponse.json(
          { error: "PRICE_CHANGED", details: "The order total changed", quote },
          { status: 409 },
        );
      }

      const alcoholicProductIds = new Set(
        productFlags.filter((product) => product.is_alcoholic).map((product) => product.id),
      );
      containsAlcohol = quote.items.some((item) => alcoholicProductIds.has(item.product_id));
      if (containsAlcohol && age_confirmed !== true) {
        return NextResponse.json({ error: "ALCOHOL_AGE_REQUIRED" }, { status: 400 });
      }
    }

    const { data: preparedRows, error: prepareError } = await serviceSupabase.rpc("prepare_checkout_order", {
      p_user_id: user.id,
      p_request_key: requestKey,
      p_request_fingerprint: requestFingerprint,
      p_phone: phone,
      p_full_name: full_name,
      p_email: email || user.email || "",
      p_notes: notes || null,
      p_locale: locale,
      p_pickup_at: new Date(pickup_at).toISOString(),
      p_coupon_id: quote.coupon?.id || null,
      p_subtotal_cents: quote.subtotal_cents,
      p_preparation_fee_cents: quote.preparation_fee_cents,
      p_discount_cents: quote.discount_cents,
      p_total_cents: quote.total_cents,
      p_items: quote.items,
      p_contains_alcohol: containsAlcohol,
      p_age_confirmed: age_confirmed === true,
      p_terms_version: TERMS_VERSION,
      p_user_agent: request.headers.get("user-agent"),
      p_ip_address: null,
    });
    if (prepareError) throw prepareError;

    const prepared = preparedRows?.[0] as PreparedCheckout | undefined;
    if (!prepared?.order_id) throw new Error("Checkout preparation returned no order");
    createdOrderId = prepared.order_id;

    if (prepared.session_id || prepared.session_url) {
      if (!prepared.session_id) throw new Error("Stored checkout session is incomplete");
      if (!prepared.session_url) {
        existingSessionRecoveryAttempted = true;
        checkoutGateway = createStripeCheckoutGateway();
        const storedSession = await checkoutGateway.retrieveSession(prepared.session_id);
        if (storedSession.id !== prepared.session_id || !storedSession.url || storedSession.status === "expired") {
          throw new Error("Stored checkout session is unavailable");
        }
        const { data: linked, error: linkError } = await serviceSupabase.rpc("link_checkout_session", {
          p_user_id: user.id,
          p_request_key: requestKey,
          p_order_id: prepared.order_id,
          p_session_id: storedSession.id,
          p_session_url: storedSession.url,
        });
        if (linkError || linked !== true) throw linkError || new Error("Stored checkout session was not linked");
        return NextResponse.json({
          url: storedSession.url,
          session_id: storedSession.id,
          quote,
        });
      }
      return NextResponse.json({
        url: prepared.session_url,
        session_id: prepared.session_id,
        quote,
      });
    }

    checkoutGateway = createStripeCheckoutGateway();
    const session = await checkoutGateway.createSession({
      quote,
      orderId: prepared.order_id,
      locale,
      email: email || user.email,
      metadata: {
        order_id: prepared.order_id,
        user_id: user.id,
        total_cents: String(quote.total_cents),
      },
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale}/checkout?payment=cancelled`,
    }, (idempotencyKey) => {
      sessionIdempotencyKey = idempotencyKey;
      sessionCreationAttempted = true;
    });

    createdSessionId = session.id;
    if (!session.url) throw new Error("Checkout session returned no URL");

    const { data: linked, error: linkError } = await serviceSupabase.rpc("link_checkout_session", {
      p_user_id: user.id,
      p_request_key: requestKey,
      p_order_id: prepared.order_id,
      p_session_id: session.id,
      p_session_url: session.url,
    });
    if (linkError || linked !== true) throw linkError || new Error("Checkout session was not linked");

    return NextResponse.json({ url: session.url, session_id: session.id, quote });
  } catch (error) {
    // Stripe and PostgreSQL cannot share a transaction. Expire and cancel only
    // when Stripe creation was not ambiguous.
    let canCompensate = !sessionCreationAttempted && !existingSessionRecoveryAttempted
      || (!createdSessionId && checkoutGateway?.isDefinitiveCreationError(error) === true);
    if (checkoutGateway && createdSessionId) {
      try {
        await checkoutGateway.expireSession(createdSessionId);
        canCompensate = true;
      } catch (expirationError) {
        safeLogError("Unable to expire failed checkout session", expirationError);
      }
    }
    if (createdOrderId && !canCompensate) {
      console.error("Checkout reconciliation required", {
        order_id: createdOrderId,
        session_id: createdSessionId,
        idempotency_key: sessionIdempotencyKey,
      });
    }
    if (createdOrderId && canCompensate) {
      try {
        const admin = serviceSupabase || createAdminClient();
        const { error: cancellationError } = await admin.rpc("cancel_pending_order", {
          p_order_id: createdOrderId,
        });
        if (cancellationError) throw cancellationError;
      } catch (cleanupError) {
        safeLogError("Unable to cancel failed payment order", cleanupError);
      }
    }

    if (error instanceof PricingError) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: 400 },
      );
    }

    const rpcResponse = getCheckoutRpcResponse(error);
    if (rpcResponse) return rpcResponse;

    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Payment session creation failed", error);
    return NextResponse.json({ error: "Unable to start payment" }, { status: 500 });
  }
}
