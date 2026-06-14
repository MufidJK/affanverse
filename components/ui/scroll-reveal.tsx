"use client";

import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export function ScrollReveal({ 
  children, 
  className = "", 
  delay = 0, 
  yOffset = 30 
}: ScrollRevealProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Defer Framer Motion initialization until 150ms after mount.
  // This lets React finish hydration and the main thread breathe
  // before registering intersection observers and animation calculations.
  // SOP Rule 2: cleanup included.
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Pre-hydration: render a plain static div with no JS overhead.
  // The children still render and hold their DOM space (no CLS).
  if (!isHydrated) {
    return (
      <div className={className || undefined} style={{ opacity: 0 }}>
        {children}
      </div>
    );
  }

  // Post-hydration: swap to motion.div with full animation capability.
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className || undefined}
    >
      {children}
    </motion.div>
  );
}
