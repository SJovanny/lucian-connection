/* eslint-disable @typescript-eslint/no-explicit-any */
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
      .order("pickup_at", { ascending: true, nullsFirst: false });

    if (ordersError) {
      throw ordersError;
    }

    const refundsByOrder = new Map<string, Array<{ id: string; order_id: string; status: string; items: unknown }>>();
    const orderIds = (orders || []).map((order) => order.id);
    if (orderIds.length > 0) {
      const { data: refunds, error: refundsError } = await supabase
        .from("order_refunds")
        .select("id, order_id, status, items")
        .in("order_id", orderIds);
      if (refundsError) throw refundsError;

      for (const refund of refunds || []) {
        const orderRefunds = refundsByOrder.get(refund.order_id) || [];
        orderRefunds.push(refund);
        refundsByOrder.set(refund.order_id, orderRefunds);
      }
    }

    const ordersWithRefunds = (orders || []).map((order) => ({
      ...order,
      order_refunds: refundsByOrder.get(order.id) || [],
    }));

    // Calculate status counts
    const statusCounts = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
    };

    ordersWithRefunds.forEach((order: any) => {
      statusCounts[order.status as keyof typeof statusCounts]++;
    });

    return NextResponse.json(
      {
        orders: ordersWithRefunds,
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
