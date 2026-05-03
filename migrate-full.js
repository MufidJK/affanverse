require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs');

// Konfigurasi Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Konfigurasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'affanverse-media';

async function runFullMigration() {
  console.log(`🚀 Mulai migrasi dari bucket: ${BUCKET_NAME}`);
  
  // 1. Ambil daftar semua file di bucket affanverse-media
  const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list();
  
  if (error) {
    console.error("❌ Gagal narik data dari Supabase:", error);
    return;
  }

  // Filter cuma file (ngilangin folder kosong kalo ada)
  const imageFiles = files.filter(f => f.id !== null && f.name !== '.emptyFolderPlaceholder');
  console.log(`📦 Ketemu ${imageFiles.length} gambar yang siap dieksekusi...`);

  const migrationResults = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    console.log(`\n⏳ [${i + 1}/${imageFiles.length}] Memproses: ${file.name}`);

    try {
      // 2. Dapatkan URL Public Supabase
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
      const supabaseUrl = publicUrlData.publicUrl;

      // 3. Download file ke Memory (Buffer)
      const response = await fetch(supabaseUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`   ⬇️ Ter-download. Ukuran asli: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

      // 4. Kompresi gambar pake Sharp (Ubah ke WebP biar super enteng)
      const compressedBuffer = await sharp(buffer)
        .webp({ quality: 80 }) // Kualitas 80% udah sangat bagus buat mata
        .toBuffer();

      console.log(`   🗜️ Ter-kompres. Ukuran baru: ${(compressedBuffer.length / 1024 / 1024).toFixed(2)} MB`);

      // 5. Upload Buffer yang udah dikompres ke Cloudinary
      // Pake Promise karena stream upload sifatnya event-based
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'affanverse-media' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(compressedBuffer);
      });

      console.log(`   ✅ Sukses pindah ke Cloudinary!`);
      
      // 6. Simpan hasil mapping buat update database nanti
      migrationResults.push({
        fileName: file.name,
        oldSupabaseUrl: supabaseUrl,
        newCloudinaryUrl: uploadResult.secure_url
      });

    } catch (err) {
      console.error(`   ❌ Gagal memproses ${file.name}:`, err.message);
    }
  }

  // 7. Tulis log hasil migrasi ke file JSON
  fs.writeFileSync('migration-result.json', JSON.stringify(migrationResults, null, 2));
  console.log(`\n🎉 MIGRARSI SELESAI! Cek file 'migration-result.json' buat liat daftar URL barunya.`);
}

runFullMigration();