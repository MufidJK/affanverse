"use client";

import React from "react";
import Image from "next/image";
import { ApexMarketAsset } from "@/types/apex";
import LazyChartWrapper from "@/components/apex-exchange/LazyChartWrapper";
import { useSingleAssetTicker } from "@/hooks/useSingleAssetTicker";

// ── Formatting Utilities ──
function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

function formatCompactCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatCompactNumber(val: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

// ── Change Badge Component ──
function ChangeBadge({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-mono font-semibold ${textSize} px-2 py-0.5 rounded-md ${
        isNeutral
          ? "bg-gray-100 dark:bg-zinc-800 text-zinc-500"
          : isPositive
          ? "bg-green-50 dark:bg-green-500/10 text-[#22c55e]"
          : "bg-red-50 dark:bg-red-500/10 text-[#ef4444]"
      }`}
    >
      {isPositive ? "▲" : isNeutral ? "—" : "▼"}{" "}
      {isPositive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

// ── Stat Row Component ──
function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500 dark:text-white/50">{label}</span>
      <span className="text-sm font-medium text-zinc-900 dark:text-white text-right">
        {value}
      </span>
    </div>
  );
}

export default function AssetDetailClient({ initialAsset }: { initialAsset: ApexMarketAsset }) {
  const { liveAsset, isMounted } = useSingleAssetTicker(initialAsset);

  // ── Computed Values (Dynamic) ──
  const currentPrice = liveAsset.current_price;
  const marketCap = liveAsset.dynamic_market_cap;
  const priceDirection = liveAsset.price_direction;

  // ── Computed Values (Static) ──
  const circulatingSupply = parseFloat(initialAsset.circulating_supply);
  const volume24h = parseFloat(initialAsset.base_volume_24h);
  const change1h = parseFloat(initialAsset.base_1h_change);
  const change24h = parseFloat(initialAsset.base_24h_change);
  const change7d = parseFloat(initialAsset.base_7d_change);

  const volMktCapRatio = marketCap > 0 ? volume24h / marketCap : 0;
  const maxSupply = initialAsset.max_supply ? parseFloat(initialAsset.max_supply) : null;
  const fdv = maxSupply !== null ? currentPrice * maxSupply : null;

  const ath = initialAsset.all_time_high ? parseFloat(initialAsset.all_time_high) : null;
  const atl = initialAsset.all_time_low ? parseFloat(initialAsset.all_time_low) : null;

  // Determine flash animation color for price
  const priceColorClass =
    priceDirection === "up"
      ? "text-[#22c55e]"
      : priceDirection === "down"
      ? "text-[#ef4444]"
      : "text-inherit";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white selection:bg-[#2398f7]/30 font-sans overflow-x-hidden relative">

      {/* Background Decor — static radial-gradient (AGENTS.md Rule 5: no blur on animated) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-100">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-[#2398f7]/15 to-transparent rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-300/20 dark:from-[#ef4444]/10 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto px-4 md:px-6 py-20 md:py-24">
        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* ═══════ LEFT PANEL ═══════ */}
          <div className="space-y-5">
            {/* ── 1. Asset Header ── */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
              {/* Top row: Image + Name + Badges */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                  <Image
                    src={initialAsset.image_url}
                    alt={initialAsset.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{initialAsset.name}</h1>
                    <span className="text-xs font-medium text-zinc-400 dark:text-white/40 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                      {initialAsset.ticker}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">
                    Rank #{initialAsset.rank}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className={`text-3xl font-bold tracking-tight transition-colors duration-300 ${priceColorClass}`}>
                  {isMounted ? (
                    formatCurrency(currentPrice)
                  ) : (
                    <span className="animate-pulse bg-gray-200 dark:bg-zinc-700 rounded w-48 h-8 inline-block" />
                  )}
                </p>
              </div>

              {/* Change Badges */}
              <div className="flex flex-wrap gap-2">
                <ChangeBadge value={change24h} />
                <ChangeBadge value={change1h} size="sm" />
                <ChangeBadge value={change7d} size="sm" />
              </div>
            </div>

            {/* ── 2. Market Stats Card ── */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-3">
                Market Stats
              </h3>
              <StatRow
                label="Market Cap"
                value={formatCompactCurrency(marketCap)}
              />
              <StatRow
                label="Volume (24h)"
                value={formatCompactCurrency(volume24h)}
              />
              <StatRow
                label="Vol / Mkt Cap"
                value={`${(volMktCapRatio * 100).toFixed(2)}%`}
              />
              <StatRow
                label="Circulating Supply"
                value={`${formatCompactNumber(circulatingSupply)} ${initialAsset.ticker}`}
              />
              <StatRow
                label="Max Supply"
                value={
                  maxSupply !== null
                    ? `${formatCompactNumber(maxSupply)} ${initialAsset.ticker}`
                    : "∞"
                }
              />
              <StatRow
                label="Fully Diluted Valuation"
                value={fdv !== null ? formatCompactCurrency(fdv) : "—"}
              />
            </div>

            {/* ── 3. Price History Card ── */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-3">
                Price History
              </h3>
              <StatRow
                label="All Time High"
                value={
                  <div className="text-right">
                    <span className="block font-mono">
                      {ath !== null ? formatCurrency(ath) : "—"}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-white/30">
                      {formatDate(initialAsset.all_time_high_date)}
                    </span>
                  </div>
                }
              />
              <StatRow
                label="All Time Low"
                value={
                  <div className="text-right">
                    <span className="block font-mono">
                      {atl !== null ? formatCurrency(atl) : "—"}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-white/30">
                      {formatDate(initialAsset.all_time_low_date)}
                    </span>
                  </div>
                }
              />
            </div>

            {/* ── 4. Info Card ── */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-3">
                About {initialAsset.name}
              </h3>
              {initialAsset.category && (
                <StatRow label="Category" value={initialAsset.category} />
              )}
              {initialAsset.founded_year && (
                <StatRow label="Founded" value={initialAsset.founded_year.toString()} />
              )}
              {initialAsset.description && (
                <p className="text-sm text-zinc-600 dark:text-white/60 leading-relaxed mt-3">
                  {initialAsset.description}
                </p>
              )}
              {!initialAsset.description && !initialAsset.category && !initialAsset.founded_year && (
                <p className="text-sm text-zinc-400 dark:text-white/30 italic">
                  No additional information available.
                </p>
              )}
            </div>
          </div>

          {/* ═══════ RIGHT PANEL ═══════ */}
          <div className="space-y-5">
            {/* ── 1. Chart Section (lazy loaded via client wrapper) ── */}
            <LazyChartWrapper
              ticker={initialAsset.ticker}
              name={initialAsset.name}
              basePrice={parseFloat(initialAsset.base_price)}
              volatilityIndex={initialAsset.volatility_index}
              base7dChange={change7d}
            />

            {/* ── 2. Price Performance Card ── */}
            <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-4">
                Price Performance
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* 1h */}
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-white/40 mb-1">1h</p>
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`text-xs ${
                        change1h > 0 ? "text-[#22c55e]" : change1h < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change1h > 0 ? "▲" : change1h < 0 ? "▼" : "—"}
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        change1h > 0 ? "text-[#22c55e]" : change1h < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change1h > 0 ? "+" : ""}
                      {change1h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* 24h */}
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-white/40 mb-1">24h</p>
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`text-xs ${
                        change24h > 0 ? "text-[#22c55e]" : change24h < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change24h > 0 ? "▲" : change24h < 0 ? "▼" : "—"}
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        change24h > 0 ? "text-[#22c55e]" : change24h < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change24h > 0 ? "+" : ""}
                      {change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* 7d */}
                <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
                  <p className="text-xs text-zinc-500 dark:text-white/40 mb-1">7d</p>
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`text-xs ${
                        change7d > 0 ? "text-[#22c55e]" : change7d < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change7d > 0 ? "▲" : change7d < 0 ? "▼" : "—"}
                    </span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        change7d > 0 ? "text-[#22c55e]" : change7d < 0 ? "text-[#ef4444]" : "text-zinc-400"
                      }`}
                    >
                      {change7d > 0 ? "+" : ""}
                      {change7d.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
