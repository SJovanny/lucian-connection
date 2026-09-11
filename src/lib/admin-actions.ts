"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/types/database.types";
import { recordAudit } from "@/lib/audit";
import { getStaffUser } from "@/lib/admin-auth";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!await getStaffUser()) throw new Error("Unauthorized");
  const admin = await createClient();
  if (["preparing", "ready", "completed"].includes(status)) {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("payment_status, contains_alcohol, pickup_age_verified_at")
      .eq("id", orderId)
      .single();
    if (orderError) throw orderError;
    if (!["paid", "partially_refunded"].includes(order.payment_status)) {
      throw new Error("Order must be paid before entering preparation");
    }
    if (status === "completed" && order.contains_alcohol && !order.pickup_age_verified_at) {
      throw new Error("Pickup age verification is required");
    }
  }
  const { data: previousOrder } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const updateData: Partial<Order> = { status: status as OrderStatus };

  const { data, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  await recordAudit(admin, {
    action: "order.status_changed",
    entityType: "order",
    entityId: orderId,
    summary: `Statut de commande modifié : ${previousOrder?.status ?? "?"} → ${status}`,
    changes: [{ field: "status", old: previousOrder?.status ?? null, new: status }],
  });

  return data;
}
