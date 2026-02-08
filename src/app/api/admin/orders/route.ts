import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await getAdminSupabase(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all orders with related data
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        profiles:user_id (full_name, phone)
      `
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // Calculate status counts
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    orders?.forEach((order: any) => {
      statusCounts[order.status as keyof typeof statusCounts]++;
    });

    return NextResponse.json(
      {
        orders: orders || [],
        statusCounts,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[orders-api] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
