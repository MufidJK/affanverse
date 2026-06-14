"use client";

import dynamic from "next/dynamic";

// SOP Rule 8: Lazy load the Hero3DEffect component to defer Framer Motion
// spring calculations and continuous CSS 3D transform animations from
// the initial client bundle parse. Allows text content to paint first on mobile.
const Hero3DEffect = dynamic(
  () => import("@/components/hero-3d").then((mod) => mod.Hero3DEffect),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-3xl bg-secondary/80 dark:bg-zinc-900/90 border border-[#2398f7]/30" />
    ),
  }
);

export function Hero3DWrapper() {
  return <Hero3DEffect />;
}
