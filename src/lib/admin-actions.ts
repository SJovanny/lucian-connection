"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

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

export type AdminUser = {
  user: User;
  profile: Profile;
};

export async function updateOrderStatus(orderId: string, status: string) {
  const admin = createAdminClient();

  const { data, error } = await (admin.from("orders") as any)
    .update({ status })
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
