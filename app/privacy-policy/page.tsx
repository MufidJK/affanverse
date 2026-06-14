import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Affanverse",
  description: "Kebijakan privasi resmi untuk ekosistem Affanverse.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-3xl mx-auto py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">
          PRIVACY <span className="text-[#2398f7]">POLICY</span>
        </h1>
        
        <div className="space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID')}
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">1. Pendahuluan</h2>
            <p>
              Selamat datang di arsip resmi The Apex Predator. Kehadiran Anda di dalam ekosistem digital ini tunduk pada kebijakan privasi yang ketat. Kami sangat menghargai anomali privasi Anda dan berkomitmen untuk melindunginya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">2. Pengumpulan Data Minimal</h2>
            <p>
              Affanverse beroperasi di bawah prinsip pengumpulan data yang absolut minimal. Sistem kami hanya merekam interaksi krusial seperti:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Log percakapan dengan entitas Affan AI Chat untuk memastikan memori sistem tetap tajam.</li>
              <li>Pencapaian skor tertinggi dan status (high scores) di The Abyss Runner dan minigame lainnya.</li>
              <li>Data preferensi antarmuka pengguna (UI/UX).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">3. Tujuan Penggunaan Data</h2>
            <p>
              Setiap bit data yang ditangkap secara eksklusif digunakan untuk satu tujuan utama: <strong>Meningkatkan Pengalaman Pengguna (User Experience)</strong>. Log percakapan AI digunakan untuk melatih sinkronisasi realitas yang lebih baik, sedangkan skor minigame digunakan untuk menegakkan hierarki digital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">4. Tidak Ada Penjualan Data</h2>
            <p>
              Sebagai entitas independen, Affanverse tidak tunduk pada korporasi eksternal. <strong>Data Anda tidak akan pernah dijual, disewakan, atau didistribusikan kepada pihak ketiga.</strong> Ekosistem ini berdiri di atas prinsip integritas absolut.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">5. Keamanan Ruang Digital</h2>
            <p>
              Seluruh data dienkripsi dan diamankan di dalam vault digital kami. Walaupun eksplorasi di abyss mengandung risiko kekacauan visual (glitch), informasi pribadi Anda tetap terkunci dengan aman dari peretasan dimensi lain.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
