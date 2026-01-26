import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // Fetch all orders with related data
    const { data: orders, error: ordersError } = await (adminClient as any)
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
