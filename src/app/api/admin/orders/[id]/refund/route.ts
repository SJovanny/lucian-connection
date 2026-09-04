import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminSupabase } from "@/lib/admin-auth";

type RefundItem = { product_id: string; quantity: number; amount: number };

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });

  try {
    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);
    const productAmount = Number(body.product_amount ?? amount);
    const items = Array.isArray(body.items) ? body.items as RefundItem[] : [];
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(productAmount) || productAmount <= 0) {
      return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
    }
    const { data: order } = await supabase.from("orders").select("id, user_id, subtotal, total_amount, delivery_fee, discount_amount, payment_status, payment_reference, order_items(*)").eq("id", id).single();
    if (!order || !order.user_id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.payment_reference || !["paid", "partially_refunded"].includes(order.payment_status)) return NextResponse.json({ error: "Order is not refundable" }, { status: 400 });
    const paidProducts = Math.max(0, Number(order.total_amount) - Number(order.delivery_fee || 0));
    if (productAmount > Number(order.subtotal) || amount > paidProducts) return NextResponse.json({ error: "Refund exceeds order amount" }, { status: 400 });

    const stripe = new Stripe(key);
    let paymentIntent = order.payment_reference;
    if (!paymentIntent.startsWith("pi_")) {
      const session = await stripe.checkout.sessions.retrieve(paymentIntent);
      paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : "";
    }
    if (!paymentIntent.startsWith("pi_")) return NextResponse.json({ error: "Payment intent not found" }, { status: 400 });

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent,
      amount: Math.round(amount * 100),
      metadata: { order_id: id, product_amount: productAmount.toFixed(2), items: JSON.stringify(items) },
    });
    const refundStatus = refund.status === "succeeded" || refund.status === "failed" || refund.status === "canceled" ? refund.status : "pending";
    const { data: refundRow, error } = await supabase.from("order_refunds").insert({
      order_id: id, user_id: order.user_id, stripe_refund_id: refund.id, amount, product_amount: productAmount, items, status: refundStatus, created_by: (await supabase.auth.getUser()).data.user?.id,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ refund: refundRow }, { status: 201 });
  } catch (error) {
    console.error("Admin refund error", error);
    return NextResponse.json({ error: "Unable to create refund" }, { status: 500 });
  }
}
