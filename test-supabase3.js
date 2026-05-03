import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('novel_chapters').select('volume, coverl_url');
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  // Group by volume
  const volumes = new Map();
  data.forEach(ch => {
    if (ch.volume && ch.coverl_url && !volumes.has(ch.volume)) {
      volumes.set(ch.volume, ch.coverl_url);
    }
  });
  console.log("Volumes:", Object.fromEntries(volumes));
}

run();
