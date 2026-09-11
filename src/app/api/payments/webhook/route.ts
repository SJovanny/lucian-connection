import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStripeRefund } from "@/lib/stripe-refunds";
import {
  apiRequestErrorResponse,
  readBoundedBody,
  safeLogError,
} from "@/lib/api-request";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let body: Uint8Array;
  try {
    body = await readBoundedBody(request, 1024 * 1024);
  } catch (error) {
    return apiRequestErrorResponse(error)
      ?? NextResponse.json({ error: "Invalid webhook body" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = new Stripe(key).webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    safeLogError("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  console.log(`Stripe webhook received: ${event.type} [${event.id}]`);

  const handledEvents = new Set([
    "checkout.session.completed",
    "checkout.session.expired",
    "checkout.session.async_payment_failed",
    "checkout.session.async_payment_succeeded",
    "refund.created",
    "refund.updated",
    "refund.failed",
  ]);
  if (!handledEvents.has(event.type)) return NextResponse.json({ received: true });

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    safeLogError("Webhook Supabase admin configuration error", error);
    return NextResponse.json({ error: "Webhook server configuration error" }, { status: 503 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (orderId && (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded")) {
    const stripe = new Stripe(key);
    const verifiedSession = await stripe.checkout.sessions.retrieve(session.id);
    const { data: order, error: orderFetchError } = await supabase
      .from("orders")
      .select("user_id, subtotal, total_amount, coupon_id, payment_status")
      .eq("id", orderId)
      .single();
    if (orderFetchError) console.error(`Webhook: unable to fetch order ${orderId}`, orderFetchError);
    const expectedAmount = Math.round(Number(order?.total_amount || 0) * 100);
    const metadataAmount = Number(verifiedSession.metadata?.total_cents);
    const metadataMatches = verifiedSession.metadata?.total_cents === undefined
      || (Number.isInteger(metadataAmount) && metadataAmount === expectedAmount);
    const isValidPayment = verifiedSession.status === "complete"
      && verifiedSession.payment_status === "paid"
      && verifiedSession.currency === "eur"
      && verifiedSession.amount_total === expectedAmount
      && metadataMatches
      && verifiedSession.metadata?.order_id === orderId;
    if (!order || !isValidPayment) {
      console.error(`Webhook: payment verification failed for order ${orderId}`, {
        sessionStatus: verifiedSession.status,
        paymentStatus: verifiedSession.payment_status,
        currency: verifiedSession.currency,
        amountTotal: verifiedSession.amount_total,
        expectedAmount,
        metadataAmount,
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }
    const { error: orderUpdateError } = await supabase.from("orders").update({
      payment_status: "paid", paid_at: new Date().toISOString(),
      payment_reference: verifiedSession.payment_intent?.toString() || verifiedSession.id,
    }).eq("id", orderId).in("payment_status", ["pending_payment", "paid"]);
    if (orderUpdateError) {
      console.error(`Webhook: unable to mark order ${orderId} as paid`, orderUpdateError);
      return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
    }
    if (order?.coupon_id) {
      const { data: couponApplied, error: couponError } = await supabase.rpc("use_coupon", {
        p_coupon_id: order.coupon_id,
        p_order_id: orderId,
        p_user_id: order.user_id,
      });
      if (couponError) {
        console.error(`Webhook: unable to record coupon usage for order ${orderId}`, couponError);
        return NextResponse.json({ error: "Unable to record coupon usage" }, { status: 500 });
      } else if (couponApplied) {
        console.log(`Webhook: recorded usage of coupon ${order.coupon_id} for order ${orderId}`);
      } else {
        console.log(`Webhook: coupon usage for order ${orderId} already recorded (retry), skipped`);
      }
    }
    if (order?.user_id) {
      const { data: settings } = await supabase.from("store_settings").select("loyalty_points_per_euro").limit(1).maybeSingle();
      const rate = Number(settings?.loyalty_points_per_euro || 1);
      const points = Math.floor(Number(order.subtotal) * rate);
      const { error: loyaltyError } = await supabase.rpc("loyalty_earn_points", {
        p_user_id: order.user_id,
        p_order_id: orderId,
        p_points: points,
        p_description: `Points gagnés sur la commande #${orderId.slice(0, 8)}`,
      });
      if (loyaltyError) {
        console.error(`Webhook: unable to award loyalty points for order ${orderId}`, loyaltyError);
      } else {
        console.log(`Webhook: awarded ${points} loyalty points to user ${order.user_id} for order ${orderId}`);
      }
    } else {
      console.error(`Webhook: order ${orderId} has no user_id, cannot award loyalty points`);
    }
  }
  if (orderId && (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed")) {
    const { error: reservationError } = await supabase.rpc("release_coupon_reservation", {
      p_order_id: orderId,
      p_user_id: null,
    });
    if (reservationError) {
      console.error(`Webhook: unable to release coupon reservation for order ${orderId}`, reservationError);
    }
    await supabase.from("orders").update({
      payment_status: "cancelled",
      status: "cancelled",
      updated_at: new Date().toISOString(),
    }).eq("id", orderId).eq("payment_status", "pending_payment");
  }

  if (event.type === "refund.created" || event.type === "refund.updated" || event.type === "refund.failed") {
    const refund = event.data.object as Stripe.Refund;
    try {
      const synced = await syncStripeRefund({
        supabase,
        stripe: new Stripe(key),
        stripeRefundId: refund.id,
        localRefundId: refund.metadata?.order_refund_id,
      });
      console.log(`Stripe refund synchronized: ${synced.refund.id} (${synced.refund.stripe_status})`);
    } catch (error) {
      safeLogError(`Unable to synchronize Stripe refund ${refund.id}`, error);
      return NextResponse.json({ error: "Unable to synchronize refund" }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
