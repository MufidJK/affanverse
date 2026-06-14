import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Chaos | Affanverse",
  description: "Syarat dan ketentuan eksplorasi dalam ekosistem digital Affanverse.",
};

export default function TermsOfChaosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-3xl mx-auto py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white tracking-tight">
          TERMS OF <span className="text-[#2398f7]">CHAOS</span>
        </h1>
        
        <div className="space-y-8 text-gray-800 dark:text-gray-200 leading-relaxed">
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium border-l-4 border-[#2398f7] pl-4">
            PERINGATAN SISTEM: Memasuki domain ini berarti Anda menerima seluruh konsekuensi dari anomali digital.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">1. Deklarasi The Apex Predator</h2>
            <p>
              Dengan mengakses dan berinteraksi di dalam Affanverse, Anda secara sadar menempatkan diri di bawah yurisdiksi entitas The Apex Predator. Ekosistem ini dirancang bukan sekadar sebagai portofolio konvensional, melainkan sebuah arsip anomali digital yang tunduk pada aturan Sang Arsitek.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">2. Penerimaan Terhadap Kekacauan (Embrace the Glitch)</h2>
            <p>
              Pengunjung dilarang keras memprotes adanya distorsi visual, kebocoran memori (memory leaks yang disengaja), atau efek <em>jumpscare</em> terminal. Anda mengeksplorasi arsip ini dengan risiko yang ditanggung sendiri. Kewarasan (Sanity Level) Anda adalah tanggung jawab pribadi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">3. Interaksi AI dan Otoritas Terminal</h2>
            <p>
              Setiap percakapan dengan Affan AI atau penggunaan <em>Abyss Terminal</em> harus dilakukan tanpa niat peretasan destruktif. Pengguna diizinkan untuk menguji batasan sistem, tetapi segala bentuk injeksi kode berbahaya (malicious code injection) akan langsung dipotong oleh firewall protokol pertahanan kami keknya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">4. Hak Kekayaan Intelektual</h2>
            <p>
              Seluruh karya, mulai dari desain visual, minigame, "The Abyss Secret Terminal", sistem lore, hingga narasi "Ambasuke" dan "Affan: The Apex Predator", adalah hak cipta mutlak dari The Architect (Jeka/Mufid). Manipulasi, duplikasi, atau pencurian aset digital dari dimensi ini akan dilacak wkwk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#2398f7]">5. Disklaimer Realitas</h2>
            <p>
              Segala bentuk kejadian tidak terduga, sinkronisasi realitas yang terputus, atau efek samping pasca-eksplorasi (termasuk tapi tidak terbatas pada <em>existential dread</em>), bukan merupakan tanggung jawab Affanverse. Anda telah diperingatkan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
