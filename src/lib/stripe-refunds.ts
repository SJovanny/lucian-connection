import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Order, OrderRefund, OrderRefundItem } from "@/types/database.types";

type StoredRefund = Pick<
  OrderRefund,
  "id" | "order_id" | "user_id" | "amount" | "product_amount" | "items" | "status" | "stripe_status" | "stripe_reference" | "stripe_reference_status" | "stripe_reference_type"
>;

type SyncedOrder = Pick<Order, "payment_status" | "status" | "refunded_at">;

export type StripeRefundSync = {
  refund: OrderRefund;
  order: SyncedOrder;
};

function toCents(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
}

function fromCents(value: number): number {
  return value / 100;
}

function getRefundStatus(status: string | null): OrderRefund["status"] {
  if (status === "succeeded" || status === "failed" || status === "canceled") return status;
  return "pending";
}

function parseRefundItems(value: string | undefined): OrderRefundItem[] {
  if (!value) return [];

  try {
    const items = JSON.parse(value);
    return Array.isArray(items) ? items as OrderRefundItem[] : [];
  } catch {
    return [];
  }
}

function getPaymentIntentId(refund: Stripe.Refund): string | null {
  return typeof refund.payment_intent === "string" ? refund.payment_intent : null;
}

function getRefundReference(refund: Stripe.Refund) {
  const destinationDetails = refund.destination_details as Record<string, unknown> | undefined;
  if (!destinationDetails) return { reference: null, status: null, type: null };

  for (const [destinationType, detail] of Object.entries(destinationDetails)) {
    if (destinationType === "type" || !detail || typeof detail !== "object") continue;
    const referenceDetail = detail as {
      reference?: string | null;
      reference_status?: string | null;
      reference_type?: string | null;
    };
    if (referenceDetail.reference) {
      return {
        reference: referenceDetail.reference,
        status: referenceDetail.reference_status || null,
        type: referenceDetail.reference_type || destinationType,
      };
    }
  }

  return { reference: null, status: null, type: null };
}

export async function syncStripeRefund({
  supabase,
  stripe,
  stripeRefundId,
  localRefundId,
}: {
  supabase: SupabaseClient<Database>;
  stripe: Stripe;
  stripeRefundId: string;
  localRefundId?: string;
}): Promise<StripeRefundSync> {
  // Retrieve the current Stripe object because webhook delivery order is not guaranteed.
  const stripeRefund = await stripe.refunds.retrieve(stripeRefundId);
  const metadata = stripeRefund.metadata || {};
  const metadataOrderId = metadata.order_id;
  const refundId = localRefundId || metadata.order_refund_id;

  let storedRefund: StoredRefund | null = null;
  if (refundId) {
    const { data, error } = await supabase
      .from("order_refunds")
      .select("id, order_id, user_id, amount, product_amount, items, status, stripe_status, stripe_reference, stripe_reference_status, stripe_reference_type")
      .eq("id", refundId)
      .maybeSingle();
    if (error) throw error;
    storedRefund = data as StoredRefund | null;
  } else {
    const { data, error } = await supabase
      .from("order_refunds")
      .select("id, order_id, user_id, amount, product_amount, items, status, stripe_status, stripe_reference, stripe_reference_status, stripe_reference_type")
      .eq("stripe_refund_id", stripeRefund.id)
      .maybeSingle();
    if (error) throw error;
    storedRefund = data as StoredRefund | null;
  }

  let orderId = storedRefund?.order_id || metadataOrderId || null;
  if (!orderId) {
    const paymentIntentId = getPaymentIntentId(stripeRefund);
    if (paymentIntentId) {
      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_reference", paymentIntentId)
        .maybeSingle();
      if (error) throw error;
      orderId = data?.id || null;
    }
  }
  if (!orderId) throw new Error(`Unable to associate Stripe refund ${stripeRefund.id} with an order`);
  if (metadataOrderId && metadataOrderId !== orderId) {
    throw new Error(`Stripe refund ${stripeRefund.id} has inconsistent order metadata`);
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, subtotal, total_amount, discount_amount")
    .eq("id", orderId)
    .single();
  if (orderError) throw orderError;
  if (!orderData?.user_id) throw new Error(`Order ${orderId} has no customer`);

  const productTotalCents = Math.min(
    toCents(orderData.total_amount),
    Math.max(0, toCents(orderData.subtotal) - toCents(orderData.discount_amount))
  );
  const metadataProductAmount = Number(metadata.product_amount);
  const productAmountCents = Number.isFinite(metadataProductAmount)
    ? Math.min(toCents(metadataProductAmount), productTotalCents, stripeRefund.amount)
    : Math.min(
      storedRefund ? toCents(storedRefund.product_amount) : stripeRefund.amount,
      productTotalCents,
      stripeRefund.amount
    );
  const refundItems = Array.isArray(storedRefund?.items) && storedRefund.items.length > 0
    ? storedRefund.items
    : parseRefundItems(metadata.items);
  const refundStatus = getRefundStatus(stripeRefund.status);
  const reference = getRefundReference(stripeRefund);
  const crossedConfirmationBoundary = (storedRefund?.status === "succeeded") !== (refundStatus === "succeeded");
  const refundUpdate = {
    stripe_refund_id: stripeRefund.id,
    stripe_status: stripeRefund.status || "unknown",
    failure_reason: stripeRefund.failure_reason || null,
    pending_reason: stripeRefund.pending_reason || null,
    last_stripe_sync_at: new Date().toISOString(),
    stripe_reference: reference.reference || storedRefund?.stripe_reference || null,
    stripe_reference_status: reference.status || storedRefund?.stripe_reference_status || null,
    stripe_reference_type: reference.type || storedRefund?.stripe_reference_type || null,
    amount: fromCents(stripeRefund.amount),
    product_amount: fromCents(productAmountCents),
    items: refundItems,
    status: refundStatus,
  };

  let refund: OrderRefund;
  if (storedRefund) {
    const { data, error } = await supabase
      .from("order_refunds")
      .update(refundUpdate)
      .eq("id", storedRefund.id)
      .select()
      .single();
    if (error || !data) throw error || new Error(`Unable to update Stripe refund ${stripeRefund.id}`);
    refund = data as OrderRefund;
  } else {
    const { data, error } = await supabase
      .from("order_refunds")
      .upsert({
        order_id: orderId,
        user_id: orderData.user_id,
        ...refundUpdate,
      }, { onConflict: "stripe_refund_id" })
      .select()
      .single();
    if (error || !data) throw error || new Error(`Unable to store Stripe refund ${stripeRefund.id}`);
    refund = data as OrderRefund;
  }

  const { data: orderStates, error: orderStateError } = await supabase.rpc("recompute_order_refund_state", {
    p_order_id: orderId,
  });
  if (orderStateError || !orderStates?.[0]) {
    throw orderStateError || new Error(`Unable to update refund state for order ${orderId}`);
  }

  const { data: loyaltyStates, error: loyaltyError } = await supabase.rpc("reconcile_order_refund_loyalty", {
    p_order_id: orderId,
    p_refund_id: crossedConfirmationBoundary ? refund.id : null,
  });
  if (loyaltyError) throw loyaltyError;

  if ((loyaltyStates?.[0]?.points_adjustment || 0) !== 0) {
    const { data: refreshedRefund, error: refreshedRefundError } = await supabase
      .from("order_refunds")
      .select()
      .eq("id", refund.id)
      .single();
    if (refreshedRefundError || !refreshedRefund) {
      throw refreshedRefundError || new Error(`Unable to refresh Stripe refund ${stripeRefund.id}`);
    }
    refund = refreshedRefund as OrderRefund;
  }

  const orderState = orderStates[0];
  return {
    refund,
    order: {
      payment_status: orderState.payment_status as Order["payment_status"],
      status: orderState.order_status as Order["status"],
      refunded_at: orderState.refunded_at,
    },
  };
}
