require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const fs = require('fs');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET_NAME = 'affanverse-media';

async function runSusulan() {
  console.log(`🚀 Cek file yang nyangkut di bucket: ${BUCKET_NAME}`);
  
  // 1. Buka paksa limit jadi 1000 file!
  const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list('', {
    limit: 1000,
    offset: 0
  });
  
  if (error) {
    console.error("❌ Gagal narik data dari Supabase:", error);
    return;
  }

  const allImages = files.filter(f => f.id !== null && f.name !== '.emptyFolderPlaceholder');
  console.log(`📂 Total file fisik di Supabase: ${allImages.length}`);

  // 2. Baca JSON yang udah sukses lu kumpulin
  let dataLama = [];
  try {
    dataLama = JSON.parse(fs.readFileSync('migration-result.json', 'utf8'));
  } catch(e) {
    console.error("❌ File migration-result.json gak ketemu!");
    return;
  }

  const namaYangUdahSukses = dataLama.map(item => item.fileName);

  // 3. Filter cuma file yang BELOM ADA di JSON
  const sisaFiles = allImages.filter(f => !namaYangUdahSukses.includes(f.name));
  
  if (sisaFiles.length === 0) {
    console.log("✅ Mantap! Gak ada file yang nyangkut, semua udah di JSON.");
    return;
  }

  console.log(`⚠️ KETEMU! Ada ${sisaFiles.length} file yang ketinggalan. Eksekusi sekarang...\n`);

  for (let i = 0; i < sisaFiles.length; i++) {
    const file = sisaFiles[i];
    console.log(`⏳ [${i + 1}/${sisaFiles.length}] Memproses: ${file.name}`);

    try {
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);
      const supabaseUrl = publicUrlData.publicUrl;

      const response = await fetch(supabaseUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Kompres biar aman di bawah 10MB
      const compressedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

      // Upload ke Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'affanverse-media' },
          (error, result) => { if (error) reject(error); else resolve(result); }
        );
        uploadStream.end(compressedBuffer);
      });

      console.log(`   ✅ Sukses upload susulan!`);
      
      // Tambahin ke data array lu
      dataLama.push({
        fileName: file.name,
        oldSupabaseUrl: supabaseUrl,
        newCloudinaryUrl: uploadResult.secure_url
      });

    } catch (err) {
      console.error(`   ❌ Gagal memproses ${file.name}:`, err.message);
    }
  }

  // 4. Timpa file JSON lu biar isinya genap 100%
  fs.writeFileSync('migration-result.json', JSON.stringify(dataLama, null, 2));
  console.log(`\n🎉 PROSES SUSULAN BERES! Buku catatan lu udah update.`);
}

runSusulan();