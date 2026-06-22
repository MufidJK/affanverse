"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie,
  ResponsiveContainer,
} from "recharts";
import { ApexMarketAsset } from "@/types/apex";
import { generateTimeSeries, seedRandom, seededRange } from "@/lib/seedRandom";

interface GlobalMarketCapModalProps {
  assets: ApexMarketAsset[];
  totalMarketCap: number;
}

const formatCompact = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val);

const formatAxis = (val: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(val);

export default function GlobalMarketCapModal({ assets, totalMarketCap }: GlobalMarketCapModalProps) {
  // --- Deterministic data generation (seeded, hydration-safe) ---
  const totalVolume = assets.reduce((sum, a) => sum + parseFloat(a.base_volume_24h), 0);
  const marketCapSeries = generateTimeSeries("global-market-cap-v1", 30, totalMarketCap * 0.92, 0.015);
  const isUpTrend = marketCapSeries[marketCapSeries.length - 1].value > marketCapSeries[0].value;

  // Jekacoin Dominance
  const jkaDom = 58.3;
  const salvDom = 9.5;
  const othersDom = 100 - jkaDom - salvDom;
  const dominanceData = [
    { name: "Jekacoin", value: jkaDom, color: "#f7931a" },
    { name: "Salvasion", value: salvDom, color: "#627eea" },
    { name: "Others", value: othersDom, color: "#2398f7" },
  ];

  // ETF Net Flow (30 days)
  const etfRng = seedRandom("etf-net-flow-v1");
  const etfData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date("2026-06-20T00:00:00Z");
    d.setDate(d.getDate() - (29 - i));
    const val = (etfRng() - 0.45) * 600e6; // range -270M to +330M
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: val,
    };
  });
  const latestEtfFlow = etfData[etfData.length - 1].value;

  // Open Interest
  const openInterestPerps = seededRange("oi-perps", 300e9, 450e9);
  const openInterestFutures = seededRange("oi-futures", 1.5e9, 4e9);

  // Implied Volatility
  const ivJekacoin = seededRange("iv-jka", 30, 60);
  const ivSalvasion = seededRange("iv-salv", 40, 80);

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Top Bar: Market Cap + Volume */}
      <div className="flex flex-wrap items-baseline gap-8 min-w-0">
        <div className="min-w-0">
          <span className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium block truncate">Market Cap</span>
          <div className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white break-words truncate">
            {formatCompact(totalMarketCap)}
          </div>
        </div>
        <div className="min-w-0">
          <span className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium block truncate">Volume</span>
          <div className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white break-words truncate">
            {formatCompact(totalVolume)}
          </div>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 overflow-hidden">
        <div className="w-full" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart data={marketCapSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mcGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUpTrend ? "#22c55e" : "#ef4444"} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={isUpTrend ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatAxis}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1f2e",
                  border: "1px solid rgba(35,152,247,0.2)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                }}
                formatter={(value) => [formatCompact(Number(value)), "Market Cap"]}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isUpTrend ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#mcGradient)"
                fillOpacity={1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] gap-4">
        {/* ETF Net Flow */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 lg:col-span-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">ETFs Net Flow</h3>
          </div>
          <div className={`text-lg font-bold mb-3 break-words truncate flex-wrap text-wrap ${latestEtfFlow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {latestEtfFlow >= 0 ? "+" : "-"}${Math.abs(latestEtfFlow / 1e6).toFixed(1)}M
            <span className="text-xs text-zinc-500 dark:text-white/40 font-normal ml-2 inline-block">Jun 18, 2026</span>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <BarChart data={etfData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f2e",
                    border: "1px solid rgba(35,152,247,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`$${(Number(value) / 1e6).toFixed(1)}M`, "Net Flow"]}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {etfData.map((entry, index) => (
                    <Cell
                      key={`etf-${index}`}
                      fill={entry.value >= 0 ? "#f59e0b" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jekacoin Dominance Donut */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Jekacoin Dominance</h3>
          <div className="flex flex-wrap items-center gap-4 mb-3 min-w-0">
            {dominanceData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-zinc-500 dark:text-white/50 truncate">{d.name}</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white break-words truncate">{d.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          {/* Segmented bar (matching CMC style) */}
          <div className="w-full h-3 rounded-full overflow-hidden flex">
            {dominanceData.map((d) => (
              <div key={d.name} style={{ width: `${d.value}%`, backgroundColor: d.color }} />
            ))}
          </div>

          <div className="mt-4" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <PieChart>
                <Pie
                  data={dominanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {dominanceData.map((entry, index) => (
                    <Cell key={`dom-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1f2e",
                    border: "1px solid rgba(35,152,247,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side: Open Interest + Implied Volatility */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Open Interest</h3>
            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase truncate block">Perpetuals</span>
                <div className="text-lg font-bold text-zinc-900 dark:text-white break-words truncate">{formatCompact(openInterestPerps)}</div>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase truncate block">Futures</span>
                <div className="text-lg font-bold text-zinc-900 dark:text-white break-words truncate">{formatCompact(openInterestFutures)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Volmex Implied Volatility</h3>
            <div className="grid grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase truncate block">Jekacoin</span>
                <div className="text-lg font-bold text-zinc-900 dark:text-white break-words truncate">{ivJekacoin.toFixed(2)}</div>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 dark:text-white/40 uppercase truncate block">Salvasion</span>
                <div className="text-lg font-bold text-zinc-900 dark:text-white break-words truncate">{ivSalvasion.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
