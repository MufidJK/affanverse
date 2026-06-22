"use client";

import React from "react";
import Image from "next/image";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ApexMarketAsset } from "@/types/apex";
import { seedRandom } from "@/lib/seedRandom";

interface AltcoinSeasonModalProps {
  assets: ApexMarketAsset[];
}

export default function AltcoinSeasonModal({ assets }: AltcoinSeasonModalProps) {
  const currentValue = 67;
  const rng = seedRandom("altsea-hist-v1");


  // Historical
  const yesterday = Math.round(currentValue - 2 + rng() * 4);
  const lastWeek = Math.round(currentValue - 15 + rng() * 20);
  const lastMonth = Math.round(currentValue - 25 + rng() * 30);
  const yearlyHigh = 78;
  const yearlyHighDate = "Sep 20, 2025";
  const yearlyLow = 14;
  const yearlyLowDate = "Dec 19, 2025";

  // Season index line chart (90 days)
  const chartRng = seedRandom("altsea-chart-v2");
  let seasonVal = 50;
  const seasonData: { date: string; season: number; altcoinMc: number }[] = [];
  let altMcVal = 900e9;
  const now = new Date("2026-06-20T00:00:00Z");

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    seasonVal = Math.max(5, Math.min(95, seasonVal + (chartRng() - 0.48) * 8));
    altMcVal = altMcVal * (1 + (chartRng() - 0.47) * 0.015);
    seasonData.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      season: Math.round(seasonVal),
      altcoinMc: altMcVal,
    });
  }

  // 50 coins performance (90 days) — deterministic seeded
  const performanceData = assets.map((asset) => {
    const assetRng = seedRandom(`perf90-${asset.id}`);
    // Range: -50% to +1500%, weighted towards moderate gains
    const raw = assetRng();
    let perf: number;
    if (raw < 0.1) {
      perf = -50 + assetRng() * 45; // -50 to -5
    } else if (raw < 0.5) {
      perf = -5 + assetRng() * 110; // -5 to +105
    } else if (raw < 0.85) {
      perf = 100 + assetRng() * 400; // +100 to +500
    } else {
      perf = 500 + assetRng() * 1000; // +500 to +1500
    }
    return { asset, perf };
  }).sort((a, b) => b.perf - a.perf);

  const maxPerf = performanceData[0].perf;

  // Color based on performance
  function getBarColor(perf: number): string {
    if (perf >= 500) return "#22ff77"; // neon green
    if (perf >= 100) return "#22c55e"; // green
    if (perf >= 0) return "#4ade80";   // light green
    return "#ef4444";                   // red
  }

  const formatCompact = (v: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v);

  return (
    <div className="space-y-6">
      {/* Top Section: Sidebar + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Current Value */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium mb-2">
              Affanverse Altcoin Season Index
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
              {currentValue}<span className="text-base font-normal text-zinc-500 dark:text-white/50">/100</span>
            </div>

            {/* Slider bar */}
            <div className="mt-3 relative">
              <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/50 mb-1">
                <span>Jekacoin Season</span>
                <span>Altcoin Season</span>
              </div>
              <div className="relative w-full h-2.5 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-orange-500" />
                <div className="flex-1 bg-orange-300" />
                <div className="flex-1 bg-sky-300" />
                <div className="flex-1 bg-sky-500 dark:bg-[#2398f7]" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-400 dark:border-white/50 rounded-full shadow-sm"
                  style={{ left: `calc(${currentValue}% - 8px)` }}
                />
              </div>
            </div>
          </div>

          {/* Historical Values */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Historical Values</h3>
            <div className="space-y-2">
              {[
                { label: "Yesterday", value: yesterday },
                { label: "Last Week", value: lastWeek },
                { label: "Last Month", value: lastMonth },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-white/50">{row.label}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    row.value >= 50
                      ? "bg-sky-500/20 text-sky-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly High and Low */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Yearly High and Low</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-white/50 text-xs">Yearly High ({yearlyHighDate})</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                  Altcoin Season - {yearlyHigh}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-white/50 text-xs">Yearly Low ({yearlyLowDate})</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                  Bitcoin Season - {yearlyLow}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Season Index Chart */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Altcoin Season Index Chart</h3>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-white/50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Altcoin Season Index</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Altcoin Market Cap</span>
            </div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <ComposedChart data={seasonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  interval={Math.floor(seasonData.length / 5)}
                />
                <YAxis
                  yAxisId="season"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <YAxis
                  yAxisId="mc"
                  orientation="left"
                  tickFormatter={(v: number) => formatCompact(v)}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  label={{ value: "AMC", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 10, dx: -5 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f2e",
                    border: "1px solid rgba(35,152,247,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                {/* Altcoin market cap area */}
                <Area
                  yAxisId="mc"
                  type="monotone"
                  dataKey="altcoinMc"
                  stroke="#22c55e"
                  strokeWidth={1.5}
                  fill="#22c55e"
                  fillOpacity={0.1}
                  name="Altcoin MC"
                  isAnimationActive={false}
                />
                {/* Season index line */}
                <Line
                  yAxisId="season"
                  type="monotone"
                  dataKey="season"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  name="Season Index"
                  isAnimationActive={false}
                />

                {/* Reference labels */}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-end gap-4 mt-2 text-[10px] text-zinc-500 dark:text-white/40">
            <span>Altcoin Season (≥75)</span>
            <span>Bitcoin Season (≤25)</span>
          </div>
        </div>
      </div>

      {/* Bottom: Top 50 Coins Performance Over 90 Days */}
      <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Top 50 Coins Performance Over 90 Days
        </h3>
        <div className="space-y-1">
          {performanceData.map(({ asset, perf }, i) => {
            const barWidth = Math.max(2, (Math.abs(perf) / maxPerf) * 100);
            const isPositive = perf >= 0;
            return (
              <div key={asset.id} className="flex items-center gap-2 py-1 group hover:bg-white/[0.02] rounded transition-colors">
                {/* Bar */}
                <div className="flex-1 relative h-7 flex items-center">
                  <div
                    className="h-full rounded-r-md transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: getBarColor(perf),
                      minWidth: "4px",
                    }}
                  />
                </div>
                {/* Label */}
                <div className="flex items-center gap-1.5 w-[220px] flex-shrink-0 justify-end">
                  <span className={`text-xs font-mono font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}{perf.toFixed(2)}%
                  </span>
                  <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                    <Image src={asset.image_url} alt={asset.name} fill className="object-cover" sizes="20px" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate max-w-[80px]">{asset.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
