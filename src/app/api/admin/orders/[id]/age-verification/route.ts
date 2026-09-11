import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { uuidSchema } from "@/lib/api-schemas";
import { safeLogError } from "@/lib/api-request";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getStaffSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
    }
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, payment_status, contains_alcohol")
      .eq("id", id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.contains_alcohol) {
      return NextResponse.json({ verified: false, message: "Age verification is not required" });
    }

    if (!["paid", "partially_refunded"].includes(order.payment_status)) {
      return NextResponse.json({ error: "Order must be paid before pickup" }, { status: 409 });
    }

    if (["cancelled", "refunded"].includes(order.status)) {
      return NextResponse.json({ error: "This order cannot be picked up" }, { status: 409 });
    }

    if (order.status !== "ready") {
      return NextResponse.json({ error: "Order must be ready for pickup" }, { status: 409 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        pickup_age_verified_at: new Date().toISOString(),
        pickup_age_verified_by: user?.id || null,
      })
      .eq("id", id)
      .select("id, pickup_age_verified_at, pickup_age_verified_by")
      .single();

    if (updateError) throw updateError;
    await recordAudit(supabase, {
      action: "order.age_verified",
      entityType: "order",
      entityId: id,
      summary: "Vérification d'âge effectuée au retrait",
    });
    return NextResponse.json({ order: updatedOrder, verified: true });
  } catch (error) {
    safeLogError("[age-verification] Error", error);
    return NextResponse.json({ error: "Unable to verify pickup age" }, { status: 500 });
  }
}
