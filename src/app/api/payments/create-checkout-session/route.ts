/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { validatePickupAt } from "@/lib/pickup-rules";

const TERMS_VERSION = "1.0";
type ProductRow = {
  id: string;
  price: number;
  discounted_price: number | null;
  translations: Record<string, { name?: string }>;
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { items, phone, notes, locale, pickup_at, coupon_id, full_name, terms_accepted } = body;
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

    const ids = items.map((item: { id: string }) => item.id);
    const { data: products, error: productsError } = await (supabase as any)
      .from("products_with_discount")
      .select("id, price, discounted_price, translations")
      .in("id", ids)
      .eq("is_active", true);
    if (productsError || !products || products.length !== ids.length) {
      return NextResponse.json({ error: "One or more products are unavailable" }, { status: 400 });
    }

    const productRows = products as ProductRow[];
    const productById = new Map(productRows.map((product) => [product.id, product]));
    const orderItems = items.map((item: { id: string; quantity: number }) => {
      const product = productById.get(item.id);
      if (!product) throw new Error("Product unavailable");
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid quantity");
      const unitPrice = Number(product.discounted_price ?? product.price);
      return {
        product_id: item.id,
        product_name: product.translations?.[locale === "en" ? "en" : "fr"]?.name || product.id,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
      };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

    const { data: settings } = await (supabase as any)
      .from("store_settings").select("preparation_fee").limit(1).maybeSingle();
    const preparationFee = Number(settings?.preparation_fee || 0);
    let discount = 0;
    if (coupon_id) {
      const { data: coupon } = await (supabase as any)
        .from("coupons_active").select("*").eq("id", coupon_id).maybeSingle();
      if (coupon) {
        discount = coupon.discount_type === "percentage"
          ? subtotal * Number(coupon.discount_value) / 100
          : Number(coupon.discount_value);
        if (coupon.max_discount_amount) discount = Math.min(discount, Number(coupon.max_discount_amount));
        discount = Math.min(Math.max(0, discount), subtotal + preparationFee);
      }
    }
    const total = Math.max(0, subtotal + preparationFee - discount);
    const { data: order, error: orderError } = await (supabase as any)
      .from("orders")
      .insert({
        user_id: user.id, status: "pending", payment_status: "pending_payment",
        payment_provider: "stripe", subtotal, delivery_fee: preparationFee,
        total_amount: total, phone, notes: notes || null, locale: locale || "fr",
        coupon_id: coupon_id || null, discount_amount: discount,
        pickup_at: new Date(pickup_at).toISOString(), terms_version: TERMS_VERSION,
      })
      .select("id").single();
    if (orderError) throw orderError;

    const { error: itemsError } = await (supabase as any)
      .from("order_items").insert(orderItems.map((item: any) => ({ ...item, order_id: order.id })));
    if (itemsError) throw itemsError;

    await (supabase as any).from("legal_acceptances").insert({
      user_id: user.id, document_type: "terms", document_version: TERMS_VERSION, order_id: order.id,
      user_agent: request.headers.get("user-agent"),
    });

    const stripe = getStripe();
    const stripeDiscount = discount > 0
      ? [{ coupon: (await stripe.coupons.create({
          amount_off: Math.round(discount * 100), currency: "eur", duration: "once",
        })).id }]
      : undefined;
    const sessionLineItems = orderItems.map((item: any) => ({
      quantity: item.quantity,
      price_data: {
        currency: "eur" as const,
        unit_amount: Math.round(item.unit_price * 100),
        product_data: { name: item.product_name },
      },
    }));
    if (preparationFee > 0) {
      sessionLineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(preparationFee * 100),
          product_data: { name: locale === "en" ? "Preparation fee" : "Frais de préparation" },
        },
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: sessionLineItems,
      discounts: stripeDiscount,
      metadata: { order_id: order.id, user_id: user.id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin}/${locale || "fr"}/checkout?payment=cancelled`,
    });

    await (supabase as any).from("orders").update({ payment_reference: session.id }).eq("id", order.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Payment session creation failed", error);
    return NextResponse.json({ error: "Unable to start payment" }, { status: 500 });
  }
}
