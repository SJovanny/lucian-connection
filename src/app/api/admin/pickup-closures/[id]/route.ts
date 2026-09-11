import { NextRequest, NextResponse } from "next/server";
import { getStaffSupabase } from "@/lib/admin-auth";
import { recordAudit } from "@/lib/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getStaffSupabase(request);
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data: existingClosure } = await supabase.from("pickup_closures").select("closed_on").eq("id", id).single();
  const { error } = await supabase.from("pickup_closures").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to delete closure" }, { status: 500 });
  await recordAudit(supabase, {
    action: "pickup_closure.deleted",
    entityType: "pickup_closure",
    entityId: id,
    summary: `Fermeture supprimée : ${existingClosure?.closed_on ?? id}`,
  });
  return NextResponse.json({ success: true });
}
