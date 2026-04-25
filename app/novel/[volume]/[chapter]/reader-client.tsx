"use client"

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// ============================================================
// SMART READER NAVBAR
// Dynamic scroll positioning + Focus mode visual states
// Uses CSS transform (GPU-accelerated) instead of top (layout-triggering)
// Memoized to prevent re-renders from parent state changes
// ============================================================
export const SmartReaderNavbar = memo(function SmartReaderNavbar({ 
  volNumber, 
  isFocusMode,
  focusToggleUrl,
}: { 
  volNumber: string;
  isFocusMode: boolean;
  focusToggleUrl: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const tickingRef = useRef(false);

  // Throttled scroll handler via rAF — lightweight, no layout thrashing
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 8);
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    // Set initial state
    setIsScrolled(window.scrollY > 8);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ------------------------------------------------------------------
  // Dynamic style computation
  // ------------------------------------------------------------------
  // Position: GPU-accelerated via translateY instead of top property
  // At rest: translateY(64px) = below the 64px navbar
  // Scrolled: translateY(0) = covering the navbar
  const transformStyle = isScrolled
    ? 'translate3d(0, 0, 0)'      // top-0, GPU layer
    : 'translate3d(0, 64px, 0)';  // top-16 (64px), GPU layer

  // Background: depends on Focus state AND scroll state
  let bgClass: string;
  if (isFocusMode) {
    bgClass = 'bg-[#FDF6E3] border-b border-[#EADFCE]';
  } else if (isScrolled) {
    bgClass = 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-border shadow-sm';
  } else {
    bgClass = 'bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md border-b border-border/50';
  }

  return (
    <div 
      className={`fixed top-0 left-0 w-full h-16 z-50 flex justify-between items-center px-4 sm:px-8 transition-transform duration-300 ease-out will-change-transform ${bgClass}`}
      style={{ transform: transformStyle }}
    >
      <Link 
        href={`/novel/vol-${volNumber}`} 
        className={`flex items-center gap-2 text-sm font-bold transition-colors ${
          isFocusMode ? 'text-[#3D2B1F]/70 hover:text-[#2398f7]' : 'text-muted-foreground hover:text-[#2398f7]'
        }`}
      >
        <ArrowLeft size={18} /> ARCHIVES
      </Link>
      
      {/* Focus Toggle — uses <Link> instead of router.replace() for zero-JS navigation */}
      <Link 
        href={focusToggleUrl}
        scroll={false}
        replace
        className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full transition-colors ${
          isFocusMode 
            ? 'bg-[#3D2B1F]/10 text-[#3D2B1F] hover:bg-[#2398f7] hover:text-white' 
            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
        }`}
      >
        {isFocusMode ? (
          <><EyeOff size={14} /> FOCUS: ON</>
        ) : (
          <><Eye size={14} /> FOCUS: OFF</>
        )}
      </Link>
    </div>
  );
});

// ============================================================
// ADVANCED PROGRESS TRACKER
// Persists scroll position + paragraph checkpoint to localStorage
//
// FIXES APPLIED:
// 1. Memory Leak: setTimeout ref moved to useRef (single reference)
// 2. Memory Leak: highlight timeout cleaned up on unmount
// 3. Checkpoint: uses scrollIntoView + deferred execution for DOM readiness
// 4. Jank: replaced querySelectorAll+getBoundingClientRect with IntersectionObserver
// ============================================================
export function AdvancedProgressTracker({
  logCode,
  volume
}: {
  logCode: string;
  volume: string;
}) {
  const [mounted, setMounted] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleParagraphRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ---------------------------------------------------------------
  // CHECKPOINT RESTORATION — deferred until DOM is fully painted
  // ---------------------------------------------------------------
  useEffect(() => {
    setMounted(true);

    // Defer restoration to next animation frame + microtask to ensure
    // server-rendered <p id="frag-N"> elements are fully laid out
    const rafId = requestAnimationFrame(() => {
      // Double-rAF ensures the browser has completed paint
      const innerRafId = requestAnimationFrame(() => {
        try {
          const saved = localStorage.getItem(`affan_progress_${volume}`);
          if (!saved) return;

          const parsed = JSON.parse(saved);
          const chapterProgress = parsed[logCode];
          if (!chapterProgress || typeof chapterProgress.pIndex !== 'number') return;

          const targetElement = document.getElementById(`frag-${chapterProgress.pIndex}`);
          if (!targetElement) return;

          // Scroll the exact paragraph into the center of the viewport
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Apply visual highlight with Tailwind classes + transition
          targetElement.style.transition = 'background-color 0.5s ease, border-color 0.5s ease';
          targetElement.style.backgroundColor = 'rgba(35, 152, 247, 0.08)';
          targetElement.style.borderLeft = '3px solid rgba(35, 152, 247, 0.5)';
          targetElement.style.paddingLeft = '12px';
          targetElement.style.borderRadius = '4px';

          // Remove highlight after 3 seconds with fade-out
          highlightTimerRef.current = setTimeout(() => {
            targetElement.style.backgroundColor = 'transparent';
            targetElement.style.borderLeftColor = 'transparent';
            // Clean up inline styles after transition completes
            const cleanupTimer = setTimeout(() => {
              targetElement.style.removeProperty('transition');
              targetElement.style.removeProperty('background-color');
              targetElement.style.removeProperty('border-left');
              targetElement.style.removeProperty('padding-left');
              targetElement.style.removeProperty('border-radius');
            }, 600);
            // Store for cleanup if needed
            highlightTimerRef.current = cleanupTimer;
          }, 3000);
        } catch (e) { /* localStorage or DOM access error — fail silently */ }
      });

      // Store inner RAF ID for cleanup
      return () => cancelAnimationFrame(innerRafId);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, [logCode, volume]);

  // ---------------------------------------------------------------
  // INTERSECTION OBSERVER — tracks which paragraph is in the viewport
  // Zero layout cost compared to querySelectorAll + getBoundingClientRect
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    // Small delay to ensure paragraphs exist in DOM
    const setupTimer = setTimeout(() => {
      const article = document.getElementById('novel-article-content');
      if (!article) return;

      const paragraphs = article.querySelectorAll('p[id^="frag-"]');
      if (paragraphs.length === 0) return;

      // Observe which paragraph is closest to the top-center of viewport
      observerRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const idStr = entry.target.id.replace('frag-', '');
              const idx = parseInt(idStr, 10);
              if (!isNaN(idx)) {
                visibleParagraphRef.current = idx;
              }
            }
          }
        },
        {
          // Observe when a paragraph crosses the top 50% of the viewport
          rootMargin: '0px 0px -50% 0px',
          threshold: 0,
        }
      );

      paragraphs.forEach((p) => observerRef.current!.observe(p));
    }, 100);

    return () => {
      clearTimeout(setupTimer);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [mounted]);

  // ---------------------------------------------------------------
  // SCROLL SAVE — debounced with single ref (no closure leak)
  // Uses IntersectionObserver pIndex instead of DOM scanning
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      // Debounce: clear any pending save, schedule new one
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;
        let progressPercentage = ((scrollY + innerHeight) / scrollHeight) * 100;
        if (progressPercentage > 95) progressPercentage = 100;

        // Use the pIndex tracked by IntersectionObserver — zero layout cost
        const pIndex = visibleParagraphRef.current;

        try {
          const currentData = JSON.parse(localStorage.getItem(`affan_progress_${volume}`) || '{}');
          currentData[logCode] = {
            log_code: logCode,
            pIndex,
            scrollY,
            progressPercentage,
            timestamp: Date.now()
          };
          localStorage.setItem(`affan_progress_${volume}`, JSON.stringify(currentData));
        } catch (e) { /* localStorage full or unavailable */ }
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [mounted, logCode, volume]);

  return null;
}
