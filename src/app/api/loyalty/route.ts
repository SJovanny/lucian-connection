import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile, error: profileError }, { data: ledger, error: ledgerError }, { data: rewards, error: rewardsError }, { data: redemptions, error: redemptionsError }, { data: refunds, error: refundsError }] = await Promise.all([
    supabase.from("profiles").select("loyalty_points_balance").eq("id", user.id).single(),
    supabase.from("loyalty_ledger").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("loyalty_rewards").select("*").eq("is_active", true).order("points_cost", { ascending: true }),
    supabase.from("loyalty_redemptions").select("*, loyalty_rewards(*), coupons(*)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("order_refunds").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);

  const orderIds = (ledger || []).map((entry) => entry.order_id).filter((id): id is string => Boolean(id));
  const { data: payments, error: paymentsError } = orderIds.length
    ? await supabase.from("orders").select("id, subtotal, total_amount, created_at, payment_status").in("id", orderIds)
    : { data: [], error: null };
  if (profileError || ledgerError || rewardsError || redemptionsError || refundsError || paymentsError) {
    console.error("Loyalty data error", { profileError, ledgerError, rewardsError, redemptionsError, refundsError, paymentsError });
    return NextResponse.json({ error: "Unable to load loyalty data" }, { status: 500 });
  }
  return NextResponse.json({ balance: profile.loyalty_points_balance, ledger: ledger || [], rewards: rewards || [], redemptions: redemptions || [], refunds: refunds || [], payments: payments || [] });
}
