import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncStripeRefund } from "@/lib/stripe-refunds";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const rpcClient = supabase as unknown as {
      rpc: (functionName: string, args: { p_max_age: string }) => Promise<{
        data: number | null;
        error: Error | null;
      }>;
    };
    const { data, error } = await rpcClient.rpc("cancel_abandoned_orders", {
      p_max_age: "24 hours",
    });
    if (error) throw error;

    let synchronized = 0;
    const refundFailures: string[] = [];
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      const recentRefundCutoff = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      const [
        { data: pendingRefunds, error: pendingRefundsError },
        { data: unsyncedRefunds, error: unsyncedRefundsError },
        { data: recentRefunds, error: recentRefundsError },
      ] = await Promise.all([
        supabase
          .from("order_refunds")
          .select("id, stripe_refund_id")
          .eq("status", "pending")
          .not("stripe_refund_id", "is", null)
          .order("created_at", { ascending: true })
          .limit(100),
        supabase
          .from("order_refunds")
          .select("id, stripe_refund_id")
          .eq("status", "succeeded")
          .is("last_stripe_sync_at", null)
          .not("stripe_refund_id", "is", null)
          .order("created_at", { ascending: true })
          .limit(100),
        supabase
          .from("order_refunds")
          .select("id, stripe_refund_id")
          .eq("status", "succeeded")
          .gte("created_at", recentRefundCutoff)
          .not("stripe_refund_id", "is", null)
          .order("created_at", { ascending: true })
          .limit(100),
      ]);
      if (pendingRefundsError || unsyncedRefundsError || recentRefundsError) {
        throw pendingRefundsError || unsyncedRefundsError || recentRefundsError;
      }

      const refunds = [...(pendingRefunds || []), ...(unsyncedRefunds || []), ...(recentRefunds || [])].filter(
        (refund, index, rows) => rows.findIndex((row) => row.id === refund.id) === index
      );
      const stripe = new Stripe(key);
      for (const refund of refunds) {
        if (!refund.stripe_refund_id) continue;
        try {
          await syncStripeRefund({
            supabase,
            stripe,
            stripeRefundId: refund.stripe_refund_id,
            localRefundId: refund.id,
          });
          synchronized += 1;
        } catch (syncError) {
          console.error(`Refund synchronization failed for ${refund.id}`, syncError);
          refundFailures.push(refund.id);
        }
      }
    }

    return NextResponse.json({
      cancelled: data ?? 0,
      synchronized,
      refundFailures,
      refundSynchronizationSkipped: !key,
    });
  } catch (error) {
    console.error("Abandoned order cleanup failed", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

export const GET = POST;
