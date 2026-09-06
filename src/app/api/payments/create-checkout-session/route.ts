/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import {
  fromCents,
  getPricingQuote,
  PricingError,
} from "@/lib/pricing";
import { PRICING_CURRENCY } from "@/lib/pricing-types";
import { validatePickupAt } from "@/lib/pickup-rules";

const TERMS_VERSION = "1.0";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      items,
      phone,
      notes,
      locale,
      pickup_at,
      coupon_id,
      quote_total_cents,
      full_name,
      terms_accepted,
      age_confirmed,
    } = body;

    if (!Array.isArray(items) || items.length === 0 || !pickup_at || !phone || !full_name || terms_accepted !== true) {
      return NextResponse.json({ error: "Missing order information" }, { status: 400 });
    }

    const [{ data: closedDates, error: closuresError }, { data: openingHours, error: openingHoursError }] = await Promise.all([
      supabase.rpc("get_pickup_closed_dates"),
      supabase.from("pickup_opening_hours").select("weekday, is_open, start_time, end_time"),
    ]);
    if (closuresError || openingHoursError || !validatePickupAt(pickup_at, new Date(), (closedDates || []).map((row) => row.closed_on), openingHours || undefined)) {
      return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
    }

    const quote = await getPricingQuote(supabase, items, {
      couponId: coupon_id || null,
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
      && (!Number.isInteger(Number(quote_total_cents)) || Number(quote_total_cents) !== quote.total_cents)
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

    const { data: order, error: orderError } = await (supabase as any)
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
    if (orderError) throw orderError;
    createdOrderId = order.id;

    const { error: itemsError } = await (supabase as any)
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw itemsError;

    await (supabase as any).from("legal_acceptances").insert({
      user_id: user.id,
      document_type: "terms",
      document_version: TERMS_VERSION,
      order_id: order.id,
      user_agent: request.headers.get("user-agent"),
    });
    if (containsAlcohol) {
      await (supabase as any).from("legal_acceptances").insert({
        user_id: user.id,
        document_type: "alcohol_age",
        document_version: "1.0",
        order_id: order.id,
        user_agent: request.headers.get("user-agent"),
      });
    }

    const stripe = getStripe();
    const stripeProducts = await Promise.all(
      quote.items.map((item) => stripe.products.create({
        name: item.product_name,
        metadata: { order_id: order.id, product_id: item.product_id },
      }))
    );
    const feeProduct = quote.preparation_fee_cents > 0
      ? await stripe.products.create({
          name: locale === "en" ? "Preparation fee" : "Frais de préparation",
          metadata: { order_id: order.id, type: "preparation_fee" },
        })
      : null;

    const stripeDiscount = quote.discount_cents > 0
      ? [{
          coupon: (await stripe.coupons.create({
            amount_off: quote.discount_cents,
            currency: PRICING_CURRENCY,
            duration: "once",
            applies_to: { products: stripeProducts.map((product) => product.id) },
          })).id,
        }]
      : undefined;

    const sessionLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = quote.items.map((item, index) => ({
      quantity: item.quantity,
      price_data: {
        currency: PRICING_CURRENCY,
        unit_amount: item.unit_price_cents,
        product: stripeProducts[index].id,
      },
    }));
    if (feeProduct) {
      sessionLineItems.push({
        quantity: 1,
        price_data: {
          currency: PRICING_CURRENCY,
          unit_amount: quote.preparation_fee_cents,
          product: feeProduct.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: sessionLineItems,
      discounts: stripeDiscount,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        total_cents: String(quote.total_cents),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout?payment=cancelled`,
    });

    await (supabase as any)
      .from("orders")
      .update({ payment_reference: session.id })
      .eq("id", order.id);
    return NextResponse.json({ url: session.url, quote });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json(
        { error: error.code, details: error.message },
        { status: 400 }
      );
    }

    console.error("Payment session creation failed", error);
    if (createdOrderId) {
      try {
        const supabase = await createClient();
        await (supabase as any).from("orders").update({
          status: "cancelled",
          payment_status: "cancelled",
        }).eq("id", createdOrderId).eq("payment_status", "pending_payment");
      } catch (cleanupError) {
        console.error("Unable to cancel failed payment order", cleanupError);
      }
    }
    return NextResponse.json({ error: "Unable to start payment" }, { status: 500 });
  }
}
