import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
