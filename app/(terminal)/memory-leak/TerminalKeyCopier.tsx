"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";

export function TerminalKeyCopier({ terminalKey }: { terminalKey: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(terminalKey);
      setCopied(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy key: ", err);
    }
  };

  // SOP Rule 2: Strict React Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 mt-2 p-2 bg-black/60 border border-red-900/50 rounded group hover:border-[#FF00FF]/50 transition-colors shadow-[0_0_10px_rgba(255,0,255,0)] hover:shadow-[0_0_10px_rgba(255,0,255,0.15)]">
      <div className="text-[#FF00FF] font-bold tracking-widest text-lg font-mono selection:bg-white selection:text-black">
        {terminalKey}
      </div>
      <button
        onClick={handleCopy}
        className="p-2 text-gray-400 hover:text-[#FF00FF] hover:bg-[#FF00FF]/10 rounded transition-all active:scale-95"
        title="Copy to clipboard"
        aria-label="Copy terminal key"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </div>
  );
}
