import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("pickup_opening_hours").select("*").order("weekday");
  if (error) return NextResponse.json({ error: "Failed to load opening hours" }, { status: 500 });
  return NextResponse.json({ openingHours: data || [] });
}

export async function PUT(request: NextRequest) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!Array.isArray(body.openingHours) || body.openingHours.length !== 7) throw new Error("INVALID_OPENING_HOURS");

    const rows = body.openingHours.map((hours: Record<string, unknown>) => {
      const weekday = Number(hours.weekday);
      const isOpen = Boolean(hours.is_open);
      const startTime = typeof hours.start_time === "string" ? hours.start_time : null;
      const endTime = typeof hours.end_time === "string" ? hours.end_time : null;
      const validTime = (value: string | null) => value !== null && /^([01]\d|2[0-3]):[03]0$/.test(value);

      if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new Error("INVALID_OPENING_HOURS");
      if (isOpen && (!validTime(startTime) || !validTime(endTime) || startTime! >= endTime!)) {
        throw new Error("INVALID_OPENING_HOURS");
      }
      return { weekday, is_open: isOpen, start_time: isOpen ? startTime : null, end_time: isOpen ? endTime : null };
    });

    if (new Set(rows.map((row: { weekday: number }) => row.weekday)).size !== 7) throw new Error("INVALID_OPENING_HOURS");
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("pickup_opening_hours")
      .upsert(rows.map((row: { weekday: number; is_open: boolean; start_time: string | null; end_time: string | null }) => ({ ...row, updated_by: userData.user?.id || null })), { onConflict: "weekday" })
      .select("*")
      .order("weekday");
    if (error) throw error;
    return NextResponse.json({ openingHours: data || [] });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_OPENING_HOURS") {
      return NextResponse.json({ error: "INVALID_OPENING_HOURS" }, { status: 400 });
    }
    console.error("[pickup-opening-hours] Error:", error);
    return NextResponse.json({ error: "Failed to save opening hours" }, { status: 500 });
  }
}
