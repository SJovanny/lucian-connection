import { createBrowserClient } from "@supabase/ssr";
<<<<<<< HEAD
=======
import type { SupabaseClient } from "@supabase/supabase-js";
>>>>>>> 8fe42b97f85853eb971c445806efb905789fcda1
import type { Database } from "@/types/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
