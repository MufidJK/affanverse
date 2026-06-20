"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface BilingualText {
  id: string; // Indonesian
  en: string; // English
}

interface QuizQuestion {
  id: number;
  question: BilingualText;
  options: {
    id: string[]; // 4 Indonesian options
    en: string[]; // 4 English options
  };
  correctAnswerIndex: number; // e.g., 0, 1, 2, or 3
  category: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  // LORE (Affan & Core Story)
  {
    id: 1,
    category: "lore",
    question: {
      id: "Apa nama alias utama Affan di timeline inti?",
      en: "What is Affan's primary alias in the core timeline?"
    },
    options: {
      id: ["The Ghost", "The Apex Predator", "The Nexus Coordinator", "Shadow Weaver"],
      en: ["The Ghost", "The Apex Predator", "The Nexus Coordinator", "Shadow Weaver"]
    },
    correctAnswerIndex: 1,
  },
  {
    id: 2,
    category: "lore",
    question: {
      id: "Siapakah protagonis dari seri spin-off di Affanverse?",
      en: "Who is the protagonist of the spin-off series in the Affanverse?"
    },
    options: {
      id: ["Ambasuke", "The Architect", "Aizen", "Ren"],
      en: ["Ambasuke", "The Architect", "Aizen", "Ren"]
    },
    correctAnswerIndex: 0,
  },
  {
    id: 3,
    category: "lore",
    question: {
      id: "Apa sifat sejati dari Affanverse?",
      en: "What is the true nature of the Affanverse?"
    },
    options: {
      id: ["Situs novel sederhana", "Game virtual reality", "Ekosistem kognitif yang terus berkembang", "Dimensi timeline alternatif"],
      en: ["A simple novel site", "A virtual reality game", "A continuously expanding cognitive ecosystem", "An alternate timeline dimension"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 4,
    category: "lore",
    question: {
      id: "Manakah yang paling tepat mendeskripsikan sifat perilaku Affan?",
      en: "Which of the following best describes Affan's behavioral traits?"
    },
    options: {
      id: ["Pasifis dan naif", "Kalkulatif, dominan, dan memiliki aura Apex", "Tidak menentu dan emosional", "Pengamat pasif"],
      en: ["Pacifist and naive", "Calculated, dominant, and an Apex presence", "Erratic and emotional", "Passive observer"]
    },
    correctAnswerIndex: 1,
  },
  {
    id: 5,
    category: "lore",
    question: {
      id: "Sebagai seorang 'Apex Predator', apa alasan utama entitas anomali sangat takut pada Affan?",
      en: "As an 'Apex Predator', what is the main reason anomalous entities fear Affan?"
    },
    options: {
      id: ["Karena dia memburu musuhnya dengan eksekusi yang presisi, efisien, dan tanpa ampun", "Karena dia memiliki pasukan robot yang tak terbatas", "Karena dia dilindungi langsung oleh The Architect", "Karena dia bisa memanipulasi pikiran orang lain"],
      en: ["Because he hunts his enemies with precise, efficient, and ruthless execution", "Because he has an infinite robot army", "Because he is directly protected by The Architect", "Because he can manipulate other people's minds"]
    },
    correctAnswerIndex: 0,
  },
  
  // ECOSYSTEM (Platform Features & The Matrix)
  {
    id: 6,
    category: "ecosystem",
    question: {
      id: "Apa fungsi utama dari Nexus Coordinator di dalam sistem Affanverse?",
      en: "What is the primary function of the Nexus Coordinator within the Affanverse system?"
    },
    options: {
      id: ["Mengelola sinkronisasi database dan memantau stabilitas anomali", "Menerjemahkan chapter novel ke berbagai bahasa", "Menghasilkan model 3D untuk website", "Memutar musik latar secara otomatis"],
      en: ["Managing database synchronizations and monitoring anomaly stability", "Translating novel chapters into multiple languages", "Generating 3D models for the website", "Playing background ambient music automatically"]
    },
    correctAnswerIndex: 0,
  },
  {
    id: 7,
    category: "ecosystem",
    question: {
      id: "Siapakah entitas di balik nama 'The Architect' yang membangun dan merancang ekosistem Affanverse ini?",
      en: "Who is the entity behind the name 'The Architect' that built and designed the Affanverse ecosystem?"
    },
    options: {
      id: ["Affan", "Ambasuke", "Jeka", "The Node"],
      en: ["Affan", "Ambasuke", "Jeka", "The Node"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 8,
    category: "ecosystem",
    question: {
      id: "Warna aksen apa yang menjadi ciri khas identitas visual The Matrix Affanverse (contohnya pada efek hover dan UI)?",
      en: "What accent color is the hallmark of the Affanverse Matrix visual identity (e.g., on hover effects and UI)?"
    },
    options: {
      id: ["Neon Red", "Cyber Yellow", "Biru (#2398f7)", "Toxic Green"],
      en: ["Neon Red", "Cyber Yellow", "Blue (#2398f7)", "Toxic Green"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 9,
    category: "ecosystem",
    question: {
      id: "Apa saja tiga mode tema tampilan utama (Hybrid Theme) yang tersedia bagi user di Affanverse?",
      en: "What are the three main display theme modes (Hybrid Theme) available to users in the Affanverse?"
    },
    options: {
      id: ["Classic, Modern, Vintage", "Light, Dark, dan Glitch", "Terminal, Hacker, dan Matrix", "Merah, Biru, dan Hijau"],
      en: ["Classic, Modern, Vintage", "Light, Dark, and Glitch", "Terminal, Hacker, and Matrix", "Red, Blue, and Green"]
    },
    correctAnswerIndex: 1,
  },
  {
    id: 10,
    category: "ecosystem",
    question: {
      id: "Saat user berhasil mencetak rekor bermain dalam minigame di Void Portal, apa yang dilakukan oleh ekosistem Affanverse?",
      en: "When a user hits a record playing a minigame in the Void Portal, what does the Affanverse ecosystem do?"
    },
    options: {
      id: ["Menghapus progres secara acak sebagai bagian dari anomali", "Mencatat skor tertinggi secara permanen dan aman di database global", "Memaksa user untuk mengulang dari level satu", "Mereset tema website menjadi terang (Light Mode)"],
      en: ["Randomly deletes progress as part of an anomaly", "Permanently and securely records the high score in the global database", "Forces the user to restart from level one", "Resets the website theme to Light Mode"]
    },
    correctAnswerIndex: 1,
  },

  // UTILITIES (Navigation & Minigames)
  {
    id: 11,
    category: "utility",
    question: {
      id: "Entitas mana yang mengontrol 'Intercelestial 🌌'?",
      en: "Which entity controls the 'Intercelestial 🌌'?"
    },
    options: {
      id: ["The Apex Predator", "The Void", "The Architect", "The Nexus"],
      en: ["The Apex Predator", "The Void", "The Architect", "The Nexus"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 12,
    category: "utility",
    question: {
      id: "Pada 'Intercelestial 🌌', efek visual apa yang paling agresif berdetak di pusat node?",
      en: "On the 'Intercelestial 🌌', what visual effect beats most aggressively at the core node?"
    },
    options: {
      id: ["RGB breathing core", "Hujan meteor", "Ledakan supernova", "Lingkaran api murni"],
      en: ["RGB breathing core", "Meteor shower", "Supernova explosion", "Pure ring of fire"]
    },
    correctAnswerIndex: 0,
  },
  {
    id: 13,
    category: "utility",
    question: {
      id: "Apa itu 'Void Portal'?",
      en: "What is the 'Void Portal'?"
    },
    options: {
      id: ["Rute hub untuk meluncurkan minigame (contoh: 'Flappy Affan')", "Server chat global", "Dashboard admin untuk merevisi chapter", "Database untuk menampung user baru"],
      en: ["A hub route launching minigames (e.g., 'Flappy Affan')", "A global chat server", "An admin dashboard to revise chapters", "A database to store new users"]
    },
    correctAnswerIndex: 0,
  },
  {
    id: 14,
    category: "utility",
    question: {
      id: "Tantangan apa yang harus dihadapi user saat memasuki 'Void Portal' dan memainkan Flappy Affan?",
      en: "What challenge must users face when entering the 'Void Portal' and playing Flappy Affan?"
    },
    options: {
      id: ["Memecahkan teka-teki enkripsi", "Melawan Aizen di pertarungan turn-based", "Menavigasi rintangan dengan fisika gravitasi untuk mencetak skor tertinggi", "Menebak kode akses rahasia"],
      en: ["Solving encryption puzzles", "Fighting Aizen in a turn-based battle", "Navigating obstacles with gravity physics to hit the highest score", "Guessing secret access codes"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 15,
    category: "utility",
    question: {
      id: "Jika seorang user berhasil mencapai sinkronisasi Affanverse Knowledge Index 100%, gelar tertinggi apa yang mereka dapatkan?",
      en: "If a user successfully achieves a 100% Affanverse Knowledge Index synchronization, what highest title do they earn?"
    },
    options: {
      id: ["Mere Anomaly", "Nexus Navigator", "The Architect", "Apex Predator"],
      en: ["Mere Anomaly", "Nexus Navigator", "The Architect", "Apex Predator"]
    },
    correctAnswerIndex: 3,
  },

  // PLATFORM / READING (Reader Experience)
  {
    id: 16,
    category: "platform",
    question: {
      id: "Saat sedang fokus membaca novel, apa kegunaan dari fitur 'Focus Mode'?",
      en: "While focusing on reading a novel, what is the purpose of the 'Focus Mode' feature?"
    },
    options: {
      id: ["Memutar suara hujan secara otomatis", "Menyembunyikan semua elemen UI (seperti navbar) agar layer layar menjadi bersih", "Menerjemahkan teks secara instan", "Mengubah warna teks menjadi emas"],
      en: ["Automatically playing rain sounds", "Hiding all UI elements (like navbars) to make the screen layer completely clean", "Translating text instantly", "Changing the text color to gold"]
    },
    correctAnswerIndex: 1,
  },
  {
    id: 17,
    category: "platform",
    question: {
      id: "Selain kenyamanan visual, apa prioritas utama platform Affanverse dalam menyajikan pengalaman membaca novel?",
      en: "Besides visual comfort, what is the main priority of the Affanverse platform in delivering the novel reading experience?"
    },
    options: {
      id: ["Animasi transisi teks yang sangat berat dan berlebihan", "Menyajikan teks dalam format 'hacker terminal' yang rumit agar terlihat keren", "Sistem yang sangat ringan (zero-bloat) dan bersih tanpa gangguan elemen tidak penting", "Memunculkan efek suara ledakan di setiap perpindahan chapter"],
      en: ["Extremely heavy and excessive text transition animations", "Presenting text in a complex 'hacker terminal' format to look cool", "An extremely lightweight (zero-bloat) and clean system without unnecessary distractions", "Triggering explosion sound effects on every chapter transition"]
    },
    correctAnswerIndex: 2,
  },
  {
    id: 18,
    category: "platform",
    question: {
      id: "Fitur apa yang secara otomatis bekerja di belakang layar untuk melacak progres chapter terakhir yang user baca?",
      en: "What feature automatically works behind the scenes to track the last chapter progress a user has read?"
    },
    options: {
      id: ["Cognitive Sync", "Save Point", "Anomaly Deflector", "Time Dilation"],
      en: ["Cognitive Sync", "Save Point", "Anomaly Deflector", "Time Dilation"]
    },
    correctAnswerIndex: 1,
  },
  {
    id: 19,
    category: "platform",
    question: {
      id: "Selain kisah utama The Apex Predator di timeline inti, sektor bacaan khusus apa lagi yang diintegrasikan ke dalam platform ini?",
      en: "Besides The Apex Predator main story in the core timeline, what other dedicated reading sector is integrated into the platform?"
    },
    options: {
      id: ["Sektor membaca khusus untuk seri spin-off 'Ambasuke'", "Sektor e-commerce untuk membeli merchandise", "Blog pribadi The Architect", "Ensiklopedia tutorial pemrograman Next.js"],
      en: ["A dedicated reading sector for the 'Ambasuke' spin-off series", "An e-commerce sector to buy merchandise", "The Architect's personal blog", "An encyclopedia of Next.js programming tutorials"]
    },
    correctAnswerIndex: 0,
  },
  {
    id: 20,
    category: "platform",
    question: {
      id: "Di mana posisi menu rute 'AKI' (Affanverse Knowledge Index) ditempatkan di dalam Navbar ekosistem?",
      en: "Where is the 'AKI' (Affanverse Knowledge Index) route menu placed within the ecosystem's Navbar?"
    },
    options: {
      id: ["Di posisi paling kiri sebelum logo utama", "Di antara rute 'The Books' dan 'Contact'", "Di bagian footer bawah website", "Disembunyikan di dalam dropdown menu profil"],
      en: ["At the far left before the main logo", "Between the 'The Books' and 'Contact' routes", "At the bottom footer of the website", "Hidden inside the profile dropdown menu"]
    },
    correctAnswerIndex: 1,
  },
];

export default function AKIPage() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const [highScore, setHighScore] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState<number[]>(new Array(QUIZ_QUESTIONS.length).fill(-1))
  const [lang, setLang] = useState<"id" | "en">("id")

  // Hydration-safe localStorage reading
  useEffect(() => {
    const stored = localStorage.getItem("affanverse_best_sync")
    if (stored !== null) {
      setHighScore(parseInt(stored, 10))
    }
  }, [])

  const computedScore = userAnswers.reduce((acc, ans, idx) => {
    return ans === QUIZ_QUESTIONS[idx].correctAnswerIndex ? acc + 1 : acc
  }, 0)

  const handleStart = () => {
    setPhase(1)
    setCurrentQuestion(0)
    setUserAnswers(new Array(QUIZ_QUESTIONS.length).fill(-1))
  }

  const handleAnswerSelect = (index: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = index
    setUserAnswers(newAnswers)
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (userAnswers[currentQuestion] === -1) return

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      const finalPercentage = (computedScore / QUIZ_QUESTIONS.length) * 100
      
      if (highScore === null || finalPercentage > highScore) {
        setHighScore(finalPercentage)
        localStorage.setItem("affanverse_best_sync", finalPercentage.toString())
      }
      
      setPhase(2)
    }
  }

  const handleRetry = () => {
    setPhase(0)
  }

  const toggleLanguage = () => {
    setLang(lang === "id" ? "en" : "id")
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 relative">
      
      {/* LANGUAGE TOGGLE (ANIMATED PILL) */}
      <div className="absolute top-6 right-6 z-0">
        <button 
          onClick={toggleLanguage}
          className="relative flex items-center p-1 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:outline-none"
          aria-label="Toggle Language"
        >
          {/* Active Background Pill */}
          <motion.div
            className="absolute top-1 bottom-1 left-1 w-12 rounded-full bg-[#2398f7] shadow-[0_0_12px_rgba(35,152,247,0.5)] transform-gpu will-change-transform"
            initial={false}
            animate={{ x: lang === "id" ? 0 : 48 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />

          {/* Labels */}
          <div className="relative flex items-center z-10 text-xs font-bold tracking-widest">
            <span 
              className={cn(
                "w-12 text-center py-1.5 transition-colors duration-200",
                lang === "id" ? "text-white" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              ID
            </span>
            <span 
              className={cn(
                "w-12 text-center py-1.5 transition-colors duration-200",
                lang === "en" ? "text-white" : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              EN
            </span>
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* PHASE 0: INITIATION */}
        {phase === 0 && (
          <motion.div
            key="initiation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl transform-gpu will-change-transform"
          >
            <Card className="p-8 md:p-12 text-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(35,152,247,0.05),transparent_50%)] pointer-events-none" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
                Affanverse Knowledge Index <span className="text-[#2398f7] block mt-2">(AKI)</span>
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
                {lang === "id" 
                  ? "Ujian kognitif 20 soal untuk mengukur tingkat sinkronisasi Anda dengan matriks Affanverse. Buktikan penguasaan Anda atas lore, profil Affan, dan utilitas ekosistem web untuk meraih Rank tertinggi."
                  : "A 20-question cognitive trial to measure your synchronization rate with the Affanverse matrix. Prove your knowledge of the core lore, Affan's profile, and ecosystem utilities to claim your highest Rank."}
              </p>
              
              <div className="mb-10 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 inline-block min-w-[200px]">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                  {lang === "id" ? "Sinkronisasi Puncak" : "Peak Synchronization"}
                </p>
                <p className="text-3xl font-mono font-bold text-[#2398f7]">
                  {highScore !== null ? `${highScore}%` : "0%"}
                </p>
              </div>

              <div>
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="bg-[#2398f7] hover:bg-[#2398f7]/90 text-white font-bold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(35,152,247,0.3)] hover:shadow-[0_0_30px_rgba(35,152,247,0.5)] transition-all duration-300 transform-gpu active:scale-95"
                >
                  {lang === "id" ? "Mulai Ujian" : "Initiate Trial"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* PHASE 1: ACTIVE QUIZ */}
        {phase === 1 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl transform-gpu will-change-transform"
          >
            <div className="mb-8 w-full">
              <div className="flex justify-between text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 px-1">
                <span>Phase {currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
                <span className="text-[#2398f7] font-mono">
                  {Math.round(((currentQuestion) / QUIZ_QUESTIONS.length) * 100)}% {lang === "id" ? "Tersinkronisasi" : "Matrix Synced"}
                </span>
              </div>
              <Progress 
                value={((currentQuestion) / QUIZ_QUESTIONS.length) * 100} 
                className="h-2 bg-zinc-200 dark:bg-zinc-800" 
              />
            </div>

            <Card className="p-6 md:p-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="transform-gpu will-change-transform"
                >
                  <div className="inline-flex items-center rounded-full border border-[#2398f7]/30 bg-[#2398f7]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2398f7] mb-6 uppercase tracking-widest">
                    {QUIZ_QUESTIONS[currentQuestion].category}
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 leading-tight">
                    {QUIZ_QUESTIONS[currentQuestion].question[lang]}
                  </h2>

                  <RadioGroup 
                    value={userAnswers[currentQuestion].toString()} 
                    onValueChange={(val) => handleAnswerSelect(parseInt(val, 10))}
                    className="space-y-3"
                  >
                    {QUIZ_QUESTIONS[currentQuestion].options[lang].map((option, idx) => {
                      const isSelected = userAnswers[currentQuestion] === idx
                      return (
                        <div 
                          key={idx}
                          className={cn(
                            "flex items-center space-x-3 space-y-0 rounded-xl border p-4 transition-all duration-200 cursor-pointer",
                            isSelected 
                              ? "border-[#2398f7] bg-[#2398f7]/5 shadow-[inset_0_0_20px_rgba(35,152,247,0.1)]" 
                              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                          )}
                          onClick={() => handleAnswerSelect(idx)}
                        >
                          <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="sr-only" />
                          <div className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            isSelected ? "border-[#2398f7] bg-[#2398f7]" : "border-zinc-400 dark:border-zinc-600"
                          )}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white dark:bg-zinc-950" />}
                          </div>
                          <Label 
                            htmlFor={`option-${idx}`} 
                            className={cn(
                              "flex-1 cursor-pointer text-base leading-relaxed font-medium",
                              isSelected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"
                            )}
                          >
                            {option}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>

                  <div className="mt-10 flex justify-between items-center w-full">
                    {currentQuestion > 0 ? (
                      <Button 
                        variant="ghost"
                        onClick={handlePrev}
                        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 font-bold transition-all transform-gpu active:scale-95"
                      >
                        {lang === "id" ? "Sebelumnya" : "Previous"}
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button 
                      onClick={handleNext}
                      disabled={userAnswers[currentQuestion] === -1}
                      className={cn(
                        "px-8 py-4 rounded-lg font-bold text-md transition-all duration-300 transform-gpu active:scale-95",
                        userAnswers[currentQuestion] !== -1 
                          ? "bg-[#2398f7] hover:bg-[#2398f7]/90 text-white shadow-[0_0_15px_rgba(35,152,247,0.4)]"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      {currentQuestion === QUIZ_QUESTIONS.length - 1 
                        ? (lang === "id" ? "Selesai" : "Submit") 
                        : (lang === "id" ? "Selanjutnya" : "Next")}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* PHASE 2: RESULTS */}
        {phase === 2 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full max-w-2xl transform-gpu will-change-transform"
          >
            <Card className="p-8 md:p-12 text-center bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,152,247,0.05),transparent_60%)] pointer-events-none" />
              
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                {lang === "id" ? "Ujian Selesai" : "Trial Concluded"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                {lang === "id" 
                  ? "Tingkat sinkronisasi Anda dengan matriks telah dihitung." 
                  : "Your synchronization with the matrix has been calculated."}
              </p>

              <div className="mb-10">
                <div className="text-7xl font-mono font-black mb-4">
                  <span className={cn(
                    "bg-clip-text text-transparent",
                    (computedScore / QUIZ_QUESTIONS.length) === 1 
                      ? "bg-gradient-to-br from-[#2398f7] to-[#80c6ff] drop-shadow-[0_0_15px_rgba(35,152,247,0.5)]" 
                      : (computedScore / QUIZ_QUESTIONS.length) >= 0.5 
                        ? "bg-gradient-to-br from-zinc-200 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400"
                        : "bg-gradient-to-br from-red-500 to-red-800 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  )}>
                    {Math.round((computedScore / QUIZ_QUESTIONS.length) * 100)}%
                  </span>
                </div>

                <div className="inline-block px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mr-2 uppercase tracking-widest">
                    {lang === "id" ? "Peringkat:" : "Assigned Rank:"}
                  </span>
                  <span className={cn(
                    "text-xl font-bold tracking-tight",
                    (computedScore / QUIZ_QUESTIONS.length) === 1 
                      ? "text-[#2398f7] [text-shadow:0_0_10px_rgba(35,152,247,0.6)]" 
                      : (computedScore / QUIZ_QUESTIONS.length) >= 0.5 
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-red-500 dark:text-red-400"
                  )}>
                    {(computedScore / QUIZ_QUESTIONS.length) === 1 
                      ? "Apex Predator" 
                      : (computedScore / QUIZ_QUESTIONS.length) >= 0.5 
                        ? "Nexus Navigator" 
                        : "Mere Anomaly: Protocol Failed"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button
                  size="lg"
                  onClick={handleRetry}
                  className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-8 py-6 rounded-full text-lg transition-transform transform-gpu active:scale-95"
                >
                  {lang === "id" ? "Coba Lagi" : "Retry Trial"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
