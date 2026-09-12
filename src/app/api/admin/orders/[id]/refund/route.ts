import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import Stripe from "stripe";
import { getAdminSupabase } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStripeRefund } from "@/lib/stripe-refunds";
import { recordAudit } from "@/lib/audit";
import { refundRequestSchema, uuidSchema } from "@/lib/api-schemas";
import {
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

type RefundReservation = {
  id: string;
  request_key: string;
  stripe_refund_id: string | null;
  amount: number;
  product_amount: number;
  status: string;
  items: unknown;
};

type MatchingRefund = Pick<RefundReservation, "id" | "request_key" | "stripe_refund_id" | "status">;

function isDefinitiveRefundError(error: unknown): boolean {
  return error instanceof Stripe.errors.StripeInvalidRequestError;
}

async function resolvePaymentIntent(
  stripe: Stripe,
  paymentReference: string,
  orderId: string,
  userId: string,
  totalAmount: number,
): Promise<string> {
  if (/^pi_[A-Za-z0-9]+$/.test(paymentReference)) return paymentReference;
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(paymentReference)) {
    throw new Error("Payment intent is unavailable");
  }

  const session = await stripe.checkout.sessions.retrieve(paymentReference);
  const expectedAmount = Math.round(Number(totalAmount) * 100);
  if (session.id !== paymentReference
    || session.mode !== "payment"
    || session.status !== "complete"
    || session.payment_status !== "paid"
    || session.currency !== "eur"
    || !Number.isSafeInteger(expectedAmount)
    || session.amount_total !== expectedAmount
    || session.metadata?.order_id !== orderId
    || session.metadata?.user_id !== userId) {
    throw new Error("Payment intent is unavailable");
  }
  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  if (!paymentIntent || !/^pi_[A-Za-z0-9]+$/.test(paymentIntent)) {
    throw new Error("Payment intent is unavailable");
  }
  return paymentIntent;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  try {
    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const body = await readBoundedJson(request, refundRequestSchema);
    const { data: staffUser, error: staffError } = await supabase.auth.getUser();
    if (staffError || !staffUser.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, payment_status, payment_reference, total_amount")
      .eq("id", id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || !order.user_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.payment_reference || !["paid", "partially_refunded"].includes(order.payment_status)) {
      return NextResponse.json({ error: "Order is not refundable" }, { status: 400 });
    }

    const fingerprint = createHash("sha256").update(JSON.stringify({
      order_id: id,
      full_order: body.full_order,
      item_ids: [...body.item_ids].sort(),
    })).digest("hex");
    const requestKeyPrefix = `admin-refund:${fingerprint}:`;
    const { data: matchingRows, error: matchingError } = await supabase
      .from("order_refunds")
      .select("id, request_key, stripe_refund_id, status")
      .eq("order_id", id)
      .like("request_key", `${requestKeyPrefix}%`);
    if (matchingError) throw matchingError;
    const matchingRefunds = (matchingRows || []) as MatchingRefund[];
    let reservation: RefundReservation | null = null;

    const pendingRefund = matchingRefunds.find((refund) => refund.status === "pending");
    const completedRefund = matchingRefunds.find((refund) => refund.status === "succeeded");
    if (pendingRefund || completedRefund) {
      const selected = pendingRefund || completedRefund;
      if (!selected) throw new Error("Refund reservation was not found");
      const { data: selectedRow, error: selectedError } = await supabase
        .from("order_refunds")
        .select("id, request_key, stripe_refund_id, amount, product_amount, status, items")
        .eq("id", selected.id)
        .single();
      if (selectedError || !selectedRow) throw selectedError || new Error("Refund reservation was not found");
      reservation = selectedRow as RefundReservation;
    }

    const serviceSupabase = createAdminClient();
    if (!reservation) {
      const nextAttempt = matchingRefunds.reduce((maximum, refund) => {
        const attempt = Number(refund.request_key?.slice(requestKeyPrefix.length));
        return Number.isInteger(attempt) && attempt > maximum ? attempt : maximum;
      }, 0) + 1;
      const requestKey = `${requestKeyPrefix}${nextAttempt}`;
      const { data: reservationRows, error: reservationError } = await serviceSupabase.rpc("create_refund_reservation", {
        p_order_id: id,
        p_user_id: order.user_id,
        p_request_key: requestKey,
        p_full_order: body.full_order,
        p_item_ids: body.item_ids,
        p_created_by: staffUser.user.id,
      });
      if (reservationError) {
        if (reservationError.code !== "23505") throw reservationError;
        const { data: concurrentRow, error: concurrentError } = await supabase
          .from("order_refunds")
          .select("id, request_key, stripe_refund_id, amount, product_amount, status, items")
          .eq("request_key", requestKey)
          .maybeSingle();
        if (concurrentError || !concurrentRow) {
          throw concurrentError || new Error("Another refund is already being processed");
        }
        reservation = concurrentRow as RefundReservation;
      } else {
        const created = reservationRows?.[0] as RefundReservation | undefined;
        if (!created) throw new Error("Refund reservation was not created");
        reservation = created;
      }
    }

    if (!reservation) throw new Error("Refund reservation was not created");
    if (reservation.stripe_refund_id) {
      const synced = await syncStripeRefund({
        supabase: serviceSupabase,
        stripe: new Stripe(key),
        stripeRefundId: reservation.stripe_refund_id,
        localRefundId: reservation.id,
      });
      return NextResponse.json(synced, { status: synced.refund.status === "pending" ? 202 : 200 });
    }
    if (reservation.status !== "pending") {
      return NextResponse.json({ error: "Refund is not pending" }, { status: 409 });
    }

    await recordAudit(supabase, {
      action: "order.refunded",
      entityType: "order",
      entityId: id,
      summary: `Remboursement demandé${body.full_order ? " (commande complète)" : ""}`,
      metadata: {
        refund_id: reservation.id,
        amount: reservation.amount,
        product_amount: reservation.product_amount,
        full_order: body.full_order,
        item_ids: body.item_ids,
      },
    });

    const stripe = new Stripe(key);
    const paymentIntent = await resolvePaymentIntent(
      stripe,
      order.payment_reference,
      order.id,
      order.user_id,
      order.total_amount,
    );
    let refund: Stripe.Refund;
    try {
      refund = await stripe.refunds.create({
        payment_intent: paymentIntent,
        amount: Math.round(Number(reservation.amount) * 100),
        metadata: {
          order_id: id,
          order_refund_id: reservation.id,
          product_amount: Number(reservation.product_amount).toFixed(2),
        },
      }, { idempotencyKey: reservation.request_key });
    } catch (error) {
      if (isDefinitiveRefundError(error)) {
        const { error: markError } = await serviceSupabase.rpc("mark_refund_failed", {
          p_refund_id: reservation.id,
          p_reason: "Stripe rejected the refund request",
        });
        if (markError) safeLogError("Unable to mark rejected refund", markError);
      }
      throw error;
    }

    const synced = await syncStripeRefund({
      supabase: serviceSupabase,
      stripe,
      stripeRefundId: refund.id,
      localRefundId: reservation.id,
    });
    return NextResponse.json(synced, { status: synced.refund.status === "pending" ? 202 : 201 });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("Admin refund error", error);
    return NextResponse.json({ error: "Unable to create refund" }, { status: 500 });
  }
}
