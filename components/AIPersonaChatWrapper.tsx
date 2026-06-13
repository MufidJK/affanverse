"use client";

import dynamic from "next/dynamic";

// Adhering to Rule 8: Dynamic import with SSR disabled moved safely inside a Client Component wrapper
const AIPersonaChat = dynamic(() => import("@/components/AIPersonaChat"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 min-h-[600px] select-none" tabIndex={-1}>
      <div className="w-full h-[578px] rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#090d16] animate-pulse" />
    </div>
  ),
});

export default function AIPersonaChatWrapper() {
  return (
    <div className="w-full min-h-[600px]" tabIndex={-1}>
      <AIPersonaChat />
    </div>
  );
}
