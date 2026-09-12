import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Order, OrderRefund, OrderRefundItem } from "@/types/database.types";

type StoredRefund = Pick<
  OrderRefund,
  | "id"
  | "order_id"
  | "user_id"
  | "request_key"
  | "amount"
  | "product_amount"
  | "items"
  | "status"
  | "stripe_refund_id"
  | "stripe_status"
  | "stripe_reference"
  | "stripe_reference_status"
  | "stripe_reference_type"
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
  return typeof refund.payment_intent === "string" ? refund.payment_intent : refund.payment_intent?.id || null;
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

function isUuid(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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
  if (!/^re_[A-Za-z0-9]+$/.test(stripeRefundId)) {
    throw new Error("Invalid Stripe refund identifier");
  }

  // Retrieve the current Stripe object because webhook delivery order is not guaranteed.
  const stripeRefund = await stripe.refunds.retrieve(stripeRefundId);
  const metadata = stripeRefund.metadata || {};
  const metadataOrderId = metadata.order_id;
  const metadataRefundId = isUuid(metadata.order_refund_id) ? metadata.order_refund_id : null;
  const requestedRefundId = localRefundId || metadataRefundId;
  if (localRefundId && !isUuid(localRefundId)) throw new Error("Invalid local refund identifier");

  const refundFields = "id, order_id, user_id, request_key, amount, product_amount, items, status, stripe_refund_id, stripe_status, stripe_reference, stripe_reference_status, stripe_reference_type";
  let storedRefund: StoredRefund | null = null;
  if (requestedRefundId) {
    const { data, error } = await supabase
      .from("order_refunds")
      .select(refundFields)
      .eq("id", requestedRefundId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Local refund reservation was not found");
    storedRefund = data as StoredRefund;
  } else {
    const { data, error } = await supabase
      .from("order_refunds")
      .select(refundFields)
      .eq("stripe_refund_id", stripeRefund.id)
      .maybeSingle();
    if (error) throw error;
    storedRefund = data as StoredRefund | null;
  }

  let orderId = storedRefund?.order_id || (isUuid(metadataOrderId) ? metadataOrderId : null);
  const paymentIntentId = getPaymentIntentId(stripeRefund);
  if (!paymentIntentId || !/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
    throw new Error("Stripe refund payment intent is missing");
  }
  if (!orderId && paymentIntentId) {
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_reference", paymentIntentId)
      .maybeSingle();
    if (error) throw error;
    orderId = data?.id || null;
  }
  if (!orderId) throw new Error(`Unable to associate Stripe refund ${stripeRefund.id} with an order`);
  if (metadataOrderId && metadataOrderId !== orderId) {
    throw new Error("Stripe refund has inconsistent order metadata");
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, subtotal, total_amount, discount_amount, payment_reference")
    .eq("id", orderId)
    .single();
  if (orderError) throw orderError;
  if (!orderData?.user_id) throw new Error("Refund order has no customer");
  if (orderData.payment_reference?.startsWith("pi_")
    && paymentIntentId !== orderData.payment_reference) {
    throw new Error("Stripe refund payment intent does not match order");
  }

  const productTotalCents = Math.min(
    toCents(orderData.total_amount),
    Math.max(0, toCents(orderData.subtotal) - toCents(orderData.discount_amount)),
  );
  const metadataProductAmount = metadata.product_amount === undefined
    ? null
    : Number(metadata.product_amount);
  if (metadataProductAmount !== null
    && (!Number.isFinite(metadataProductAmount) || metadataProductAmount < 0)) {
    throw new Error("Stripe refund product amount is invalid");
  }

  // A local reservation is authoritative, including an intentionally empty
  // item list for a fee-only or full itemless refund.
  const refundItems = storedRefund
    ? storedRefund.items
    : parseRefundItems(metadata.items);
  const refundStatus = getRefundStatus(stripeRefund.status);
  const reference = getRefundReference(stripeRefund);
  const productAmountCents = storedRefund
    ? toCents(storedRefund.product_amount)
    : metadataProductAmount !== null
      ? Math.round(metadataProductAmount * 100)
      : stripeRefund.amount === toCents(orderData.total_amount)
        ? productTotalCents
        : (() => { throw new Error("Partial Stripe refund has no trusted product allocation"); })();

  const localRefundIdForRpc = storedRefund?.id || metadataRefundId;
  const { data: syncedRows, error: syncError } = await supabase.rpc("sync_stripe_refund", {
    p_local_refund_id: localRefundIdForRpc,
    p_order_id: orderId,
    p_user_id: orderData.user_id,
    p_stripe_refund_id: stripeRefund.id,
    p_payment_intent: paymentIntentId,
    p_stripe_status: stripeRefund.status || null,
    p_failure_reason: stripeRefund.failure_reason || null,
    p_pending_reason: stripeRefund.pending_reason || null,
    p_stripe_reference: reference.reference,
    p_stripe_reference_status: reference.status,
    p_stripe_reference_type: reference.type,
    p_amount: fromCents(stripeRefund.amount),
    p_product_amount: fromCents(productAmountCents),
    p_items: refundItems,
    p_status: refundStatus,
  });
  if (syncError || !syncedRows?.[0]) {
    throw syncError || new Error(`Unable to synchronize Stripe refund ${stripeRefund.id}`);
  }

  const syncedRow = syncedRows[0];
  const { data: refund, error: refundError } = await supabase
    .from("order_refunds")
    .select("*")
    .eq("id", syncedRow.refund_id)
    .single();
  if (refundError || !refund) {
    throw refundError || new Error(`Unable to reload Stripe refund ${stripeRefund.id}`);
  }

  return {
    refund: refund as OrderRefund,
    order: {
      payment_status: syncedRow.payment_status as Order["payment_status"],
      status: syncedRow.order_status as Order["status"],
      refunded_at: syncedRow.refunded_at,
    },
  };
}
