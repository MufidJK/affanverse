"use client";

import React from "react";
import Image from "next/image";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea, ReferenceLine, ZAxis,
  ResponsiveContainer,
} from "recharts";
import { ApexMarketAsset } from "@/types/apex";
import { seedRandom } from "@/lib/seedRandom";

interface CryptoRSIModalProps {
  assets: ApexMarketAsset[];
}

interface RSIDataPoint {
  name: string;
  ticker: string;
  mc: number;
  rsi14: number;
  rsi7: number;
  rsi30: number;
  rsi1h: number;
  rsi4h: number;
  rsi24h: number;
  imageUrl: string;
  fill: string;
}

function getRSIColor(rsi: number): string {
  if (rsi >= 70) return "#ef4444";
  if (rsi <= 30) return "#22c55e";
  return "#94a3b8"; // neutral gray
}

function getRSIStatus(rsi: number): { text: string; color: string } {
  if (rsi >= 70) return { text: "Overbought", color: "#ef4444" };
  if (rsi <= 30) return { text: "Oversold", color: "#22c55e" };
  return { text: "Neutral", color: "#94a3b8" };
}

export default function CryptoRSIModal({ assets }: CryptoRSIModalProps) {

  // Generate deterministic RSI data for each asset
  const rsiData: RSIDataPoint[] = assets.map((asset) => {
    const rng = seedRandom(`rsi-${asset.id}`);
    const mc = parseFloat(asset.base_price) * parseFloat(asset.circulating_supply);
    const rsi14 = 15 + rng() * 75; // 15-90
    const rsi7 = Math.max(5, Math.min(95, rsi14 + (rng() - 0.5) * 20));
    const rsi30 = Math.max(5, Math.min(95, rsi14 + (rng() - 0.5) * 15));
    const rsi1h = Math.max(5, Math.min(95, rsi14 + (rng() - 0.5) * 25));
    const rsi4h = Math.max(5, Math.min(95, rsi14 + (rng() - 0.5) * 20));
    const rsi24h = Math.max(5, Math.min(95, rsi14 + (rng() - 0.5) * 18));

    return {
      name: asset.name,
      ticker: asset.ticker,
      mc,
      rsi14,
      rsi7,
      rsi30,
      rsi1h,
      rsi4h,
      rsi24h,
      imageUrl: asset.image_url,
      fill: getRSIColor(rsi14),
    };
  });

  // Average RSI
  const avgRSI = rsiData.reduce((sum, d) => sum + d.rsi14, 0) / rsiData.length;

  // Overbought vs Oversold counts
  const overbought = rsiData.filter((d) => d.rsi14 >= 70).length;
  const oversold = rsiData.filter((d) => d.rsi14 <= 30).length;
  const overboughtPct = ((overbought / rsiData.length) * 100).toFixed(1);
  const oversoldPct = ((oversold / rsiData.length) * 100).toFixed(1);

  // Historical RSI
  const histRng = seedRandom("rsi-hist-v1");
  const yesterday = avgRSI + (histRng() - 0.5) * 8;
  const days7 = avgRSI + (histRng() - 0.5) * 12;
  const days30 = avgRSI + (histRng() - 0.5) * 15;
  const days90 = avgRSI + (histRng() - 0.5) * 20;

  const formatCompact = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(v);

  // Custom tooltip for scatter
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: RSIDataPoint }> }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1f2e] border border-[#2398f7]/20 rounded-lg p-3 text-white text-xs shadow-xl">
        <div className="font-bold text-sm mb-1">{data.name} ({data.ticker})</div>
        <div>RSI (14D): <span className="font-mono" style={{ color: getRSIColor(data.rsi14) }}>{data.rsi14.toFixed(1)}</span></div>
        <div>Market Cap: <span className="font-mono">{formatCompact(data.mc)}</span></div>
        <div>Status: <span style={{ color: getRSIStatus(data.rsi14).color }}>{getRSIStatus(data.rsi14).text}</span></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Sidebar + Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Average RSI */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium mb-1">
              Average RSI
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {avgRSI.toFixed(2)}
            </div>
            {/* Oversold/Overbought slider */}
            <div className="relative w-full h-2.5 rounded-full overflow-hidden mb-1">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-gray-400 to-red-500" />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-gray-500 rounded-full shadow"
                style={{ left: `calc(${avgRSI}% - 7px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/40">
              <span>Oversold</span>
              <span>Overbought</span>
            </div>
          </div>

          {/* Overbought vs Oversold */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Overbought vs Oversold</h3>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500 dark:text-white/50">Oversold</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-zinc-500 dark:text-white/50">Overbought</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-emerald-500">{oversoldPct}%</span>
              <span className="text-lg font-bold text-red-500">{overboughtPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden flex mt-2">
              <div className="bg-emerald-500 h-full" style={{ width: `${oversoldPct}%` }} />
              <div className="bg-red-500 h-full flex-1" />
            </div>
          </div>

          {/* Historical RSI */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Historical RSI Values</h3>
            <div className="space-y-2">
              {[
                { label: "Yesterday", value: yesterday },
                { label: "7 Days Ago", value: days7 },
                { label: "30 Days Ago", value: days30 },
                { label: "90 Days Ago", value: days90 },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-zinc-500 dark:text-white/50">{row.label}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{row.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scatter Plot */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">RSI Heatmap</h3>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                {/* Red zone: Overbought (RSI > 70) */}
                <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.08} label={{ value: "Overbought", position: "insideTopRight", fill: "rgba(239,68,68,0.5)", fontSize: 11 }} />
                {/* Green zone: Oversold (RSI < 30) */}
                <ReferenceArea y1={0} y2={30} fill="#22c55e" fillOpacity={0.08} label={{ value: "Oversold", position: "insideBottomRight", fill: "rgba(34,197,94,0.5)", fontSize: 11 }} />

                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />

                <XAxis
                  type="number"
                  dataKey="mc"
                  scale="log"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v: number) => formatCompact(v)}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  name="Market Cap"
                  label={{ value: "Market Cap ($USD)", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="rsi14"
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  name="RSI"
                  label={{ value: "Relative Strength Index", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 10, dx: -5 }}
                />
                <ZAxis range={[60, 200]} />

                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />

                <Scatter
                  data={rsiData}
                  isAnimationActive={false}
                >
                  {rsiData.map((entry, index) => (
                    <circle key={`dot-${index}`} r={6} fill={entry.fill} fillOpacity={0.8} stroke={entry.fill} strokeWidth={1} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: Market Cycle Top Indicators Table */}
      <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 overflow-x-auto">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Market Cycle Top Indicators
        </h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10 text-xs text-zinc-500 dark:text-white/50 uppercase">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2 text-right">Price</th>
              <th className="py-2 px-2 text-right">Market Cap</th>
              <th className="py-2 px-2 text-right">24h %</th>
              <th className="py-2 px-2 text-right">RSI (14D)</th>
              <th className="py-2 px-2 text-right">RSI (1h)</th>
              <th className="py-2 px-2 text-right">RSI (4h)</th>
              <th className="py-2 px-2 text-right">RSI (24h)</th>
              <th className="py-2 px-2 text-right">RSI (7d)</th>
              <th className="py-2 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {rsiData
              .sort((a, b) => b.mc - a.mc)
              .map((data, i) => {
                const status = getRSIStatus(data.rsi14);
                const asset = assets.find((a) => a.name === data.name);
                const change24h = asset ? parseFloat(asset.base_24h_change) : 0;
                const price = asset ? parseFloat(asset.base_price) : 0;

                return (
                  <tr key={data.ticker} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-zinc-500 dark:text-white/50">{i + 1}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                          <Image src={data.imageUrl} alt={data.name} fill className="object-cover" sizes="24px" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-white">{data.name}</span>
                        <span className="text-xs text-zinc-400 dark:text-white/40">{data.ticker}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-900 dark:text-white">
                      ${price < 1 ? price.toFixed(4) : price.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-700 dark:text-white/80">
                      {formatCompact(data.mc)}
                    </td>
                    <td className={`py-3 px-2 text-right font-mono ${change24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-right font-mono" style={{ color: getRSIColor(data.rsi14) }}>
                      {data.rsi14.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono" style={{ color: getRSIColor(data.rsi1h) }}>
                      {data.rsi1h.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono" style={{ color: getRSIColor(data.rsi4h) }}>
                      {data.rsi4h.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono" style={{ color: getRSIColor(data.rsi24h) }}>
                      {data.rsi24h.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono" style={{ color: getRSIColor(data.rsi7) }}>
                      {data.rsi7.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${status.color}20`, color: status.color }}
                      >
                        {status.text}
                      </span>
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
