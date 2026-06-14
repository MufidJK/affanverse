import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Protocol | Affanverse",
  description: "Protokol penggunaan cookies dan penyimpanan lokal Affanverse.",
};

export default function CookieProtocolPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-3xl mx-auto py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">
          COOKIE <span className="text-[#2398f7]">PROTOCOL</span>
        </h1>
        
        <div className="space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Sistem Inisialisasi: Melacak fragmen realitas Anda.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">1. Esensi Protokol Cookie</h2>
            <p>
              Berbeda dengan situs korporat yang memata-matai Anda dengan ratusan <em>tracker</em> pihak ketiga, protokol cookie kami dibangun murni untuk mempertahankan kestabilan dimensi Anda selama berada di dalam Affanverse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">2. Penggunaan Penyimpanan Lokal (Local Storage)</h2>
            <p>
              Kami menggunakan Cookies dan Local Storage di browser Anda sebagai jangkar (anchor) agar sinkronisasi realitas tetap stabil (Reality Sync: Stable). Data yang disimpan meliputi:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li><strong>Status Tema:</strong> Mengingat pilihan preferensi cahaya Anda (Light, Dark, atau mode Glitch/Abyss khusus).</li>
              <li><strong>Progress Log:</strong> Mengingat riwayat percakapan terminal sementara dan status masuk (guest/root) agar Anda tidak terlempar keluar dari dimensi secara tiba-tiba.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">3. Penolakan Pelacakan (Zero Tracking Policy)</h2>
            <p>
              Kami tidak menanamkan cookie pelacakan iklan (ad-trackers). Kami tidak tertarik dengan riwayat pencarian Anda di dimensi luar. Cookie kami sepenuhnya fungsional dan esensial.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">4. Kendali Pengguna</h2>
            <p>
              Anda memiliki otoritas penuh atas browser Anda. Jika Anda memilih untuk menghapus cache dan cookie, sistem akan melakukan <em>factory reset</em> pada pengalaman Anda. Memori AI akan dihapus, dan Anda harus menghadapi The Apex Predator dari titik awal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
