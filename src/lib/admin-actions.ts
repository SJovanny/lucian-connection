"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Order, OrderStatus, Profile } from "@/types/database.types";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminUser(): Promise<{ user: User; profile: Profile } | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;

  if (!typedProfile || String(typedProfile.role) !== "admin") {
    return null;
  }

  return {
    user,
    profile: typedProfile,
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const admin = createAdminClient();
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
