import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import { validatePickupAt } from "@/lib/pickup-rules";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { pickup_at } = await request.json();
    const { data: closedDates, error: closuresError } = await supabase.rpc("get_pickup_closed_dates");
    if (closuresError) throw closuresError;
    if (!validatePickupAt(pickup_at, new Date(), (closedDates || []).map((row) => row.closed_on))) {
      return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
    }

    const { id } = await params;
    const { data, error } = await supabase
      .from("orders")
      .update({ pickup_at: new Date(pickup_at).toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23514") {
        return NextResponse.json({ error: "PICKUP_SLOT_UNAVAILABLE" }, { status: 400 });
      }
      throw error;
    }
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("[admin-pickup] Error:", error);
    return NextResponse.json({ error: "Failed to update pickup slot" }, { status: 500 });
  }
}
