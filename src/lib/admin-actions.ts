"use server";

import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { Order, OrderStatus, Profile } from "@/types/database.types";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type AdminUser = {
  user: User;
  profile: Profile;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  if (!profile || String(profile.role) !== "admin") {
    return null;
  }

  return {
    user,
    profile,
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
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

  return data;
}
