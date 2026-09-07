import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type RefundItem = {
  order_item_id?: string;
  product_id?: string | null;
  quantity: number;
  amount: number;
};
type RefundStatus = "pending" | "succeeded" | "failed" | "canceled";

function toCents(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function fromCents(value: number): number {
  return value / 100;
}

function getRefundStatus(status: string | null): RefundStatus {
  return status === "succeeded" || status === "failed" || status === "canceled" ? status : "pending";
}

function getRefundStatusRank(status: RefundStatus): number {
  if (status === "succeeded") return 2;
  if (status === "failed" || status === "canceled") return 1;
  return 0;
}

function parseRefundItems(value: string | undefined): RefundItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as RefundItem[] : [];
  } catch {
    return [];
  }
}

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
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  console.log(`Stripe webhook received: ${event.type} [${event.id}]`);

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
    await supabase.from("orders").update({ payment_status: "cancelled" }).eq("id", orderId);
  }

  if (event.type === "refund.created" || event.type === "refund.updated") {
    const refund = event.data.object as Stripe.Refund;
    const paymentIntentId = typeof refund.payment_intent === "string" ? refund.payment_intent : null;
    const refundReservationId = refund.metadata?.order_refund_id;
    const refundOrderId = refund.metadata?.order_id || (paymentIntentId
      ? (await supabase.from("orders").select("id").eq("payment_reference", paymentIntentId).maybeSingle()).data?.id
      : null);
    if (refundOrderId) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("user_id, subtotal, discount_amount, total_amount")
        .eq("id", refundOrderId)
        .single();
      if (orderError || !order) {
        console.error(`Unable to fetch order for Stripe refund ${refund.id}`, orderError);
        return NextResponse.json({ error: "Unable to store refund" }, { status: 500 });
      }
      if (!order.user_id) {
        console.error(`Stripe refund ${refund.id} belongs to order ${refundOrderId} without a user`);
        return NextResponse.json({ received: true });
      }

      const productTotalCents = Math.min(
        toCents(order.total_amount),
        Math.max(0, toCents(order.subtotal) - toCents(order.discount_amount))
      );
      const metadataProductAmount = Number(refund.metadata?.product_amount);
      const productAmountCents = Number.isFinite(metadataProductAmount)
        ? Math.min(toCents(metadataProductAmount), productTotalCents, refund.amount)
        : Math.min(refund.amount, productTotalCents);
      const eventRefundStatus = getRefundStatus(refund.status);
      const { data: existingRefund, error: existingRefundError } = refundReservationId
        ? await supabase
          .from("order_refunds")
          .select("id, status, items")
          .eq("id", refundReservationId)
          .eq("order_id", refundOrderId)
          .maybeSingle()
        : await supabase
          .from("order_refunds")
          .select("id, status, items")
          .eq("stripe_refund_id", refund.id)
          .maybeSingle();
      if (existingRefundError) {
        console.error(`Unable to fetch existing Stripe refund ${refund.id}`, existingRefundError);
        return NextResponse.json({ error: "Unable to store refund" }, { status: 500 });
      }

      const existingRefundStatus = existingRefund?.status as "pending" | "succeeded" | "failed" | "canceled" | undefined;
      const refundStatus = existingRefundStatus && getRefundStatusRank(existingRefundStatus) > getRefundStatusRank(eventRefundStatus)
        ? existingRefundStatus
        : eventRefundStatus;
      const refundItems = Array.isArray(existingRefund?.items) && existingRefund.items.length > 0
        ? existingRefund.items
        : parseRefundItems(refund.metadata?.items);
      const { data: refundRow, error: refundError } = existingRefund
        ? await supabase
          .from("order_refunds")
          .update({
            stripe_refund_id: refund.id,
            amount: fromCents(refund.amount),
            product_amount: fromCents(productAmountCents),
            items: refundItems,
            status: refundStatus,
          })
          .eq("id", existingRefund.id)
          .select("id, status")
          .single()
        : await supabase
          .from("order_refunds")
          .upsert({
            order_id: refundOrderId,
            user_id: order.user_id,
            stripe_refund_id: refund.id,
            amount: fromCents(refund.amount),
            product_amount: fromCents(productAmountCents),
            items: refundItems,
            status: refundStatus,
          }, { onConflict: "stripe_refund_id" })
          .select("id, status")
          .single();
      if (refundError || !refundRow) {
        console.error("Unable to store Stripe refund", refundError);
        return NextResponse.json({ error: "Unable to store refund" }, { status: 500 });
      }

      if (refundRow.status === "succeeded") {
        const { data: succeededRefunds, error: refundsError } = await supabase
          .from("order_refunds")
          .select("amount")
          .eq("order_id", refundOrderId)
          .eq("status", "succeeded");
        if (refundsError) {
          console.error(`Unable to calculate refunded amount for order ${refundOrderId}`, refundsError);
          return NextResponse.json({ error: "Unable to update refund status" }, { status: 500 });
        }

        const refundedAmountCents = (succeededRefunds || []).reduce((sum, row) => sum + toCents(row.amount), 0);
        const fullyRefunded = refundedAmountCents >= toCents(order.total_amount);
        const { error: orderUpdateError } = await supabase.from("orders").update({
          payment_status: fullyRefunded ? "refunded" : "partially_refunded",
          refunded_at: new Date().toISOString(),
          ...(fullyRefunded ? { status: "refunded" } : {}),
        }).eq("id", refundOrderId);
        if (orderUpdateError) {
          console.error(`Unable to update payment status for order ${refundOrderId}`, orderUpdateError);
          return NextResponse.json({ error: "Unable to update refund status" }, { status: 500 });
        }

        const { error: applyRefundError } = await supabase.rpc("loyalty_apply_refund", { p_refund_id: refundRow.id });
        if (applyRefundError) {
          console.error(`Webhook: unable to apply loyalty refund for refund ${refundRow.id}`, applyRefundError);
          return NextResponse.json({ error: "Unable to apply loyalty refund" }, { status: 500 });
        }
      }
    }
  }
  return NextResponse.json({ received: true });
}
