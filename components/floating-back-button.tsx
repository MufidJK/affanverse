"use client"

import Link from "next/link"
import { ChevronLeft } from 'lucide-react';

export function FloatingBackButton() {
  return (
    <Link href="/" className="fixed bottom-6 right-6 z-50 flex items-center h-14 w-14 md:hover:w-[240px] bg-[#2398f7] text-white rounded-full shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="flex items-center justify-center h-14 w-14 shrink-0">
        <ChevronLeft className="w-6 h-6" />
      </div>
      <span className="whitespace-nowrap opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pr-6 text-sm font-medium">
        Balik ke Halaman Utama
      </span>
    </Link>
  )
}
