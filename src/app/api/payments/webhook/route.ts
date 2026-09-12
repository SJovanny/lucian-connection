import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStripeRefund } from "@/lib/stripe-refunds";
import {
  apiRequestErrorResponse,
  readBoundedBody,
  safeLogError,
} from "@/lib/api-request";

class WebhookProcessingError extends Error {
  constructor(message: string, public readonly status: 400 | 500) {
    super(message);
    this.name = "WebhookProcessingError";
  }
}

function getPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id || null;
}

async function handleSuccessfulCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  stripe: Stripe,
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.order_id;
  if (!orderId) throw new WebhookProcessingError("Payment order metadata is missing", 400);

  let verifiedSession: Stripe.Checkout.Session;
  try {
    verifiedSession = await stripe.checkout.sessions.retrieve(session.id);
  } catch (error) {
    safeLogError("Webhook: unable to retrieve checkout session", error);
    throw new WebhookProcessingError("Unable to verify payment", 500);
  }

  if (event.type === "checkout.session.completed"
    && verifiedSession.status === "complete"
    && verifiedSession.payment_status === "unpaid") {
    return;
  }

  const { data: order, error: orderFetchError } = await supabase
    .from("orders")
    .select("user_id, subtotal, total_amount, coupon_id, payment_status, payment_reference, payment_session_id")
    .eq("id", orderId)
    .single();
  if (orderFetchError || !order) {
    safeLogError("Webhook: unable to fetch payment order", orderFetchError);
    throw new WebhookProcessingError("Unable to fetch order", 500);
  }

  if (verifiedSession.metadata?.order_id !== orderId
    || verifiedSession.metadata?.user_id !== order.user_id) {
    throw new WebhookProcessingError("Payment metadata does not match order", 400);
  }
  if ((order.payment_session_id && order.payment_session_id !== verifiedSession.id)
    || (!order.payment_session_id
      && order.payment_reference?.startsWith("cs_")
      && order.payment_reference !== verifiedSession.id)) {
    throw new WebhookProcessingError("Payment session does not match order", 400);
  }
  if (!["pending_payment", "paid", "partially_refunded"].includes(order.payment_status)) return;

  const expectedAmount = Math.round(Number(order.total_amount || 0) * 100);
  const metadataAmount = Number(verifiedSession.metadata?.total_cents);
  const metadataMatches = verifiedSession.metadata?.total_cents === undefined
    || (Number.isInteger(metadataAmount) && metadataAmount === expectedAmount);
  const paymentIntent = getPaymentIntentId(verifiedSession);
  const isValidPayment = verifiedSession.status === "complete"
    && verifiedSession.payment_status === "paid"
    && verifiedSession.currency === "eur"
    && verifiedSession.amount_total === expectedAmount
    && metadataMatches
    && verifiedSession.metadata?.order_id === orderId
    && typeof paymentIntent === "string"
    && /^pi_[A-Za-z0-9]+$/.test(paymentIntent);
  if (!isValidPayment) {
    console.error("Webhook: payment verification failed", {
      order_id: orderId,
      session_status: verifiedSession.status,
      payment_status: verifiedSession.payment_status,
      currency: verifiedSession.currency,
      amount_total: verifiedSession.amount_total,
      expected_amount: expectedAmount,
    });
    throw new WebhookProcessingError("Payment verification failed", 400);
  }

  const { data: finalized, error: finalizeError } = await supabase.rpc("finalize_paid_order", {
    p_order_id: orderId,
    p_session_id: verifiedSession.id,
    p_payment_intent: paymentIntent,
    p_event_id: event.id,
  });
  if (finalizeError || !finalized?.[0]) {
    safeLogError("Webhook: unable to finalize paid order", finalizeError);
    throw new WebhookProcessingError("Unable to finalize order", 500);
  }
}

async function handleCancelledCheckout(
  supabase: ReturnType<typeof createAdminClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.order_id;
  if (!orderId) throw new WebhookProcessingError("Payment order metadata is missing", 400);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("user_id, payment_status, payment_reference, payment_session_id")
    .eq("id", orderId)
    .single();
  if (orderError || !order) {
    safeLogError("Webhook: unable to fetch cancellation order", orderError);
    throw new WebhookProcessingError("Unable to fetch order", 500);
  }
  if (!["pending_payment", "cancelled"].includes(order.payment_status)) return;

  let canonicalSession: Stripe.Checkout.Session;
  try {
    canonicalSession = await stripe.checkout.sessions.retrieve(session.id);
  } catch (error) {
    safeLogError("Webhook: unable to retrieve checkout session for cancellation", error);
    throw new WebhookProcessingError("Unable to verify cancellation", 500);
  }
  if (canonicalSession.metadata?.order_id !== orderId
    || (canonicalSession.metadata?.user_id && canonicalSession.metadata.user_id !== order.user_id)
    || (order.payment_session_id && order.payment_session_id !== canonicalSession.id)
    || (!order.payment_session_id
      && order.payment_reference?.startsWith("cs_")
      && order.payment_reference !== canonicalSession.id)) {
    throw new WebhookProcessingError("Payment metadata does not match order", 400);
  }
  if (canonicalSession.payment_status === "paid") return;

  const { error: cancellationError } = await supabase.rpc("cancel_pending_order", {
    p_order_id: orderId,
  });
  if (cancellationError) {
    safeLogError("Webhook: unable to cancel pending order", cancellationError);
    throw new WebhookProcessingError("Unable to cancel order", 500);
  }
}

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

  let claimed = false;
  try {
    const { data: shouldProcess, error: claimError } = await supabase.rpc("claim_stripe_webhook_event", {
      p_event_id: event.id,
      p_event_type: event.type,
    });
    if (claimError) throw claimError;
    if (shouldProcess !== true) return NextResponse.json({ received: true });
    claimed = true;

    const stripe = new Stripe(key);
    if (event.type.startsWith("checkout.session.")) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (event.type === "checkout.session.completed"
        || event.type === "checkout.session.async_payment_succeeded") {
        await handleSuccessfulCheckout(supabase, stripe, event, session);
      } else {
        await handleCancelledCheckout(supabase, stripe, session);
      }
    } else {
      const refund = event.data.object as Stripe.Refund;
      const synced = await syncStripeRefund({
        supabase,
        stripe,
        stripeRefundId: refund.id,
        localRefundId: refund.metadata?.order_refund_id,
      });
      console.log(`Stripe refund synchronized: ${synced.refund.id} (${synced.refund.stripe_status})`);
    }

    const { error: completeError } = await supabase.rpc("complete_stripe_webhook_event", {
      p_event_id: event.id,
    });
    if (completeError) throw completeError;
    return NextResponse.json({ received: true });
  } catch (error) {
    if (claimed) {
      const { error: failError } = await supabase.rpc("fail_stripe_webhook_event", {
        p_event_id: event.id,
        p_error_code: error instanceof WebhookProcessingError ? error.name : "processing_failed",
      });
      if (failError) safeLogError("Webhook: unable to mark event failed", failError);
    }
    if (error instanceof WebhookProcessingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    safeLogError("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
