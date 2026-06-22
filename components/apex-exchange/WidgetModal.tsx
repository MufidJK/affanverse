"use client";

import React, { useEffect, useCallback, useRef } from "react";

interface WidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function WidgetModal({ isOpen, onClose, title, subtitle, children }: WidgetModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC key handler — STRICT REACT CLEANUP (Rule 2)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const [contentReady, setContentReady] = React.useState(false);

  useEffect(() => {
    if (!isOpen) {
      setContentReady(false);
      return;
    }
    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    // Wait for modal container to paint and have real dimensions
    let id1: number;
    let id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        setContentReady(true);
      });
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/60"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div 
        className="flex min-h-full items-start justify-center pt-16 md:pt-20 px-4 md:px-8 lg:px-12 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={containerRef}
          className="w-full max-w-[1400px] relative rounded-2xl shadow-2xl bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-[#2398f7]/20 transform-gpu will-change-transform"
          style={{ animation: "modalIn 0.2s ease-out" }}
        >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 bg-gray-50/95 dark:bg-[#0b0e14]/95 border-b border-gray-200 dark:border-white/10">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-white/50 mt-1 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {contentReady ? children : (
            <div className="flex items-center justify-center py-24">
              <span className="text-[#2398f7] font-mono animate-pulse text-sm">
                Loading data...
              </span>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Inline keyframe — only animates transform + opacity (Rule 5) */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
