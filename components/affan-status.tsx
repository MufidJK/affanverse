"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Activity } from "lucide-react"

export function AffanStatus() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Daftar status random Affan
  const statuses = [
    "Exploring the Void...",
    "Compiling memories...",
    "Analyzing neural patterns...",
    "Monitoring system integrity...",
    "Floating in zero gravity...",
    "Restructuring dimensional data...",
    "Entering the abyss...",
    "Turu scroll tiktok...",
    "Hacking system mobility affanverse...",
  ]

  const [currentStatus, setCurrentStatus] = useState(statuses[0])

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * statuses.length)
      setCurrentStatus(statuses[randomIndex])
    }, 4000) // Ganti tiap 4 detik otomatis
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-sm transition-all hover:border-[#2398f7]/50 group w-max">
      {/* Icon Status Pelan */}
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2398f7] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2398f7]"></span>
      </div>

      {/* Teks Status */}
      <span className={`text-xs font-medium tracking-wide transition-all duration-500 ${
        theme === 'glitch' 
        ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent font-bold' 
        : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
      }`}>
        {theme === 'glitch' ? "SYSTEM_FAILURE: VOID_LEAK_DETECTED" : currentStatus}
      </span>

      <Activity className={`w-3.5 h-3.5 text-[#2398f7] opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'glitch' ? 'animate-spin' : ''}`} />
    </div>
  )
}