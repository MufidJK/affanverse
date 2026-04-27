"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { AffanStatus } from "@/components/affan-status"
import { Code2, Cpu, BrainCircuit, Sparkles, Terminal } from "lucide-react"
import { useTheme } from "next-themes"
import { FloatingBackButton } from "@/components/floating-back-button"

export default function AboutPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isGlitch = mounted && theme === "glitch"

  // CSS Murni buat animasi super smooth 60fps tanpa bikin CPU nangis
  // Udah gw tambahin CSS khusus Hexagon & Efek Asap Kristalnya di sini
  const customStyles = (
    <style dangerouslySetInnerHTML={{__html: `
      /* Animasi Glitch Floating Guestbook */
      @keyframes smoothFloatGuestbook {
        0%, 100% { transform: translateY(0px) translateX(0px); }
        50% { transform: translateY(-15px) translateX(6px); }
      }
      .glitch-float { animation: smoothFloatGuestbook 4s ease-in-out infinite; }

      /* Animasi Border Sci-Fi Mutar */
      @keyframes borderSpin {
        100% { transform: rotate(360deg); }
      }
      .animate-border-spin {
        animation: borderSpin 4s linear infinite;
      }

      /* Animasi Scanline Hologram */
      @keyframes hologramScan {
        0% { transform: translateY(-100%); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(200%); opacity: 0; }
      }
      .animate-hologram-scan {
        animation: hologramScan 3s ease-in-out infinite;
      }

      /* ========================================= */
      /* CSS TAMBAHAN KHUSUS ANIMASI RING MUTER    */
      /* (Ini yang tadi ilang makanya ring lu diem)*/
      /* ========================================= */
      @keyframes spin-slow { 100% { transform: rotate(360deg); } }
      @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
      
      .spin-ring-1 { animation: spin-slow 20s linear infinite; }
      .spin-ring-2 { animation: spin-reverse 15s linear infinite; }
      .spin-ring-3 { animation: spin-slow 25s linear infinite; }

      /* ========================================= */
      /* CSS TAMBAHAN KHUSUS HEXAGON AFFAN         */
      /* ========================================= */
      
      /* Hexagon Clip Path (Motong div jadi segi enam sempurna) */
      .clip-hexagon {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      }
      
      /* Animasi Asap Lebay Mulus (Pake scale & rotate pelan biar gak patah-patah) */
      @keyframes asep-ngalir {
        0% { transform: scale(1) rotate(0deg); opacity: 0.3; }
        50% { transform: scale(1.1) rotate(5deg); opacity: 0.6; }
        100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
      }
      .animate-asep {
        animation: asep-ngalir 6s ease-in-out infinite;
      }
      
      /* Animasi Kilap Kristal (Kaca) */
      @keyframes crystal-shine {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
      .animate-crystal {
        background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%);
        background-size: 200% auto;
        animation: crystal-shine 3s linear infinite;
      }
    `}} />
  )

  return (
    // !!! PERBAIKAN: pt-36 (mobile) md:pt-28 (desktop) penyesuaian biar konten gak kerasa bolong di atas
    <div className="relative min-h-screen w-full flex flex-col md:flex-row pt-36 md:pt-28">
      {customStyles}

      {/* ====================================================
          JUDUL & DESKRIPSI DI TENGAH ATAS (Menyatu Kiri Kanan)
          ==================================================== */}
      {/* !!! PERBAIKAN POSISI JUDUL: top-6 md:top-8 dinaikin biar deket navbar & flex col biar gampang diatur !!! */}
      <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 z-20 w-full px-4 text-center pointer-events-none flex flex-col items-center">
        {/* Tambah leading-none biar spasi vertikal bawaan font ilang */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white drop-shadow-lg leading-none">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2398f7] to-purple-500">Kami</span>
        </h2>
        {/* Margin top dipepetin pake mt-1.5 */}
        <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-zinc-700 dark:text-zinc-200 font-medium inline-block px-6 py-2 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl">
          Menjembatani realitas The Architect dan anomali The Apex Predator.
        </p>
      </div>
      {/* ==================================================== */}


      {/* =========================================
          SISI KIRI: JEKA (THE ARCHITECT) - CLEAN LOOK
          ========================================= */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden">
        
        {/* Latar Minimalis Jeka */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-zinc-200/50 dark:bg-zinc-900/50 rounded-full blur-3xl -z-10 opacity-50"></div>

        <div className="z-10 space-y-6 max-w-lg">
          
          {/* BINGKAI FOTO JEKA */}
          {/* !!! UKURAN UDAH DISAMAIN KAYA AFFAN & DITAMBAHIN RING HITAM !!! */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 mb-10 group">
            
            {/* === RING HITAM MELINGKAR (Animasi Mulus) === */}
            <div className="absolute inset-[-10%] border-[2px] border-dashed border-black/60 dark:border-white/40 rounded-full spin-ring-1 pointer-events-none z-0"></div>
            <div className="absolute inset-[-16%] border-[1px] border-black/30 dark:border-white/20 rounded-full spin-ring-2 pointer-events-none z-0"></div>

            {/* Glow Kalem di belakang */}
            <div className="absolute -inset-2 bg-zinc-300 dark:bg-zinc-700 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition duration-500 z-0"></div>
            
            {/* Foto Asli */}
            <div className="relative h-full w-full rounded-full border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden bg-zinc-100 z-10">
              <Image 
                src="/mufid.jpeg" // <--- GANTI PATH GAMBAR LU
                alt="Mufid Refaya"
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-200 dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-800 shadow-sm">
            <Terminal className="w-3 h-3" />
            <span>The Architect</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Mufid Refaya.
          </h1>
          
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Lebih dikenal sebagai <strong className="text-zinc-900 dark:text-white">Jeka</strong>. Seorang mahasiswa Artificial Intelligence di Universitas Bunda Mulia yang terobsesi mengeksplorasi batas antara logika mesin dan kreativitas manusia.
          </p>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Current Arsenal</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><Code2 className="w-4 h-4 text-zinc-400" /> Next.js, React & Supabase</li>
              <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><Sparkles className="w-4 h-4 text-zinc-400" /> Tailwind & shadcn/ui</li>
              <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><BrainCircuit className="w-4 h-4 text-zinc-400" /> ML (KNN, SVM, Trees, KMeans)</li>
              <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><Cpu className="w-4 h-4 text-zinc-400" /> Local AI Workflows</li>
            </ul>
          </div>
        </div>
      </div>

      {/* =========================================
          SISI KANAN: AFFAN (THE ANOMALY) - THE MASTERPIECE BORDER
          ========================================= */}
      <div className="w-full md:w-1/2 min-h-[50vh] md:min-h-screen bg-zinc-100 dark:bg-[#05050a] flex flex-col justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800">
        
        {/* Latar Belakang Void Affan */}
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#2398f7]/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] -z-10"></div>

        <div className="z-10 mt-20 space-y-6 max-w-lg md:ml-auto">
          
          {/* ====================================================
              BINGKAI HEXAGON KRISTAL SCI-FI (100% MURNI GABUNGAN)
              ==================================================== */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 mb-10 group flex items-center justify-center">
            
            {/* === BARU: Garis-garis Melingkar di luar Hexagon === */}
            <div className="absolute inset-[-12%] border-[2px] border-dashed border-[#2398f7]/50 rounded-full spin-ring-1 pointer-events-none z-0"></div>
            <div className="absolute inset-[-18%] border-[1px] border-purple-500/40 rounded-full spin-ring-2 pointer-events-none z-0"></div>
            <div className="absolute inset-[-24%] border-[1px] border-[#2398f7]/20 rounded-full spin-ring-3 pointer-events-none z-0"></div>

            {/* 1. Efek Asap Belakang (Aura Lebay Mulus) */}
            <div className="absolute inset-[-20%] bg-gradient-to-r from-[#2398f7] via-purple-500 to-indigo-600 rounded-full blur-[40px] animate-asep -z-10 mix-blend-screen"></div>

            {/* 2. Base Kristal Hexagon (Layer Luar Transparan) */}
            <div className="absolute inset-0 clip-hexagon bg-white/10 dark:bg-white/5 backdrop-blur-xl z-0 shadow-[0_0_50px_rgba(35,152,247,0.3)]"></div>

            {/* 3. Border Hexagon Tipis Nyala (Garis luar kristal) */}
            <div className="absolute inset-[1px] clip-hexagon bg-gradient-to-br from-[#2398f7] via-purple-500 to-[#2398f7] z-10 opacity-70"></div>

            {/* 4. Frame Dalam Hexagon (Buat naruh gambar biar ada gap/border tebal) */}
            <div className="absolute inset-[8px] clip-hexagon bg-[#0f1423] z-20 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
              
              {/* Efek Kilap Kaca Jalan Terus (Crystal Shine) */}
              <div className="absolute inset-0 animate-crystal z-30 pointer-events-none mix-blend-overlay"></div>
              
              {/* Garis Scanline Hologram (Kecil di dalem image) */}
              <div className="absolute top-1/4 left-1/4 w-1/2 h-[1px] bg-[#2398f7]/60 z-30 shadow-[0_0_10px_#2398f7] animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/4 w-1/3 h-[1px] bg-purple-400/60 z-30 shadow-[0_0_10px_#a855f7] animate-pulse"></div>

              {/* Gambar Asli Affan (Udah dibikin diem, gk ada efek scale-in lagi) */}
              <div className="relative w-full h-full">
                <Image 
                  src="/affan-1.jpeg" // <--- MASUKIN GAMBAR LU DI SINI
                  alt="Affan The Anomaly"
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-90 mix-blend-lighten filter contrast-125"
                />
                {/* Overlay Biru Gelap Biar Kesan "Void" Nyatu sama Hexagon */}
                <div className="absolute inset-0 bg-[#1e2433]/40 z-20 pointer-events-none mix-blend-multiply"></div>
              </div>

            </div>

          </div>
          {/* ==================================================== */}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#2398f7]/10 text-xs font-mono text-[#2398f7] border border-[#2398f7]/20 shadow-[0_0_10px_rgba(35,152,247,0.2)]">
            <Sparkles className="w-3 h-3" />
            <span>The Apex Predator</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#2398f7] to-purple-400 drop-shadow-sm">
            Haasyir Affan Andinnari.
          </h1>

          {/* MANGGIL WIDGET STATUS AFFAN DI SINI */}
          <AffanStatus />

          <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
            Sebuah persona digital yang lahir dari serangkaian kode, *prompt* 3D, dan anomali di dalam <strong className="text-[#2398f7] drop-shadow-[0_0_5px_rgba(35,152,247,0.5)]">The Void</strong>. Bukan sekadar visual, melainkan sebuah entitas yang hidup di antara dimensi *glitch* dan realitas.
          </p>

          <div className="p-5 rounded-2xl bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-white/5 backdrop-blur-md mt-6 shadow-lg relative overflow-hidden group">
            {/* Dekorasi kartu text */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2398f7] to-purple-500"></div>
            <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 italic pl-2 relative z-10">
              "Klien mungkin meminta revisi landing page, tapi tidak ada yang bisa merevisi eksistensi di dalam The Void."
            </p>
          </div>
          
        </div>
      </div>

      <FloatingBackButton />

    </div>
  )
}