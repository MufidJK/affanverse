"use client";

import dynamic from "next/dynamic";

// Nah, dynamic import pake ssr: false HARUS di dalam file "use client"
const IntercelestialWrapper = dynamic(
  () => import("@/components/intercelestial/IntercelestialWrapper").then(mod => mod.IntercelestialWrapper),
  { ssr: false }
);

export default function IntercelestialClient() {
  return (
    <IntercelestialWrapper />
  );
}