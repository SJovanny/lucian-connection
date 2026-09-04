import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type RefundItem = { product_id: string; quantity: number; amount: number };

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = new Stripe(key).webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const handledEvents = new Set([
    "checkout.session.completed",
    "checkout.session.expired",
    "checkout.session.async_payment_failed",
    "refund.created",
    "refund.updated",
  ]);
  if (!handledEvents.has(event.type)) return NextResponse.json({ received: true });

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("Webhook Supabase admin configuration error", error);
    return NextResponse.json({ error: "Webhook server configuration error" }, { status: 503 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (orderId && event.type === "checkout.session.completed") {
    const { data: order } = await supabase.from("orders").select("user_id, subtotal").eq("id", orderId).single();
    await supabase.from("orders").update({
      payment_status: "paid", paid_at: new Date().toISOString(),
      payment_reference: session.payment_intent?.toString() || session.id,
    }).eq("id", orderId);
    if (order?.user_id) {
      const { data: settings } = await supabase.from("store_settings").select("loyalty_points_per_euro").limit(1).maybeSingle();
      const rate = Number(settings?.loyalty_points_per_euro || 1);
      const points = Math.floor(Number(order.subtotal) * rate);
      await supabase.rpc("loyalty_earn_points", {
        p_user_id: order.user_id,
        p_order_id: orderId,
        p_points: points,
        p_description: `Points gagnés sur la commande #${orderId.slice(0, 8)}`,
      });
    }
  }
  if (orderId && (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed")) {
    await supabase.from("orders").update({ payment_status: "cancelled" }).eq("id", orderId);
  }

  if (event.type === "refund.created" || event.type === "refund.updated") {
    const refund = event.data.object as Stripe.Refund;
    const paymentIntentId = typeof refund.payment_intent === "string" ? refund.payment_intent : null;
    const refundOrderId = refund.metadata?.order_id || (paymentIntentId
      ? (await supabase.from("orders").select("id").eq("payment_reference", paymentIntentId).maybeSingle()).data?.id
      : null);
    if (refundOrderId) {
      const { data: order } = await supabase.from("orders").select("user_id, subtotal").eq("id", refundOrderId).single();
      if (order?.user_id) {
        const productAmount = Math.min(Number(refund.metadata?.product_amount || refund.amount / 100), Number(order.subtotal));
        let refundItems: RefundItem[] = [];
        try { refundItems = refund.metadata?.items ? JSON.parse(refund.metadata.items) as RefundItem[] : []; } catch { refundItems = []; }
        const refundStatus = refund.status === "succeeded" || refund.status === "failed" || refund.status === "canceled" ? refund.status : "pending";
        const { data: refundRow, error: refundError } = await supabase.from("order_refunds").upsert({
          order_id: refundOrderId,
          user_id: order.user_id,
          stripe_refund_id: refund.id,
          amount: refund.amount / 100,
          product_amount: Math.max(0, productAmount),
          items: refundItems,
          status: refundStatus,
        }, { onConflict: "stripe_refund_id" }).select("id, status").single();
        if (refundError) console.error("Unable to store Stripe refund", refundError);
        if (refundRow?.status === "succeeded") {
          await supabase.from("orders").update({
            payment_status: refund.amount >= Number((await supabase.from("orders").select("total_amount").eq("id", refundOrderId).single()).data?.total_amount || 0) * 100 ? "refunded" : "partially_refunded",
            refunded_at: new Date().toISOString(),
          }).eq("id", refundOrderId);
          await supabase.rpc("loyalty_apply_refund", { p_refund_id: refundRow.id });
        }
      }
    }
  }
  return NextResponse.json({ received: true });
}
