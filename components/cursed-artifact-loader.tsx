"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

// ─────────────────────────────────────────────────────────────────────
// THREE.Clock Deprecation Suppression
//
// The warning "THREE.Clock: This module has been deprecated. Please use
// THREE.Timer instead" comes from @react-three/fiber v9.6.0 internals.
// R3F creates a new THREE.Clock() in its render loop — we can't change
// that from userland. This patch intercepts the console.warn call and
// filters out the specific Clock deprecation message.
//
// This runs BEFORE the dynamic import loads R3F, so the patch is in
// place when R3F's Clock instantiation fires.
// ─────────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  // ── FIX: Guard with globalThis sentinel so HMR doesn't re-wrap ──
  // Without this, each Turbopack hot-reload wraps console.warn in
  // another closure layer, creating an O(n) chain that never GCs.
  const g = globalThis as any;
  if (!g.__clockWarnPatched) {
    g.__clockWarnPatched = true;
    const _warn = console.warn;
    console.warn = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("THREE.Clock") &&
        args[0].includes("deprecated")
      ) {
        return; // silently swallow
      }
      _warn.apply(console, args);
    };
  }
}

// ─────────────────────────────────────────────────────────────────────
// Dynamic Import with SSR: false
//
// MUST live in a "use client" component — Next.js 16 Turbopack does
// not allow ssr: false in Server Components.
//
// This prevents the entire Three.js + R3F + drei dependency tree
// (~600+ modules) from entering the Turbopack server compilation
// graph, which was causing hundreds of MB of Node.js heap growth
// during HMR re-evaluation.
// ─────────────────────────────────────────────────────────────────────
const CursedArtifactInner = dynamic(
  () =>
    import("@/components/cursed-artifact").then((mod) => mod.CursedArtifact),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-24 bg-zinc-950 flex items-center justify-center">
        <div className="h-[500px] w-full max-w-7xl mx-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 animate-pulse flex items-center justify-center">
          <p className="text-[#2398f7] font-mono text-sm tracking-widest uppercase animate-pulse">
            Loading artifact...
          </p>
        </div>
      </div>
    ),
  }
);

export function CursedArtifactLoader() {
  return <CursedArtifactInner />;
}
