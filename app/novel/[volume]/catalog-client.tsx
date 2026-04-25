"use client"

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

type Chapter = {
  id: string;
  volume: number;
  chapter_number: number;
  log_code: string;
  title: string;
  system_note: string | null;
};

export function DynamicChapterList({ chapters, volume }: { chapters: Chapter[], volume: string }) {
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(`affan_progress_${volume}`);
      if (saved) {
        setProgressMap(JSON.parse(saved));
      }
    } catch(e) {}
  }, [volume]);

  // Memoize expensive computation — only recompute when progressMap changes
  const mostRecentLogCode = useMemo(() => {
    let recent = '';
    let latestTime = 0;
    Object.keys(progressMap).forEach(key => {
      if (progressMap[key].timestamp > latestTime) {
        latestTime = progressMap[key].timestamp;
        recent = key;
      }
    });
    return recent;
  }, [progressMap]);

  return (
    <div className="flex flex-col gap-4">
      {chapters.map((ch) => {
        const pData = progressMap[ch.log_code];
        const progress = mounted && pData ? (pData.progressPercentage || 0) : 0;
        const isMostRecent = mounted && mostRecentLogCode === ch.log_code;

        return (
          <Link 
            id={`card-${ch.log_code}`}
            href={`/novel/vol-${volume}/${ch.log_code.toLowerCase()}`} 
            key={ch.id}
            className="relative group flex flex-row items-center justify-between p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-[#2398f7] transition-all hover:shadow-[0_4px_20px_rgba(35,152,247,0.1)] gap-6 overflow-hidden"
          >
            <div className="flex items-center gap-6 w-full min-w-0 z-10">
              <div className="relative flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex flex-col items-center justify-center border border-border group-hover:border-[#2398f7]/50 transition-colors">
                <span className="text-xs text-muted-foreground font-mono">CH</span>
                <span className="text-xl font-black text-foreground group-hover:text-[#2398f7] transition-colors">{ch.chapter_number}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-[#2398f7] transition-colors truncate">
                    {ch.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block font-mono text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                      {ch.log_code}
                    </span>
                    {progress > 95 && (
                      <CheckCircle2 className="w-4 h-4 text-[#2398f7]" />
                    )}
                    {isMostRecent && (
                      <span className="ml-3 text-[10px] font-mono text-[#2398f7] border border-[#2398f7] px-2 py-0.5 rounded animate-pulse">
                        CONTINUE READING
                      </span>
                    )}
                  </div>
                </div>
                {ch.system_note && (
                  <p className="text-sm text-muted-foreground line-clamp-1 italic">"{ch.system_note}"</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#2398f7] transition-transform group-hover:translate-x-1 flex-shrink-0 z-10" />
            
            {progress > 5 && progress <= 95 && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-[#2398f7] transition-all" style={{ width: `${progress}%` }} />
            )}
          </Link>
        );
      })}
    </div>
  );
}
