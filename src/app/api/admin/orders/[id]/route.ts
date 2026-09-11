import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { apiRequestErrorResponse, readBoundedJson, safeLogError } from "@/lib/api-request";
import { z } from "zod";
import { OrderStatusUpdateError, updateOrderStatus } from "@/lib/orders/update-order-status";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await getStaffSupabase(request);
    if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await readBoundedJson(request, z.object({ status: z.string() }).strict());
    const order = await updateOrderStatus(supabase, id, status);
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    if (error instanceof OrderStatusUpdateError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    safeLogError("[orders-api] Error", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
