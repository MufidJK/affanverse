"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkline } from "./Sparkline";
import { DynamicMarketAsset, ChaosEventState } from "@/types/apex";

interface MarketTableProps {
  liveAssets: DynamicMarketAsset[];
  isMounted: boolean;
  chaosState: ChaosEventState | null;
}

type SortField = "rank" | "price" | "marketCap" | "24h" | "1h" | "7d" | "volume" | "supply" | "volatility";
type SortOrder = "asc" | "desc";

// ── Chaos Marquee Banner (SOP Rule 6: Framer Motion only, no CSS @keyframes for long scroll) ──
function ChaosMarquee({ title }: { title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(2000);

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2);
    }
  }, [title]);

  const repeatedText = `${title}   ///   ${title}   ///   ${title}   ///   ${title}   ///   `;

  return (
    <div className="relative w-full overflow-hidden border-b border-red-500/30 dark:border-[#ef4444]/30 bg-red-50/80 dark:bg-[#ef4444]/5 py-3">
      <motion.div
        ref={containerRef}
        className="whitespace-nowrap font-mono text-sm font-bold text-red-600 dark:text-[#ef4444] will-change-transform transform-gpu px-4"
        animate={{ x: [0, -contentWidth] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {repeatedText}{repeatedText}
      </motion.div>
    </div>
  );
}

export function MarketTable({ liveAssets, isMounted, chaosState }: MarketTableProps) {
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedAssets = [...liveAssets].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    switch (sortField) {
      case "rank":
        valA = a.rank; valB = b.rank; break;
      case "price":
        valA = a.current_price; valB = b.current_price; break;
      case "marketCap":
        valA = a.dynamic_market_cap; valB = b.dynamic_market_cap; break;
      case "1h":
        valA = parseFloat(a.base_1h_change); valB = parseFloat(b.base_1h_change); break;
      case "24h":
        valA = parseFloat(a.base_24h_change); valB = parseFloat(b.base_24h_change); break;
      case "7d":
        valA = parseFloat(a.base_7d_change); valB = parseFloat(b.base_7d_change); break;
      case "volume":
        valA = parseFloat(a.base_volume_24h); valB = parseFloat(b.base_volume_24h); break;
      case "supply":
        valA = parseFloat(a.circulating_supply); valB = parseFloat(b.circulating_supply); break;
      case "volatility":
        valA = parseFloat(a.volatility_index); valB = parseFloat(b.volatility_index); break;
    }
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatCompactCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatCompactNumber = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const renderPercentage = (value: number) => {
    const isUp = value > 0;
    return (
      <span className={`font-mono ${isUp ? "text-green-600 dark:text-[#2398f7]" : "text-red-600 dark:text-[#ef4444]"}`}>
        {isUp ? "+" : ""}{value.toFixed(2)}%
      </span>
    );
  };

  // Determine if chaos is active for glitch effect
  const isChaosActive = chaosState?.phase === "active";

  if (!isMounted) {
    return (
      <div className="w-full p-8 text-center text-[#2398f7] font-mono animate-pulse">
        Initializing Volatility Engine...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto text-zinc-900 dark:text-white">
        {/* ── Chaos Event Marquee (conditional render per SOP Rule 9) ── */}
        {chaosState !== null && (
          <ChaosMarquee title={chaosState.event.title} />
        )}
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 text-sm font-medium text-zinc-500 dark:text-white/50 uppercase tracking-wider">
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("rank")}>
                # {sortField === "rank" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4">Asset</th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("price")}>
                Price {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("1h")}>
                1h % {sortField === "1h" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("24h")}>
                24h % {sortField === "24h" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("7d")}>
                7d % {sortField === "7d" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("marketCap")}>
                Market Cap {sortField === "marketCap" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("volume")}>
                Volume (24h) {sortField === "volume" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4 cursor-pointer hover:text-zinc-900 dark:hover:text-white" onClick={() => handleSort("supply")}>
                Circulating Supply {sortField === "supply" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-4 px-4">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset, index) => {
              const isUp = asset.price_direction === "up";
              const isDown = asset.price_direction === "down";
              const colorClass = isUp ? "text-green-600 dark:text-[#2398f7]" : isDown ? "text-red-600 dark:text-[#ef4444]" : "text-zinc-900 dark:text-white";
              const change7d = parseFloat(asset.base_7d_change);
              const is7dUp = change7d > 0;

              return (
                <tr
                  key={asset.id}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transform-gpu transition-colors duration-300"
                >
                  <td className="py-4 px-4 text-zinc-500 dark:text-white/50">{asset.rank}</td>
                  <td className="py-4 px-4">
                    <Link href={`/apex-exchange/${asset.ticker}`} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                        <Image
                          src={asset.image_url}
                          alt={asset.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                          priority={index < 3}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{asset.name}</span>
                        <span className="text-xs font-medium text-zinc-400 dark:text-white/40 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">{asset.ticker}</span>
                      </div>
                    </Link>
                  </td>
                  <td className={`py-4 px-4 font-mono transition-colors duration-300 ${colorClass} ${isChaosActive ? "chaos-glitch" : ""}`}>
                    {formatCurrency(asset.current_price)}
                  </td>
                  <td className="py-4 px-4">
                    {renderPercentage(parseFloat(asset.base_1h_change))}
                  </td>
                  <td className="py-4 px-4">
                    {renderPercentage(parseFloat(asset.base_24h_change))}
                  </td>
                  <td className="py-4 px-4">
                    {renderPercentage(parseFloat(asset.base_7d_change))}
                  </td>
                  <td className={`py-4 px-4 font-mono text-zinc-700 dark:text-white/80 ${isChaosActive ? "chaos-glitch" : ""}`}>
                    {formatCompactCurrency(asset.dynamic_market_cap)}
                  </td>
                  <td className="py-4 px-4 font-mono text-zinc-700 dark:text-white/80">
                    {formatCompactCurrency(parseFloat(asset.base_volume_24h))}
                  </td>
                  <td className="py-4 px-4 font-mono text-zinc-700 dark:text-white/80">
                    {formatCompactNumber(parseFloat(asset.circulating_supply))} {asset.ticker}
                  </td>
                  <td className="py-4 px-4">
                    <Sparkline data={asset.sparkline_data} className={is7dUp ? "text-green-500 dark:text-[#2398f7]" : "text-red-500 dark:text-[#ef4444]"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
