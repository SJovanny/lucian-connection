import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";
import { auditLogQuerySchema } from "@/lib/api-schemas";
import { safeLogError } from "@/lib/api-request";

// GET - Liste paginée et filtrable du journal d'activité (admins uniquement)
export async function GET(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedQuery = auditLogQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "INVALID_QUERY" }, { status: 400 });
  }
  const { page, pageSize, actorId, entityType, from, to } = parsedQuery.data;

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
    safeLogError("Error fetching audit logs", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
