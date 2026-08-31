import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { requireSupabaseAdminConfig } from "./config";

// Admin client with service role key - USE ONLY ON SERVER SIDE
export function createAdminClient(): SupabaseClient<Database> {
  const { url, key } = requireSupabaseAdminConfig();

  return createClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
