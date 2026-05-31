'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GlitchTransitionProps {
  currentTheme: string | undefined;
}

export default function GlitchTransition({ currentTheme }: GlitchTransitionProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (currentTheme === 'glitch') {
      setIsActive(true);
      
      // Auto-Cleanup (RULE 2): Hide the overlay after ~800ms
      timeoutId = setTimeout(() => {
        setIsActive(false);
      }, 800);
    }

    // Strict React Cleanup (RULE 2): Clear timeout if unmounted or theme changes rapidly
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentTheme]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          // Global overlay, ignores pointer events
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-screen"
          // Only animate opacity here (RULE 5)
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* Vertical glitch band */}
          <motion.div
            // Hardware acceleration & limits (RULE 5)
            className="absolute left-0 right-0 h-1/3 bg-[#2398f7]/40 will-change-transform transform-gpu"
            initial={{ y: '-100%' }}
            animate={{ y: ['-50%', '150%', '-20%', '100%'] }}
            transition={{
              duration: 0.4,
              ease: 'linear',
              repeat: 1, // Runs twice roughly fitting the 800ms
            }}
          />
          
          {/* Horizontal glitch band */}
          <motion.div
            // Hardware acceleration & limits (RULE 5)
            className="absolute top-0 bottom-0 w-1/4 bg-[#2398f7]/30 will-change-transform transform-gpu"
            initial={{ x: '-100%' }}
            animate={{ x: ['100%', '-50%', '200%', '-100%'] }}
            transition={{
              duration: 0.3,
              ease: 'linear',
              repeat: 2,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
