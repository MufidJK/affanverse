"use client"

import React, { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// ============================================================
// SMART READER NAVBAR
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

    setIsScrolled(window.scrollY > 8);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transformStyle = isScrolled
    ? 'translate3d(0, 0, 0)'      
    : 'translate3d(0, 64px, 0)';  

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
        href={`/ambasuke/vol-${volNumber}`} 
        className={`flex items-center gap-2 text-sm font-bold transition-colors ${
          isFocusMode ? 'text-[#3D2B1F]/70 hover:text-[#2398f7]' : 'text-muted-foreground hover:text-[#2398f7]'
        }`}
      >
        <ArrowLeft size={18} /> ARCHIVES
      </Link>
      
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
// ============================================================
export function AdvancedProgressTracker({
  slug,
  volume
}: {
  slug: string;
  volume: string;
}) {
  const [mounted, setMounted] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleParagraphRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setMounted(true);

    const rafId = requestAnimationFrame(() => {
      const innerRafId = requestAnimationFrame(() => {
        try {
          const saved = localStorage.getItem(`affan_ambasuke_progress_${volume}`);
          if (!saved) return;

          const parsed = JSON.parse(saved);
          const chapterProgress = parsed[slug];
          if (!chapterProgress || typeof chapterProgress.pIndex !== 'number') return;

          const targetElement = document.getElementById(`frag-${chapterProgress.pIndex}`);
          if (!targetElement) return;

          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

          targetElement.style.transition = 'background-color 0.5s ease, border-color 0.5s ease';
          targetElement.style.backgroundColor = 'rgba(35, 152, 247, 0.08)';
          targetElement.style.borderLeft = '3px solid rgba(35, 152, 247, 0.5)';
          targetElement.style.paddingLeft = '12px';
          targetElement.style.borderRadius = '4px';

          highlightTimerRef.current = setTimeout(() => {
            targetElement.style.backgroundColor = 'transparent';
            targetElement.style.borderLeftColor = 'transparent';
            const cleanupTimer = setTimeout(() => {
              targetElement.style.removeProperty('transition');
              targetElement.style.removeProperty('background-color');
              targetElement.style.removeProperty('border-left');
              targetElement.style.removeProperty('padding-left');
              targetElement.style.removeProperty('border-radius');
            }, 600);
            highlightTimerRef.current = cleanupTimer;
          }, 3000);
        } catch (e) { }
      });

      return () => cancelAnimationFrame(innerRafId);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, [slug, volume]);

  useEffect(() => {
    if (!mounted) return;

    const setupTimer = setTimeout(() => {
      const article = document.getElementById('novel-article-content');
      if (!article) return;

      const paragraphs = article.querySelectorAll('p[id^="frag-"]');
      if (paragraphs.length === 0) return;

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

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY;
        const scrollHeight = document.documentElement.scrollHeight;
        const innerHeight = window.innerHeight;
        let progressPercentage = ((scrollY + innerHeight) / scrollHeight) * 100;
        if (progressPercentage > 95) progressPercentage = 100;

        const pIndex = visibleParagraphRef.current;

        try {
          const currentData = JSON.parse(localStorage.getItem(`affan_ambasuke_progress_${volume}`) || '{}');
          currentData[slug] = {
            slug: slug,
            pIndex,
            scrollY,
            progressPercentage,
            timestamp: Date.now()
          };
          localStorage.setItem(`affan_ambasuke_progress_${volume}`, JSON.stringify(currentData));
        } catch (e) { }
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
  }, [mounted, slug, volume]);

  return null;
}
