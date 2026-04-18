/**
 * Quick verification script — fetches 1 row from the `gallery` table
 * to confirm the Supabase connection is working.
 *
 * Run:  node scripts/verify-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// --- Load .env.local manually (no dotenv dependency needed) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");

const env = {};
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  env[key.trim()] = rest.join("=").trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

// --- Create client & query ---
const supabase = createClient(url, key);

console.log("🔗 Connecting to Supabase...");
console.log(`   URL : ${url}`);
console.log();

const { data, error } = await supabase.from("gallery").select("*").limit(1);

if (error) {
  console.error("❌ Query failed:", error.message);
  process.exit(1);
}

console.log("✅ Connection successful!");
console.log();

if (data.length === 0) {
  console.log("ℹ️  Table 'gallery' is empty (0 rows). Connection is working, but no data to show yet.");
} else {
  console.log("📦 Sample row from 'gallery':");
  console.log(JSON.stringify(data[0], null, 2));
}
