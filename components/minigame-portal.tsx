"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react"; // Ini icon yang beneran ada wok

export function MinigamePortal() {
  return (
    <section className="relative py-32 flex justify-center items-center overflow-hidden">
      {/* Efek Portal Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-[#2398f7]/20 blur-[100px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <Button 
          size="lg" 
          className="bg-[#2398f7] hover:bg-[#1a7bc9] text-white font-bold py-8 px-8 text-lg md:text-xl rounded-2xl shadow-[0_0_40px_rgba(35,152,247,0.6)] transition-all hover:scale-105"
        >
          <Gamepad2 className="mr-3 h-6 w-6" />
          Enter Affan's Mind (WARNING: BRAIN DAMAGE)
        </Button>
      </div>
    </section>
  );
}