import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

/**
 * Supabase client instance.
 *
 * This is a singleton client that can be imported from any page or component.
 * It uses the public anon key, so it's safe to use in both server and client
 * components for read operations that respect RLS policies.
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase";
 *   const { data } = await supabase.from("gallery").select("*");
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
