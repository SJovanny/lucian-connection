import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, Profile } from "@/types/database.types";
import { requireSupabaseConfig } from "@/lib/supabase/config";
import {
  hasRequiredStaffRole,
  type RequiredStaffRole,
} from "@/lib/admin-policy";

/**
 * Create a Supabase client from API route request cookies.
 * Uses the anon key so that RLS policies are enforced.
 */
function createClientFromRequest(request: NextRequest) {
  const { url, key } = requireSupabaseConfig();
  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );
}

export type StaffUser = {
  user: User;
  profile: Profile;
};

async function authorize(
  supabase: SupabaseClient<Database>,
  requiredRole: RequiredStaffRole
): Promise<StaffUser | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();
  const profile = data as Profile | null;

  if (error || !profile || !hasRequiredStaffRole(profile.role, requiredRole)) {
    return null;
  }

  return { user: authData.user, profile };
}

export async function getStaffUser(): Promise<StaffUser | null> {
  const supabase = await createClient();
  return authorize(supabase, "staff");
}

export async function getAdminUser(): Promise<StaffUser | null> {
  const supabase = await createClient();
  return authorize(supabase, "admin");
}

export async function getStaffSupabase(request: NextRequest) {
  const supabase = createClientFromRequest(request);
  return await authorize(supabase, "staff") ? supabase : null;
}

export async function getAdminSupabase(request: NextRequest) {
  const supabase = createClientFromRequest(request);
  return await authorize(supabase, "admin") ? supabase : null;
}
