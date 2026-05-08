"use client";

import dynamic from "next/dynamic";

/**
 * SOP Rule 8: Lazy-load the heavy canvas engine to prevent
 * hydration mismatch and initial load blocking.
 */
const AffanStrikeEngine = dynamic(() => import("./AffanStrikeEngine"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm font-medium tracking-wide">Loading Affan Strike...</p>
      </div>
    </div>
  ),
});

export default function AffanStrikePage() {
  return <AffanStrikeEngine />;
}
