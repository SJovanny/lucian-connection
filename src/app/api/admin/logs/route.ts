import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import type { AuditEntityType } from "@/types/database.types";

const ENTITY_TYPES: AuditEntityType[] = [
  "product",
  "category",
  "coupon",
  "reduction",
  "order",
  "store_settings",
  "pickup_opening_hours",
  "pickup_closure",
  "loyalty_reward",
  "user",
  "auth",
];

// GET - Liste paginée et filtrable du journal d'activité (admins uniquement)
export async function GET(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 25));
  const actorId = searchParams.get("actorId");
  const entityTypeParam = searchParams.get("entityType");
  const entityType = ENTITY_TYPES.includes(entityTypeParam as AuditEntityType)
    ? (entityTypeParam as AuditEntityType)
    : null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (actorId) query = query.eq("actor_id", actorId);
    if (entityType) query = query.eq("entity_type", entityType);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const start = (page - 1) * pageSize;
    const { data, error, count } = await query.range(start, start + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({ logs: data ?? [], total: count ?? 0, page, pageSize });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
