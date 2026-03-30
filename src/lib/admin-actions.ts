"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Order, OrderStatus, Profile } from "@/types/database.types";

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

<<<<<<< HEAD
export async function getAdminUser(): Promise<AdminUser | null> {
=======
export async function getAdminUser(): Promise<{ user: User; profile: Profile } | null> {
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
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

<<<<<<< HEAD
  const profile = data as Profile | null;

  if (!profile || String(profile.role) !== "admin") {
=======
  const typedProfile = profile as Profile | null;

  if (!typedProfile || String(typedProfile.role) !== "admin") {
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
    return null;
  }

  return {
    user,
    profile: typedProfile,
  };
}

export type AdminUser = {
  user: User;
  profile: Profile;
};

export async function updateOrderStatus(orderId: string, status: string) {
  const admin = createAdminClient();
  const updateData: Partial<Order> = { status: status as OrderStatus };

<<<<<<< HEAD
  const { data, error } = await (admin.from("orders") as any)
    .update({ status })
=======
  const { data, error } = await admin
    .from("orders")
    .update(updateData)
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
    .eq("id", orderId)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
