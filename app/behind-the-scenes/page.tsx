"use client";

import { useRef, MouseEvent, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import btsImage from "@/public/behindTheSceneAffanverse.jpeg";
import { Badge } from "@/components/ui/badge";

/* ─── Timeline Data (Indonesian) ─────────────────────────────── */
const TIMELINE = [
  {
    month: "April 2026",
    title: "Genesis — Fondasi Dimensi Baru",
    items: [
      "Inisiasi proyek Affanverse menggunakan Next.js 16 (Turbopack) sebagai fondasi utama.",
      "Konseptualisasi tema oseanik dan identitas visual The Apex Predator — warna neon blue (#2398f7) ditetapkan sebagai signature.",
      "Desain arsitektur UI dasar: Hero Section 3D interaktif, Navbar responsif, dan sistem Light/Dark/Glitch mode.",
      "Setup backend Supabase (PostgreSQL) dengan Singleton pattern dan Row Level Security.",
      "Pembuatan tabel database inti: gallery (199 item), music (30 lagu), articles, novel_chapters (150 chapter).",
    ],
  },
  {
    month: "Mei 2026",
    title: "Anomalies — Injeksi Fitur Berat",
    items: [
      "Implementasi Affan AI Chat (Google Gemini 2.5 Flash) dengan RAG pipeline dan cross-page hash routing (/#affan-ai-chat).",
      "Pembangunan Novel Reader '3D interface' untuk Affan: The Apex Predator (7 Volume, 150 Chapter) dan Ambasuke Spin-off (7 Volume, 21 Chapter).",
      "Pengembangan Void Portal: Flappy Affan (arcade clone) dan Affan Strike (endless runner dengan boss fight).",
      "Integrasi Affan's Music Player — synced LRC lyrics, WebGL Soundscape Overlay (3D icosahedron reaktif audio real-time).",
      "Pembuatan Cursed Entity 67 — interactive 3D artifact viewer dengan tiga model corrupted (cursed-1/2/3.glb).",
      "Konstruksi Abyss Secret Terminal — full-screen hacker terminal dengan command system, typewriter SFX, dan password gating (classified).",
    ],
  },
  {
    month: "Juni 2026",
    title: "Convergence — Polish & Penyempurnaan",
    items: [
      "Overhaul total Footer: circular social icons (react-icons), dynamic link routing (button/action/external/internal), Creator Messages terminal drawer, dan Sanity Check glitch easter egg.",
      "Implementasi sistem modal interaktif: CreatorMessages (Sheet drawer + typewriter), Sanity Check (CSS body glitch + sonner toast dengan progress bar framer-motion).",
      "Scaffold tiga halaman Legal (Privacy Policy, Terms of Chaos, Cookie Protocol) — konten lengkap dalam Bahasa Indonesia.",
      "Fix kritis: LCP performance warning pada Hero Section — priority={true} pada semua gambar above-the-fold.",
      "Pembuatan halaman Behind the Scenes — dokumentasi genesis Affanverse.",
      "Sinkronisasi knowledge base AI Persona (agent.py) dengan seluruh fitur dan rute baru.",
      "Integrasi komponen System Briefing Video (YouTube) pada struktur halaman utama dengan dukungan sinkronisasi agent backend.",
      "Pengembangan minigame 'The Ambasuke Protocol' — Top-down Hack & Slash Canvas Minigame dengan rendering engine kustom, aset audio, dan integrasi persistent leaderboard.",
      "Pengembangan minigame 'Affan Endless Runner' — Zero-leak Canvas Engine yang sangat dioptimasi dengan mekanik Gravity Shift dan implementasi DOM-based Framer Motion Parallax."
    ],
  },
];

export default function BehindTheScenesPage() {
  /* ─── Parallax Tilt Logic ──────────────────────────────────── */
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  /* ─── Ken Burns: extremely slow zoom via framer-motion ─────── */
  /* Rule 5 compliance: only animate transform (scale) + opacity */
  const kenBurnsScale = useMotionValue(1);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 30000; // 30 seconds full cycle
    const minScale = 1;
    const maxScale = 1.08;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = (elapsed % duration) / duration;
      // Ease in-out sine for smooth reversals
      const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI * 2);
      kenBurnsScale.set(minScale + eased * (maxScale - minScale));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame); // Rule 2: strict cleanup
  }, [kenBurnsScale]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-20 px-6">
        
        {/* ═══ HEADER ═══════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col items-center text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Badge
              variant="outline"
              className="text-[#2398f7] border-[#2398f7]/50 bg-[#2398f7]/10 font-mono text-xs"
            >
              Aesthetic Anomaly
            </Badge>
            <Badge
              variant="outline"
              className="text-[#2398f7] border-[#2398f7]/50 bg-[#2398f7]/10 font-mono text-xs"
            >
              Lore Origins
            </Badge>
            <Badge
              variant="outline"
              className="text-[#2398f7] border-[#2398f7]/50 bg-[#2398f7]/10 font-mono text-xs"
            >
              Classified Documentation
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-gray-900 dark:text-white tracking-tight">
            Decoding the Abyss: <br className="hidden md:block" />
            <span className="text-[#2398f7]">The Genesis of Affanverse</span>
          </h1>

          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Mengabadikan momen gabut berujung karya, dikerjakan sepenuh hati
            untuk menjaga kewarasan dan convergence The Apex Predator.
          </p>
        </motion.div>

        {/* ═══ IMAGE — PARALLAX TILT + KEN BURNS ═════════════════ */}
        <motion.div
          ref={containerRef}
          className="relative w-full max-w-xl mx-auto mb-24 transform-gpu will-change-transform"
          style={{
            perspective: 1200,
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl transform-gpu will-change-transform bg-gray-100 dark:bg-gray-950"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Neon blue glow ring — static radial-gradient per Rule 5 */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2398f7]/20 via-transparent to-[#2398f7]/20 pointer-events-none z-10" />

            {/* Image container — object-contain to show FULL image without crop */}
            <div className="relative w-full max-w-xl mx-auto h-[600px] bg-black/50 dark:bg-black/80 border border-[#2398f7]/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(35,152,247,0.15)]">
              <motion.div
                className="relative w-full h-full transform-gpu will-change-transform"
                style={{ scale: kenBurnsScale }}
              >
                <Image
                  src={btsImage}
                  alt="Behind the scenes of Affanverse — The Architect's workstation during the genesis of the digital ecosystem"
                  fill
                  priority={true}
                  className="object-contain"
                  sizes="(max-width: 600px) 100vw, 600px"
                />
              </motion.div>
            </div>

            {/* Gradient overlay — bottom caption area */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between pointer-events-none">
              <p className="text-white/80 font-mono text-xs sm:text-sm tracking-wider uppercase">
                LOC: 0xAFF4N_STUDIO_ORIGIN
              </p>
              <p className="text-white/50 font-mono text-xs tracking-wider hidden sm:block">
                CONVERGENCE: 2026
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══ JOURNEY TIMELINE ══════════════════════════════════ */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center text-center mb-12">
            <Badge
              variant="outline"
              className="mb-4 text-[#2398f7] border-[#2398f7]/50 bg-[#2398f7]/10 font-mono text-xs"
            >
              Development Log
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Convergence Journey:{" "}
              <span className="text-[#2398f7]">The Genesis Archives (2026)</span>
            </h2>
          </div>

          <div className="space-y-12">
            {TIMELINE.map((phase, i) => (
              <motion.section
                key={phase.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-8 rounded-full bg-[#2398f7]" />
                  <div>
                    <p className="text-xs font-mono text-[#2398f7] tracking-widest uppercase">
                      {phase.month}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <ul className="space-y-3 ml-6 border-l-2 border-gray-200 dark:border-gray-800 pl-6">
                  {phase.items.map((item, j) => (
                    <li key={j} className="relative text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-[#2398f7] bg-white dark:bg-[#0a0a0a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
