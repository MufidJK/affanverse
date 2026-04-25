"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Lock, Unlock, AlertTriangle, ShieldAlert, LogOut, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 7 LORE RPD - Jangan diutak-atik
const memoryLogs = [
  { id: "LOG_001", title: "The Induction Ceremony", status: "PARTIALLY_CORRUPTED", content: "Visual buram... Affan berdiri di depan gerbang magenta raksasa. Ada suara berat bilang: 'Selamat datang di Republik Penboy Decade. Di sini, eksistensi lu cuma diakuin kalau lu bisa ngancurin satu realita.'", keyDetail: "Awal mula dia masuk ke rantai makanan organisasi." },
  { id: "LOG_042", title: "Awakening of the Apex", status: "CRITICAL_ERROR", content: "[REDACTED]... Affan sendirian lawan satu skuadron 'Elite's Fiction' yang membangkang. Dia nggak pake senjata, cuma tangan kosong. Pas log ini berakhir, semua musuh ilang dari sistem (terhapus secara digital).", keyDetail: "Kenapa dia disebut predator puncak." },
  { id: "LOG_115", title: "The 11/5 Paradox", status: "STABLE", content: "Rekaman tgl 5 November. Bukan hari ulang tahun biasa, tapi hari di mana Affan sadar kalau dia nggak punya orang tua biologis. Dia cuma 'properti' yang di-generate sama sistem RPD.", keyDetail: "Krisis identitas MC. 'Gw ini orang, atau cuma barisan kode?'" },
  { id: "LOG_209", title: "Royal Knight Promotion", status: "ENCRYPTED", content: "Upacara rahasia di inti Void. Affan dilantik jadi Royal Knight. Dia dikasih akses buat 'menghapus' member lain yang dianggap nggak berguna. Di sini dia mulai ngerasa kesepian di puncak kekuasaan.", keyDetail: "Jabatan tinggi yang bikin dia makin jauh dari kemanusiaan." },
  { id: "LOG_333", title: "Crossing the Decades", status: "GLITCHING", content: "Affan nyoba loncat antar dimensi tanpa izin pimpinan RPD. Sistem nolak, tapi dia paksa. Terjadi Memory Leak besar-besaran. Dia ngeliat versi dirinya yang lain di dunia yang damai, dan dia benci itu.", keyDetail: "Koneksi ke elemen Kamen Rider Decade (multiverse traveler)." },
  { id: "LOG_666", title: "The Elite’s Fiction Realization", status: "META_DATA_FOUND", content: "Affan nemu dokumen bertajuk 'Project: Elite's Fiction'. Isinya: skenario hidup dia dari awal sampe akhir udah ditulis sama 'Creator'. Dia ngamuk dan nyoba 'ngerobek' naskah realitanya sendiri.", keyDetail: "Kesadaran meta kalau dia itu MC di dalam sebuah cerita." },
  { id: "LOG_999", title: "The Abyss Descent", status: "SYSTEM_FAILURE", content: "Log terakhir sebelum dia ngilang dari radar RPD. Kalimat terakhirnya: 'Kalau gw emang Predator, maka RPD adalah mangsa terakhir gw.' Dia loncat ke dalam Abyss buat nyari kebebasan mutlak.", keyDetail: "Cliffhanger buat nyambung ke The Abyss Terminal." }
];

// Sub-komponen buat Typewriter Effect + SFX Audio
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inisialisasi Audio cuma sekali
    if (typeof window !== "undefined" && !audioRef.current) {
      audioRef.current = new Audio('/among-us-typing.mp3');
      audioRef.current.loop = true; // Biar suaranya muter terus selama ngetik
      audioRef.current.volume = 0.5; // Volume 50% biar nggak budek
    }

    // Mulai ngetik = Mulai bunyi
    if (index === 0 && text.length > 0 && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
    }

    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 30); // Kecepatan ngetik
      
      return () => clearTimeout(timer);
    } else {
      // Kalo ngetik udah kelar, suaranya dimatiin
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset ke awal
      }
    }
  }, [index, text]);

  // Clean up pas component ditutup / user pindah page
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return <span>{displayedText}</span>;
};

export default function MemoryLeakTerminal() {
  const router = useRouter(); 
  const [unlockedLogs, setUnlockedLogs] = useState<string[]>([]);
  const [booting, setBooting] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle Hydration & LocalStorage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("rpd_logs");
    if (saved) {
      setUnlockedLogs(JSON.parse(saved));
    }
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = (id: string) => {
    if (!unlockedLogs.includes(id)) {
      const newLogs = [...unlockedLogs, id];
      setUnlockedLogs(newLogs);
      localStorage.setItem("rpd_logs", JSON.stringify(newLogs));
    }
  };

  // Fungsi Reset Progress
  const resetProgress = () => {
    localStorage.removeItem("rpd_logs");
    setUnlockedLogs([]);
    window.location.reload(); 
  };

  const isEndgame = unlockedLogs.length === memoryLogs.length;

  if (!isMounted || booting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono text-sm">
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
          [FRAGMENT_RECOVERY_PHASE: INITIALIZING...]
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono p-6 sm:p-12 overflow-x-hidden selection:bg-[#FF00FF] selection:text-white pb-32">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER - Bersih, gak ada tombol disini */}
        <header className="mb-12 border-b border-[#FF00FF]/30 pb-4">
          <div className="flex items-center gap-3 text-[#FF00FF] mb-2">
            <Terminal size={24} />
            <h1 className="text-2xl font-bold tracking-widest uppercase">The_Memory_Leak_Terminal</h1>
          </div>
          <p className="text-xs text-green-500 flex items-center gap-2 mb-1">
            <AlertTriangle size={14} />
            {isEndgame ? "[RECOVERY COMPLETE. TRUTH UNVEILED.]" : "[WARNING: CORRUPTED DATA DETECTED. CLICK FRAGMENTS TO RECOVER.]"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            SUBJECT: AFFAN // AFFILIATION: RPD // PROGRESS: {unlockedLogs.length}/7
          </p>
        </header>

        {/* LOG LIST */}
        <div className="space-y-6">
          {memoryLogs.map((log) => {
            const isUnlocked = unlockedLogs.includes(log.id);

            return (
              <motion.div
                key={log.id}
                layout
                className={`border ${
                  isUnlocked ? "border-[#FF00FF]/50 bg-[#FF00FF]/5" : "border-gray-800 bg-gray-900/30 hover:border-gray-600 hover:bg-gray-800/50"
                } p-4 rounded-md cursor-pointer transition-all duration-300`}
                onClick={() => handleUnlock(log.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`font-bold flex items-center gap-2 ${isUnlocked ? "text-[#FF00FF]" : "text-gray-500"}`}>
                    {isUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
                    {log.id} {isUnlocked ? `// ${log.title}` : "// [ENCRYPTED_FRAGMENT]"}
                  </h2>
                  <span className={`text-[10px] px-2 py-1 rounded ${
                    isUnlocked ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-500"
                  }`}>
                    {log.status}
                  </span>
                </div>

                {isUnlocked ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 text-sm"
                  >
                    <p className="text-gray-300 leading-relaxed mb-3 pl-3 border-l-2 border-[#FF00FF]/50">
                      <TypewriterText text={log.content} />
                    </p>
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      transition={{ delay: 2 }} // Delay biar detail muncul setelah ngetik selesai
                      className="text-xs text-yellow-500/80 italic"
                    >
                      &gt; SYSTEM_NOTE: {log.keyDetail}
                    </motion.p>
                  </motion.div>
                ) : (
                  <div className="mt-2 text-xs text-gray-600 blur-[1px] select-none">
                    0x88f9... DATA KORUP... KLIK UNTUK DECRYPT...
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ENDGAME REWARD & ACTION BUTTONS */}
        <AnimatePresence>
          {isEndgame && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 space-y-6"
            >
              {/* Box Profil RPD */}
              <div className="p-6 border-2 border-red-500 bg-red-950/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-48 h-48 relative shrink-0 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    <Image 
                      src="/apexPredator.jpeg" 
                      alt="Apex Predator Profile" 
                      fill 
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <h3 className="text-red-500 font-bold text-xl flex items-center gap-2 mb-2">
                      <ShieldAlert size={20} />
                      CLASSIFIED PROFILE UNLOCKED
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      "Identitas aslinya telah dikonfirmasi. Entitas tingkat ancaman maksimum: <span className="text-white font-bold">APEX PREDATOR</span>."
                    </p>
                    
                    <div className="bg-black/50 p-3 border border-red-500/50 rounded">
                      <p className="text-xs text-gray-500 mb-1">Akses root menuju The Abyss Secret Terminal telah diberikan. Gunakan key ini:</p>
                      <div className="text-[#FF00FF] font-bold tracking-widest text-lg font-mono selection:bg-white selection:text-black">
                        SUDO_RPD_APEX
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Baru muncul pas 7/7 di bawah box password */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
                <button 
                  onClick={() => router.push('/')}
                  className="flex items-center justify-center gap-2 flex-1 text-sm font-bold bg-gray-900 border border-gray-700 text-gray-400 px-4 py-3 hover:bg-white hover:text-black transition-colors"
                >
                  <LogOut size={16} />
                  DISCONNECT_TERMINAL
                </button>

                <button 
                  onClick={resetProgress}
                  className="flex items-center justify-center gap-2 flex-1 text-sm font-bold bg-red-950/30 border border-red-900/50 text-red-500 px-4 py-3 hover:bg-red-900 hover:text-white transition-colors"
                >
                  <RotateCcw size={16} />
                  WIPE_MEMORY_CACHE
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}