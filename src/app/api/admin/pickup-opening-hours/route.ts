import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";
import { openingHoursUpdateSchema } from "@/lib/api-schemas";
import {
  ApiRequestError,
  apiRequestErrorResponse,
  readBoundedJson,
  safeLogError,
} from "@/lib/api-request";

export async function GET(request: NextRequest) {
  const supabase = await getStaffSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("pickup_opening_hours").select("*").order("weekday");
  if (error) return NextResponse.json({ error: "Failed to load opening hours" }, { status: 500 });
  return NextResponse.json({ openingHours: data || [] });
}

export async function PUT(request: NextRequest) {
  const supabase = await getStaffSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { openingHours: rows } = await readBoundedJson(request, openingHoursUpdateSchema);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("pickup_opening_hours")
      .upsert(rows.map((row: { weekday: number; is_open: boolean; start_time: string | null; end_time: string | null }) => ({ ...row, updated_by: userData.user?.id || null })), { onConflict: "weekday" })
      .select("*")
      .order("weekday");
    if (error) throw error;
    await recordAudit(supabase, {
      action: "pickup_opening_hours.updated",
      entityType: "pickup_opening_hours",
      summary: "Horaires de retrait modifiés",
      metadata: { openingHours: data },
    });
    return NextResponse.json({ openingHours: data || [] });
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === "INVALID_REQUEST") {
      return NextResponse.json({ error: "INVALID_OPENING_HOURS" }, { status: 400 });
    }
    const requestError = apiRequestErrorResponse(error);
    if (requestError) return requestError;
    safeLogError("[pickup-opening-hours] Error", error);
    return NextResponse.json({ error: "Failed to save opening hours" }, { status: 500 });
  }
}
