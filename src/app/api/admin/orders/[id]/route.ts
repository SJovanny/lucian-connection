import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { safeLogError } from "@/lib/api-request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (["preparing", "ready", "completed"].includes(status)) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("payment_status, contains_alcohol, pickup_age_verified_at")
        .eq("id", id)
        .single();
      if (orderError) throw orderError;
      if (!["paid", "partially_refunded"].includes(order.payment_status)) {
        return NextResponse.json(
          { error: "Order must be paid before entering preparation" },
          { status: 409 }
        );
      }
      if (status === "completed" && order.contains_alcohol && !order.pickup_age_verified_at) {
        return NextResponse.json(
          { error: "PICKUP_AGE_REQUIRED" },
          { status: 409 }
        );
      }
    }

    const { data: previousOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      safeLogError("[orders-api] Update error", error);
      throw error;
    }

    await recordAudit(supabase, {
      action: "order.status_changed",
      entityType: "order",
      entityId: id,
      summary: `Statut de commande modifié : ${previousOrder?.status ?? "?"} → ${status}`,
      changes: [{ field: "status", old: previousOrder?.status ?? null, new: status }],
    });

    return NextResponse.json({ order: data }, { status: 200 });
  } catch (error) {
    safeLogError("[orders-api] Error", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
