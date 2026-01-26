import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const { status } = await request.json();

    const adminClient = createAdminClient();

    // Validate status
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { data, error } = await (adminClient as any)
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[orders-api] Update error:", error);
      throw error;
    }

    return NextResponse.json({ order: data }, { status: 200 });
  } catch (error: any) {
    console.error("[orders-api] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update order",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
