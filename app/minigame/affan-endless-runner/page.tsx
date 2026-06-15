"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

/**
 * SOP Rule 8: Lazy-load the heavy canvas engine to prevent
 * hydration mismatch and initial load blocking.
 */
const EndlessRunnerEngine = dynamic(
  () => import("./EndlessRunnerEngine"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2398f7]/30 border-t-[#2398f7] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-sm font-medium tracking-wide">
            Initializing The Abyss...
          </p>
        </div>
      </div>
    ),
  }
);

export default function AffanEndlessRunnerPage() {
  return <EndlessRunnerEngine />;
}