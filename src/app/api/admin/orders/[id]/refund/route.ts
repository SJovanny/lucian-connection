import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import Stripe from "stripe";
import { getAdminSupabase } from "@/lib/admin-auth";

type RefundItem = {
  order_item_id?: string;
  product_id?: string | null;
  quantity: number;
  amount: number;
};
type OrderItemRow = { id: string; product_id: string | null; quantity: number; total_price: number };
type RefundStatus = "pending" | "succeeded" | "failed" | "canceled";
type ExistingRefund = {
  id: string;
  request_key: string | null;
  stripe_refund_id: string | null;
  amount: number;
  product_amount: number;
  status: RefundStatus;
  items: RefundItem[] | null;
};

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

function sumRefunds(refunds: ExistingRefund[], field: "amount" | "product_amount"): number {
  return refunds.reduce((sum, refund) => sum + toCents(refund[field]), 0);
}

function getProductAmountsByOrderItem(orderItems: OrderItemRow[], productTotalCents: number): Map<string, number> {
  const amounts = new Map<string, number>();
  const items = [...orderItems].sort((left, right) => left.id.localeCompare(right.id));
  const grossTotalCents = items.reduce((sum, item) => sum + toCents(item.total_price), 0);
  let allocatedCents = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const isLastItem = index === items.length - 1;
    const amountCents = isLastItem
      ? Math.max(0, productTotalCents - allocatedCents)
      : Math.floor(toCents(item.total_price) * productTotalCents / Math.max(1, grossTotalCents));
    amounts.set(item.id, amountCents);
    allocatedCents += amountCents;
  }

  return amounts;
}

function getRefundedQuantities(refunds: ExistingRefund[], orderItems: OrderItemRow[]): Map<string, number> {
  const quantities = new Map<string, number>();
  const orderItemIds = new Set(orderItems.map((item) => item.id));
  const uniqueOrderItemIdByProductId = new Map<string, string>();
  const duplicateProductIds = new Set<string>();

  for (const item of orderItems) {
    if (!item.product_id || duplicateProductIds.has(item.product_id)) continue;
    if (uniqueOrderItemIdByProductId.has(item.product_id)) {
      uniqueOrderItemIdByProductId.delete(item.product_id);
      duplicateProductIds.add(item.product_id);
    } else {
      uniqueOrderItemIdByProductId.set(item.product_id, item.id);
    }
  }

  for (const refund of refunds) {
    for (const item of Array.isArray(refund.items) ? refund.items : []) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) continue;
      const orderItemId = item.order_item_id && orderItemIds.has(item.order_item_id)
        ? item.order_item_id
        : item.product_id && uniqueOrderItemIdByProductId.get(item.product_id)
          ? uniqueOrderItemIdByProductId.get(item.product_id)
          : item.product_id && orderItemIds.has(item.product_id)
            ? item.product_id
            : null;
      if (!orderItemId) continue;
      quantities.set(orderItemId, (quantities.get(orderItemId) || 0) + item.quantity);
    }
  }
  return quantities;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  try {
    const { id } = await params;
    const body = await request.json();
    const fullOrder = body.full_order === true;
    const itemIds = Array.isArray(body.item_ids)
      ? [...new Set(body.item_ids.filter((itemId: unknown): itemId is string => typeof itemId === "string" && itemId.length > 0))]
      : [];
    if (!fullOrder && itemIds.length === 0) {
      return NextResponse.json({ error: "Select at least one order item" }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, subtotal, total_amount, delivery_fee, discount_amount, payment_status, payment_reference, order_items(id, product_id, quantity, total_price)")
      .eq("id", id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || !order.user_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.payment_reference || !["paid", "partially_refunded"].includes(order.payment_status)) return NextResponse.json({ error: "Order is not refundable" }, { status: 400 });

    const { data: existingRefunds, error: refundsError } = await supabase
      .from("order_refunds")
      .select("id, request_key, stripe_refund_id, amount, product_amount, status, items")
      .eq("order_id", id);
    if (refundsError) throw refundsError;

    const orderItems = (Array.isArray(order.order_items) ? order.order_items : []) as unknown as OrderItemRow[];
    const refunds = (existingRefunds || []) as ExistingRefund[];
    const requestFingerprint = createHash("sha256").update(JSON.stringify({
      orderId: id,
      fullOrder,
      itemIds: [...itemIds].sort(),
    })).digest("hex");
    const requestKeyPrefix = `admin-refund:${requestFingerprint}:`;
    const matchingRefunds = refunds.filter((refund) => refund.request_key?.startsWith(requestKeyPrefix));
    const completedRefund = matchingRefunds.find((refund) => refund.status === "succeeded");
    if (completedRefund) {
      const { data: succeededRefunds, error: succeededRefundsError } = await supabase
        .from("order_refunds")
        .select("amount")
        .eq("order_id", id)
        .eq("status", "succeeded");
      if (succeededRefundsError) throw succeededRefundsError;

      const fullyRefunded = (succeededRefunds || []).reduce(
        (sum, succeededRefund) => sum + toCents(succeededRefund.amount),
        0
      ) >= toCents(order.total_amount);
      const { data: updatedOrder, error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: fullyRefunded ? "refunded" : "partially_refunded",
          refunded_at: new Date().toISOString(),
          ...(fullyRefunded ? { status: "refunded" } : {}),
        })
        .eq("id", id)
        .select("payment_status, status")
        .single();
      if (orderUpdateError) throw orderUpdateError;

      return NextResponse.json({ refund: completedRefund, order: updatedOrder });
    }

    let reservation = matchingRefunds.find((refund) => refund.status === "pending") || null;
    if (reservation?.stripe_refund_id) {
      return NextResponse.json({ refund: reservation, order: null }, { status: 202 });
    }

    const heldRefunds = refunds.filter(
      (refund) => refund.status === "pending" || refund.status === "succeeded"
    );
    const totalCents = toCents(order.total_amount);
    const subtotalCents = toCents(order.subtotal);
    const discountCents = Math.min(subtotalCents, toCents(order.discount_amount));
    const productTotalCents = Math.min(totalCents, Math.max(0, subtotalCents - discountCents));
    const refundedAmountCents = sumRefunds(heldRefunds, "amount");
    const refundedProductCents = sumRefunds(heldRefunds, "product_amount");
    const remainingAmountCents = Math.max(0, totalCents - refundedAmountCents);
    const remainingProductCents = Math.max(0, productTotalCents - refundedProductCents);
    let amountCents = reservation ? toCents(reservation.amount) : 0;
    let productAmountCents = reservation ? toCents(reservation.product_amount) : 0;
    let items = reservation?.items || [];

    if (!reservation) {
      if (remainingAmountCents === 0) return NextResponse.json({ error: "Order is already fully refunded" }, { status: 400 });
      if (heldRefunds.some((refund) => refund.status === "pending")) {
        return NextResponse.json({ error: "Another refund is already being processed" }, { status: 409 });
      }

      if (fullOrder) {
        amountCents = remainingAmountCents;
        productAmountCents = remainingProductCents;
        items = [];
      } else {
        const selectedItems = orderItems.filter((item) => itemIds.includes(item.id));
        if (selectedItems.length !== itemIds.length) {
          return NextResponse.json({ error: "One or more order items were not found" }, { status: 400 });
        }

        const hasUnitemizedRefund = heldRefunds.some((refund) => !Array.isArray(refund.items) || refund.items.length === 0);
        if (hasUnitemizedRefund) {
          return NextResponse.json({ error: "The remaining refund must be processed for the full order" }, { status: 400 });
        }

        const refundedQuantities = getRefundedQuantities(heldRefunds, orderItems);
        const productAmountsByOrderItem = getProductAmountsByOrderItem(orderItems, productTotalCents);
        let selectedProductCents = 0;
        const selectedRefundItems: RefundItem[] = [];
        for (const item of selectedItems) {
          const alreadyRefundedQuantity = refundedQuantities.get(item.id) || 0;
          if (alreadyRefundedQuantity + item.quantity > item.quantity) {
            return NextResponse.json({ error: "One or more selected items were already refunded" }, { status: 400 });
          }

          const itemProductCents = productAmountsByOrderItem.get(item.id) || 0;
          selectedProductCents += itemProductCents;
          selectedRefundItems.push({
            order_item_id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            amount: fromCents(itemProductCents),
          });
        }

        amountCents = selectedProductCents;
        productAmountCents = selectedProductCents;
        items = selectedRefundItems;
      }

      if (amountCents <= 0 || amountCents > remainingAmountCents || productAmountCents > remainingProductCents) {
        return NextResponse.json({ error: "Refund exceeds order amount" }, { status: 400 });
      }

      const attempts = matchingRefunds.reduce((maximum, refund) => {
        const attempt = Number(refund.request_key?.slice(requestKeyPrefix.length));
        return Number.isInteger(attempt) && attempt > maximum ? attempt : maximum;
      }, 0);
      const requestKey = `${requestKeyPrefix}${attempts + 1}`;
      const { data: createdReservation, error: reservationError } = await supabase
        .from("order_refunds")
        .insert({
          order_id: id,
          user_id: order.user_id,
          request_key: requestKey,
          amount: fromCents(amountCents),
          product_amount: fromCents(productAmountCents),
          items,
          status: "pending",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select("id, request_key, stripe_refund_id, amount, product_amount, status, items")
        .single();
      if (reservationError) {
        if (reservationError.code !== "23505") throw reservationError;
        const { data: concurrentReservation, error: concurrentReservationError } = await supabase
          .from("order_refunds")
          .select("id, request_key, stripe_refund_id, amount, product_amount, status, items")
          .eq("request_key", requestKey)
          .maybeSingle();
        if (concurrentReservationError) throw concurrentReservationError;
        if (!concurrentReservation) {
          return NextResponse.json({ error: "Another refund is already being processed" }, { status: 409 });
        }
        reservation = concurrentReservation as ExistingRefund;
      } else {
        reservation = createdReservation as ExistingRefund;
      }
    }

    if (!reservation?.request_key) throw new Error("Refund reservation was not created");
    if (reservation.status === "succeeded") {
      return NextResponse.json({ refund: reservation, order: null });
    }
    if (reservation.stripe_refund_id) {
      return NextResponse.json({ refund: reservation, order: null }, { status: 202 });
    }

    const stripe = new Stripe(key);
    let paymentIntent = order.payment_reference;
    if (!paymentIntent.startsWith("pi_")) {
      const session = await stripe.checkout.sessions.retrieve(paymentIntent);
      paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : "";
    }
    if (!paymentIntent.startsWith("pi_")) return NextResponse.json({ error: "Payment intent not found" }, { status: 400 });

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
      amount: amountCents,
      metadata: {
        order_id: id,
        order_refund_id: reservation.id,
        product_amount: fromCents(productAmountCents).toFixed(2),
      },
    }, { idempotencyKey: reservation.request_key });
    const responseRefundStatus = getRefundStatus(refund.status);
    const { data: currentReservation, error: currentReservationError } = await supabase
      .from("order_refunds")
      .select("status")
      .eq("id", reservation.id)
      .single();
    if (currentReservationError) throw currentReservationError;
    const refundStatus = getRefundStatusRank(getRefundStatus(currentReservation.status)) > getRefundStatusRank(responseRefundStatus)
      ? getRefundStatus(currentReservation.status)
      : responseRefundStatus;
    const { data: refundRow, error } = await supabase
      .from("order_refunds")
      .update({ stripe_refund_id: refund.id, status: refundStatus })
      .eq("id", reservation.id)
      .select()
      .single();
    if (error || !refundRow) throw error || new Error("Unable to update refund reservation");

    if (refundRow.status === "failed" || refundRow.status === "canceled") {
      return NextResponse.json({ error: "Stripe could not complete the refund" }, { status: 409 });
    }

    let updatedOrder: { payment_status: string; status: string } | null = null;
    if (refundRow.status === "succeeded") {
      const { data: succeededRefunds, error: succeededRefundsError } = await supabase
        .from("order_refunds")
        .select("amount")
        .eq("order_id", id)
        .eq("status", "succeeded");
      if (succeededRefundsError) throw succeededRefundsError;
      const fullyRefunded = (succeededRefunds || []).reduce((sum, succeededRefund) => sum + toCents(succeededRefund.amount), 0) >= totalCents;
      const { data, error: orderUpdateError } = await supabase
        .from("orders")
        .update({
          payment_status: fullyRefunded ? "refunded" : "partially_refunded",
          refunded_at: new Date().toISOString(),
          ...(fullyRefunded ? { status: "refunded" } : {}),
        })
        .eq("id", id)
        .select("payment_status, status")
        .single();
      if (orderUpdateError) throw orderUpdateError;
      updatedOrder = data;
    }

    return NextResponse.json({ refund: refundRow, order: updatedOrder }, { status: 201 });
  } catch (error) {
    console.error("Admin refund error", error);
    return NextResponse.json({ error: "Unable to create refund" }, { status: 500 });
  }
}
