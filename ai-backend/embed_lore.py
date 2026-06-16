import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

# ==========================================
# 1. SETUP KONEKSI
# ==========================================
# Muat environment variable dari .env.local di folder root
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Inisialisasi client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
ai_client = genai.Client(api_key=GEMINI_API_KEY)

def generate_embedding(text: str):
    """Fungsi buat ngubah teks jadi vector angka pake Gemini"""
    result = ai_client.models.embed_content(
        model="gemini-embedding-2", # Pake model terbaru anti 404
        contents=text,
        config={"output_dimensionality": 768} # WAJIB 768 biar muat di database lu
    )
    return result.embeddings[0].values

def process_table(table_name: str):
    print(f"\n--- Memproses tabel: {table_name} ---")
    
    # 2. TARIK DATA YANG EMBEDDING-NYA MASIH KOSONG
    # Kita cuma narik data yang kolom 'embedding'-nya null biar gak ngulang-ngulang
    response = supabase.table(table_name).select("id, content").is_("embedding", "null").execute()
    chapters = response.data
    
    if not chapters:
        print(f"Mantap coeg! Semua baris di '{table_name}' udah punya embedding.")
        return

    print(f"Ditemukan {len(chapters)} baris yang belum di-embed di '{table_name}'. Gas proses!")

    # 3. LOOPING & UPDATE DATABASE
    for chapter in chapters:
        try:
            teks_novel = chapter['content']
            
            # Ubah teks jadi vector
            vector_angka = generate_embedding(teks_novel)
            
            # Update baris di database pake vector yang udah jadi
            supabase.table(table_name).update({"embedding": vector_angka}).eq("id", chapter["id"]).execute()
            
            print(f"✅ Sukses embed chapter ID: {chapter['id']}")
            
            # Kasih jeda 4 detik biar gak kena tilang limit API gratisan
            time.sleep(4) 
            
        except Exception as e:
            print(f"❌ Waduh error pas proses chapter ID {chapter['id']}: {e}")
            
            # Kalo gagal (misal kena limit lagi), jedain agak lamaan dikit biar API-nya napas
            time.sleep(10)

if __name__ == "__main__":
    # Eksekusi buat kedua tabel lu
    process_table("novel_chapters")
    process_table("ambasuke_chapters")
    
    print("\nProses embedding kelar ngab! Database lu sekarang udah pinter.")