import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPickupAvailability } from "@/lib/pickup-rules";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const [{ data, error }, { data: openingHours, error: openingHoursError }] = await Promise.all([
    supabase.rpc("get_pickup_closed_dates"),
    supabase.from("pickup_opening_hours").select("weekday, is_open, start_time, end_time"),
  ]);

  if (error || openingHoursError) {
    console.error("[pickup-availability] Failed to load closures:", error);
    return NextResponse.json({ error: "Pickup availability is unavailable" }, { status: 503 });
  }

  const response = NextResponse.json({
    timeZone: "America/Martinique",
    generatedAt: new Date().toISOString(),
    days: getPickupAvailability(new Date(), (data || []).map((row) => row.closed_on), openingHours || undefined),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
