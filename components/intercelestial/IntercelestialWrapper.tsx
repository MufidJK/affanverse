"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "next-themes";
import { IntercelestialScene } from "./IntercelestialScene";
import { cn } from "@/lib/utils";
import { useInView } from "framer-motion";

export function IntercelestialWrapper() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "200px 0px 200px 0px", amount: 0 });
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isLowCores: false });

  useEffect(() => {
    setDeviceInfo({
      isMobile: window.innerWidth < 768,
      isLowCores: navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false
    });
  }, []);

  // The WebGL Canvas is ALWAYS locked to the dark abyss theme
  // We use CSS mix-blend-modes and filters on the wrapper to adapt to light/glitch modes
  const themeClasses = cn(
    "relative w-full h-full transition-all duration-700 ease-in-out z-10",
    theme === "light" ? "bg-transparent" : "bg-zinc-950",
    theme === "glitch" && "animate-[sanityShake_0.2s_infinite] contrast-150 saturate-200"
  );

  return (
    <div ref={containerRef} className={cn("w-full h-full overflow-hidden relative", theme === "light" ? "bg-slate-50" : "bg-zinc-950")}>
      <div className={themeClasses}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, deviceInfo.isMobile ? 45 : 25], fov: 45 }}
          className="w-full h-full"
          frameloop={!isInView ? "demand" : "always"}
        >
          <Suspense fallback={null}>
            <IntercelestialScene isLowCores={deviceInfo.isLowCores} />
          </Suspense>
        </Canvas>
      </div>

      {/* Persistent Overlay Layer that doesn't get affected by Canvas CSS filters */}
      <div className="absolute top-8 w-full left-0 px-4 md:w-auto md:left-8 md:px-0 text-center md:text-left pointer-events-none z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Intercelestial 🌌
        </h1>
        <p className="mx-auto md:mx-0 text-zinc-300 text-sm mt-1 max-w-sm drop-shadow-md font-mono">
          Map of the Affanverse ecosystem. Drag to rotate. Click nodes to access realms.
        </p>
      </div>
    </div>
  );
}
