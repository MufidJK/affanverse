"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const TRANSMISSION_LINES = [
  "> SYSTEM LOG INITIATED...",
  "> AUTHOR: Jeka (The Architect)",
  "> ─────────────────────────────────────",
  '> "Affanverse is not just a portfolio.',
  '>  It is an archive of anomalies,',
  '>  a convergence of marine sciences,',
  '>  AI, and raw digital chaos.',
  '>  You are not just browsing;',
  '>  you are surviving the abyss.',
  '>  Affan The Apex Predator. "',
  "> ─────────────────────────────────────",
  "> END OF TRANSMISSION.",
];

interface CreatorMessagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatorMessages({ open, onOpenChange }: CreatorMessagesProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTypingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      setVisibleLines(0);
      // Typewriter effect: reveal one line every 120ms
      intervalRef.current = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev >= TRANSMISSION_LINES.length) {
            clearTypingInterval();
            return prev;
          }
          return prev + 1;
        });
      }, 120);
    } else {
      clearTypingInterval();
      setVisibleLines(0);
    }

    // AGENTS.md Rule 2: strict cleanup
    return () => {
      clearTypingInterval();
    };
  }, [open, clearTypingInterval]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!bg-black !border-l-gray-800 !text-[#2398f7] sm:!max-w-md overflow-y-auto"
        showCloseButton
      >
        <SheetHeader className="border-b border-gray-800 pb-4">
          <SheetTitle className="font-mono text-[#2398f7] text-sm tracking-widest uppercase">
            ◈ Creator Terminal
          </SheetTitle>
          <SheetDescription className="font-mono text-gray-600 text-xs">
            CLASSIFIED // CLEARANCE LEVEL: OMEGA
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-4 font-mono text-sm leading-relaxed space-y-1">
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] opacity-30" />

          {TRANSMISSION_LINES.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className={`${
                line.startsWith('> "') || line.startsWith(">  ")
                  ? "text-[#2398f7] pl-2"
                  : line.includes("───")
                  ? "text-gray-700"
                  : "text-green-400"
              }`}
            >
              {line}
            </p>
          ))}

          {/* Blinking cursor */}
          {visibleLines < TRANSMISSION_LINES.length && (
            <span className="inline-block w-2 h-4 bg-[#2398f7] animate-pulse" />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
