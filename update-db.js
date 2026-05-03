require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Pake Service Role Key biar bebas nge-update tanpa kehambat RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 👇 PENTING: LU WAJIB GANTI DUA BARIS INI 👇
const NAMA_TABEL = 'gallery'; // Ganti sama nama tabel lu (misal: 'articles', 'gallery', atau 'novel_chapters')
const NAMA_KOLOM = 'media_url'; // Ganti sama nama kolom yang nyimpen link gambarnya (misal: 'cover', 'thumbnail', 'url')

async function updateDatabase() {
  console.log(`🔄 Memulai proses update ke tabel: ${NAMA_TABEL}...`);

  try {
    // 1. Baca isi kamus JSON kita
    const rawData = fs.readFileSync('migration-result.json', 'utf8');
    const dataMigrasi = JSON.parse(rawData);

    let sukses = 0;
    let gagal = 0;

    // 2. Looping ganti URL satu per satu
    for (let i = 0; i < dataMigrasi.length; i++) {
      const { oldSupabaseUrl, newCloudinaryUrl, fileName } = dataMigrasi[i];

      // Perintah sakti buat ngubah isi database
      const { data, error } = await supabase
        .from(NAMA_TABEL)
        .update({ [NAMA_KOLOM]: newCloudinaryUrl })
        .eq(NAMA_KOLOM, oldSupabaseUrl)
        .select(); // Tambahin select() biar kita tau beneran ada yang ke-update atau nggak

      if (error) {
        console.error(`❌ Error pas update ${fileName}:`, error.message);
        gagal++;
      } else if (data && data.length > 0) {
        console.log(`✅ [${i + 1}/${dataMigrasi.length}] Sukses update: ${fileName}`);
        sukses++;
      } else {
        // Kalau masuk sini, berarti script gak nemu URL lama itu di tabel lu
        console.log(`⚠️ [${i + 1}/${dataMigrasi.length}] Di-skip: URL ${fileName} gak ditemuin di tabel.`);
      }
    }

    console.log(`\n🎉 PROSES BERES!`);
    console.log(`✅ Berhasil ke-update: ${sukses} baris`);
    console.log(`⚠️ Di-skip / Gagal: ${dataMigrasi.length - sukses} baris`);
    console.log(`(Note: Kalau banyak yang di-skip, artinya foto itu emang gak kepake/gak ada di tabel '${NAMA_TABEL}')`);

  } catch (err) {
    console.error("Wah ada error pas baca file JSON:", err);
  }
}

updateDatabase();