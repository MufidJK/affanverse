"use client";

import dynamic from "next/dynamic";

// ── AGENTS.md Rule 8: Lazy-load chart (heavy Recharts bundle) ──
// This wrapper is a Client Component so that dynamic() with ssr:false works.
// Next.js 16 disallows ssr:false in Server Components.
const AssetPriceChart = dynamic(
  () => import("@/components/apex-exchange/AssetPriceChart"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 h-[480px] flex items-center justify-center">
        <div className="text-[#2398f7] font-mono animate-pulse text-sm">
          Loading Chart Module...
        </div>
      </div>
    ),
  }
);

interface LazyChartWrapperProps {
  ticker: string;
  name: string;
  basePrice: number;
  volatilityIndex: string;
  base7dChange: number;
}

export default function LazyChartWrapper(props: LazyChartWrapperProps) {
  return <AssetPriceChart {...props} />;
}
