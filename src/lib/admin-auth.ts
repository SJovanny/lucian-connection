import { createClient } from "@/lib/supabase/server";

export async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  // Type assertion to bypass potential "never" inference issues
  // This happens sometimes when the specific select string inference fails
  const profile = data as { role: string } | null;

  return String(profile?.role) === "admin";
}

export async function verifyAdminAuth() {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return {
      isValid: false,
      status: 401,
      error: "Unauthorized",
    } as const;
  }

  return {
    isValid: true,
    status: 200,
    error: null,
  } as const;
}
