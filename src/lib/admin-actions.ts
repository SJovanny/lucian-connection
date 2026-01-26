"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminUser() {
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

  if (!profile || String(profile.role) !== "admin") {
    return null;
  }

  return {
    user,
    profile,
  };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
