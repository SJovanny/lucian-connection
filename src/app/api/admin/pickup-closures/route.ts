import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import { isValidClosureDate, localPickupToDate } from "@/lib/pickup-rules";
import type { OrderStatus } from "@/types/database.types";

const blockedStatuses: OrderStatus[] = ["pending", "preparing", "ready"];

export async function GET(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("pickup_closures").select("*").order("closed_on");
  if (error) return NextResponse.json({ error: "Failed to load closures" }, { status: 500 });
  return NextResponse.json({ closures: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { closed_on, reason } = await request.json();
    if (!isValidClosureDate(closed_on)) {
      return NextResponse.json({ error: "INVALID_CLOSURE_DATE" }, { status: 400 });
    }

    const start = localPickupToDate(closed_on, 0).toISOString();
    const end = localPickupToDate(
      new Date(`${closed_on}T12:00:00Z`).toISOString().slice(0, 10),
      24 * 60
    ).toISOString();
    const { count, error: ordersError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", blockedStatuses)
      .gte("pickup_at", start)
      .lt("pickup_at", end);
    if (ordersError) throw ordersError;
    if ((count || 0) > 0) {
      return NextResponse.json({ error: "CLOSURE_HAS_SCHEDULED_ORDERS" }, { status: 409 });
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("pickup_closures")
      .insert({ closed_on, reason: typeof reason === "string" ? reason.trim() || null : null, created_by: userData.user?.id || null })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "CLOSURE_ALREADY_EXISTS" }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ closure: data }, { status: 201 });
  } catch (error) {
    console.error("[pickup-closures] Error:", error);
    return NextResponse.json({ error: "Failed to create closure" }, { status: 500 });
  }
}
