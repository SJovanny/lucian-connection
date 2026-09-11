import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fromCents,
  getPricingQuote,
  PricingError,
} from "@/lib/pricing";
import { validatePickupAt } from "@/lib/pickup-rules";
import { checkoutSchema } from "@/lib/payments/checkout-schema";
import { createStripeCheckoutGateway, type CheckoutGateway } from "@/lib/payments/stripe-checkout";
import { apiRequestErrorResponse, readBoundedJson, safeLogError } from "@/lib/api-request";

const TERMS_VERSION = "1.0";

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null;
  let orderUserId: string | null = null;
  let checkoutGateway: CheckoutGateway | null = null;
  let createdSessionId: string | null = null;
  let sessionCreationAttempted = false;
  let sessionIdempotencyKey: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    orderUserId = user.id;

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
    } = body;

    const [{ data: closedDates, error: closuresError }, { data: openingHours, error: openingHoursError }] = await Promise.all([
      supabase.rpc("get_pickup_closed_dates"),
      supabase.from("pickup_opening_hours").select("weekday, is_open, start_time, end_time"),
    ]);
    if (closuresError || openingHoursError || !validatePickupAt(pickup_at, new Date(), (closedDates || []).map((row) => row.closed_on), openingHours || undefined)) {
      return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
    }

    const quote = await getPricingQuote(supabase, items, {
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
      return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
    }

    if (
      quote_total_cents !== undefined
      && quote_total_cents !== quote.total_cents
    ) {
      return NextResponse.json(
        { error: "PRICE_CHANGED", details: "The order total changed", quote },
        { status: 409 }
      );
    }

    const alcoholicProductIds = new Set(
      productFlags.filter((product) => product.is_alcoholic).map((product) => product.id)
    );
    const containsAlcohol = quote.items.some((item) => alcoholicProductIds.has(item.product_id));
    if (containsAlcohol && age_confirmed !== true) {
      return NextResponse.json({ error: "ALCOHOL_AGE_REQUIRED" }, { status: 400 });
    }

    const orderItems = quote.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: fromCents(item.unit_price_cents),
      total_price: fromCents(item.total_price_cents),
    }));
    const subtotal = fromCents(quote.subtotal_cents);
    const preparationFee = fromCents(quote.preparation_fee_cents);
    const discount = fromCents(quote.discount_cents);
    const total = fromCents(quote.total_cents);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "pending_payment",
        payment_provider: "stripe",
        subtotal,
        delivery_fee: preparationFee,
        total_amount: total,
        phone,
        notes: notes || null,
        locale: locale || "fr",
        coupon_id: quote.coupon?.id || null,
        discount_amount: discount,
        pickup_at: new Date(pickup_at).toISOString(),
        terms_version: TERMS_VERSION,
        contains_alcohol: containsAlcohol,
        age_confirmed_at: containsAlcohol ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (orderError || !order) throw orderError || new Error("Order insert returned no row");
    createdOrderId = order.id;

    if (quote.coupon?.id) {
      const { data: reservationCreated, error: reservationError } = await supabase.rpc("reserve_coupon", {
        p_coupon_id: quote.coupon.id,
        p_order_id: order.id,
        p_user_id: user.id,
      });
      if (reservationError) {
        console.error("Unable to reserve coupon for payment order", reservationError);
        throw new PricingError("COUPON_UNAVAILABLE", "Coupon unavailable");
      }
      if (reservationCreated !== true) {
        throw new PricingError("COUPON_USAGE_LIMIT", "Coupon usage limit reached");
      }
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw itemsError;

    const legalDocuments = ["terms", "pickup_refunds", ...(containsAlcohol ? ["alcohol_age"] : [])];
    const { error: legalError } = await supabase.from("legal_acceptances").insert(
      legalDocuments.map((documentType) => ({
        user_id: user.id,
        document_type: documentType,
        document_version: TERMS_VERSION,
        order_id: order.id,
        user_agent: request.headers.get("user-agent"),
      }))
    );
    if (legalError) throw legalError;

    checkoutGateway = createStripeCheckoutGateway();
    const session = await checkoutGateway.createSession({
      quote,
      orderId: order.id,
      locale,
      email: user.email,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        total_cents: String(quote.total_cents),
      },
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout?payment=cancelled`,
    }, (idempotencyKey) => {
      sessionIdempotencyKey = idempotencyKey;
      sessionCreationAttempted = true;
    });

    createdSessionId = session.id;
    if (!session.url) throw new Error("Checkout session returned no URL");

    const { data: linkedOrder, error: referenceError } = await supabase
      .from("orders")
      .update({ payment_reference: session.id })
      .eq("id", order.id)
      .eq("payment_status", "pending_payment")
      .select("id")
      .single();
    if (referenceError || !linkedOrder) throw referenceError || new Error("Payment reference was not saved");
    return NextResponse.json({ url: session.url, session_id: session.id, quote });
  } catch (error) {
    // Best-effort compensation only: Stripe and database writes are not atomic.
    let canCompensate = !sessionCreationAttempted
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
      // Log only reconciliation identifiers, never payloads or Stripe error messages.
      console.error("Checkout reconciliation required", {
        order_id: createdOrderId,
        session_id: createdSessionId,
        idempotency_key: sessionIdempotencyKey,
      });
    }
    if (createdOrderId && canCompensate) {
      try {
        const supabase = await createClient();
        try {
          const { error: releaseError } = await supabase.rpc("release_coupon_reservation", {
            p_order_id: createdOrderId,
            p_user_id: orderUserId,
          });
          if (releaseError) throw releaseError;
        } catch (releaseError) {
          safeLogError("Unable to release failed payment coupon reservation", releaseError);
        }
        const { data: cancelledOrder, error: cancellationError } = await supabase.from("orders").update({
          status: "cancelled",
          payment_status: "cancelled",
        }).eq("id", createdOrderId).eq("payment_status", "pending_payment").select("id").single();
        if (cancellationError || !cancelledOrder) throw cancellationError || new Error("Failed payment order was not cancelled");
      } catch (cleanupError) {
        safeLogError("Unable to cancel failed payment order", cleanupError);
      }
    }

    if (error instanceof PricingError) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: 400 }
      );
    }

    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Payment session creation failed", error);
    return NextResponse.json({ error: "Unable to start payment" }, { status: 500 });
  }
}
