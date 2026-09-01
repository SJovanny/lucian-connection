import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getAdminSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from("pickup_closures").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete closure" }, { status: 500 });
  return NextResponse.json({ success: true });
}
