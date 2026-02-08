import { createClient } from "@/lib/supabase/server";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

/**
 * Create a Supabase client from API route request cookies.
 * Uses the anon key so that RLS policies are enforced.
 */
function createClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

/**
 * Check if the current user is an admin.
 * For server components (no request), uses server cookies.
 */
export async function checkAdmin(request?: NextRequest) {
  const supabase = request
    ? createClientFromRequest(request)
    : await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = data as { role: string } | null;
  return String(profile?.role) === "admin";
}

/**
 * For API routes: verify admin AND return the authenticated Supabase client.
 * Returns the same client used for auth checking, so a single JWT session
 * is used — no duplicate token refresh issues.
 * The returned client uses the anon key, so all DB operations are subject to RLS.
 */
export async function getAdminSupabase(request: NextRequest) {
  const supabase = createClientFromRequest(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const profile = data as { role: string } | null;
  if (String(profile?.role) !== "admin") return null;

  return supabase;
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
