import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function respond(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(request: NextRequest) {
  try {
    // Use the caller's cookies and RLS, never the service-role client.
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return respond({ error: "Unauthorized" }, 401);

    const ids = request.nextUrl.searchParams.getAll("session_id");
    const sessionId = ids[0];
    if (ids.length !== 1 || !sessionId || sessionId.length > 255 || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
      return respond({ error: "Invalid checkout session" }, 400);
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return respond({ error: "Payment status unavailable" }, 503);
    let session: Stripe.Checkout.Session;
    try {
      session = await new Stripe(key).checkout.sessions.retrieve(sessionId);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing") {
        return respond({ error: "Checkout session not found" }, 404);
      }
      return respond({ error: "Payment status unavailable" }, 502);
    }

    const orderId = session.metadata?.order_id;
    if (session.id !== sessionId || session.mode !== "payment" || session.metadata?.user_id !== user.id
      || !orderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return respond({ error: "Checkout session not found" }, 404);
    }

    const { data: order, error } = await supabase.from("orders")
      .select("id, user_id, payment_status, payment_reference")
      .eq("id", orderId).eq("user_id", user.id).maybeSingle();
    if (error) return respond({ error: "Payment status unavailable" }, 500);
    const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!order || order.user_id !== user.id || order.id !== orderId
      || (order.payment_reference && order.payment_reference !== sessionId && order.payment_reference !== intentId)) {
      return respond({ error: "Checkout session not found" }, 404);
    }

    // Stripe success alone is insufficient: only the webhook confirms local payment.
    return respond({ order_id: order.id, payment_status: order.payment_status });
  } catch {
    return respond({ error: "Payment status unavailable" }, 500);
  }
}
