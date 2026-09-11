"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStaffSupabase } from "@/lib/admin-auth";
import { updateOrderStatus as updateOrderStatusService } from "@/lib/orders/update-order-status";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await getStaffSupabase();
  if (!supabase) throw new Error("Unauthorized");
  const order = await updateOrderStatusService(supabase, orderId, status);
  return { id: order.id, status: order.status };
}
