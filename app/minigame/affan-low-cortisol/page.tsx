"use client";

import dynamic from "next/dynamic";
import React from "react";

/**
 * SOP Rule 8: Lazy-load the heavy rhythm engine to prevent
 * hydration mismatch and initial load blocking.
 * Uses Web Audio API, Canvas, and Framer Motion — all client-only.
 */
const LowCortisolEngine = dynamic(() => import("./LowCortisolEngine"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2398f7]/30 border-t-[#2398f7] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60 text-sm font-medium tracking-wide">
          Initializing Low Cortisol Protocol...
        </p>
      </div>
    </div>
  ),
});

export default function AffanLowCortisolPage() {
  return <LowCortisolEngine />;
}
