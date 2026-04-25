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
 * Supabase client — SINGLETON via globalThis.
 *
 * WHY: Each `createClient()` call spawns a GoTrueClient with internal
 * `setInterval` timers for token auto-refresh. In dev mode, Turbopack HMR
 * re-evaluates modules, creating NEW client instances without cleaning up
 * the old ones. The zombie timers hold closure references, preventing GC,
 * and the heap grows until Node.js OOMs.
 *
 * FIX: Cache the client on `globalThis` so HMR reuses the same instance.
 * Also disable auth features we don't need (this app only does public reads).
 */
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<Database>> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,     // No session to persist on server
      autoRefreshToken: false,   // Kill the background setInterval timer
      detectSessionInUrl: false, // Not using OAuth redirects
    },
  });

// In development, cache on globalThis so HMR doesn't create new instances
if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
