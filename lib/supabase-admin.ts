import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase Admin Client — GOD-MODE SINGLETON via globalThis.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix) to bypass RLS.
 * This module must ONLY be imported in server-side code:
 *   - API Routes (app/api/...)
 *   - Server Actions ('use server')
 *   - Server Components
 *
 * WHY SINGLETON: Same rationale as lib/supabase.ts — Turbopack HMR
 * re-evaluates modules, spawning zombie GoTrueClient timers that
 * hold closures and OOM the process. globalThis cache prevents this.
 *
 * SOP RULE 1: Database Singleton (RAM Saver)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase Admin environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

const globalForSupabaseAdmin = globalThis as unknown as {
  supabaseAdmin: ReturnType<typeof createClient<Database>> | undefined;
};

export const supabaseAdmin =
  globalForSupabaseAdmin.supabaseAdmin ??
  createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

// In development, cache on globalThis so HMR doesn't create new instances
if (process.env.NODE_ENV !== "production") {
  globalForSupabaseAdmin.supabaseAdmin = supabaseAdmin;
}
