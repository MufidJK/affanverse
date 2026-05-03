require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cariDPO() {
  // 1. Ambil semua nama asli dari Supabase
  const { data: files } = await supabase.storage.from('affanverse-media').list();
  const namaDiSupabase = files
    .filter(f => f.id !== null && f.name !== '.emptyFolderPlaceholder')
    .map(f => f.name);

  // 2. Baca isi file JSON kita
  const hasilMigrasi = JSON.parse(fs.readFileSync('migration-result.json', 'utf8'));
  const namaDiJson = hasilMigrasi.map(item => item.fileName);

  // 3. Cari yang ada di Supabase tapi GAK ADA di JSON
  const buronan = namaDiSupabase.filter(nama => !namaDiJson.includes(nama));

  console.log(`\n🕵️ Ditemukan ${buronan.length} file yang belum masuk ke JSON:\n`);
  buronan.forEach((nama, index) => {
    console.log(`${index + 1}. ${nama}`);
  });
}

cariDPO();