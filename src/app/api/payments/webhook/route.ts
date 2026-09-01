import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (orderId && event.type === "checkout.session.completed") {
    const supabase = createAdminClient();
    await supabase.from("orders").update({
      status: "confirmed", payment_status: "paid", paid_at: new Date().toISOString(),
      payment_reference: session.payment_intent?.toString() || session.id,
    }).eq("id", orderId);
  }
  if (orderId && (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed")) {
    await createAdminClient().from("orders").update({ payment_status: "cancelled" }).eq("id", orderId);
  }
  return NextResponse.json({ received: true });
}
