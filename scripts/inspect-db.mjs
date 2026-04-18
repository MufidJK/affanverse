/**
 * Inspect the gallery table — fetch all rows & print all column names + values.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
const supabase = createClient(url, key);

console.log("=== Fetching ALL rows from 'gallery' ===\n");
const { data, error } = await supabase.from("gallery").select("*");

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

if (!data || data.length === 0) {
  console.log("Table is empty.");
  
  // Try listing other tables via stories / memories
  for (const t of ["stories", "memories"]) {
    const r = await supabase.from(t).select("*").limit(1);
    if (!r.error && r.data && r.data.length > 0) {
      console.log(`\n=== Found data in '${t}' ===`);
      console.log("Columns:", Object.keys(r.data[0]));
      console.log(JSON.stringify(r.data, null, 2));
    }
  }
} else {
  console.log(`Found ${data.length} rows.`);
  console.log("Columns:", Object.keys(data[0]));
  console.log("\n=== All rows ===");
  console.log(JSON.stringify(data, null, 2));
}

// Also check storage buckets
console.log("\n=== Listing storage buckets ===");
const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
if (bErr) {
  console.log("Storage error:", bErr.message);
} else {
  console.log("Buckets:", buckets.map(b => b.name));
}
