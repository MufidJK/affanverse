"use client";

import React from "react";
import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { ApexMarketAsset } from "@/types/apex";
import { generateTimeSeries, seedRandom } from "@/lib/seedRandom";

interface Apex20IndexModalProps {
  assets: ApexMarketAsset[];
  apex20Value: number;
  apex20Change: number;
}

const DONUT_COLORS = [
  "#f7931a", "#627eea", "#f0b90b", "#00d4aa", "#9945ff",
  "#26a17b", "#e84142", "#2775ca", "#ff007a", "#00adef",
  "#3c3c3d", "#8dc63f", "#345d9d", "#e6007a", "#f5ac37",
  "#1a1a2e", "#6366f1", "#ec4899", "#14b8a6", "#a855f7",
];

export default function Apex20IndexModal({ assets, apex20Value, apex20Change }: Apex20IndexModalProps) {
  const rng = seedRandom("apex20-hist-v1");


  // Top 20 by market cap
  const assetsWithMc = assets.map((a) => ({
    ...a,
    mc: parseFloat(a.base_price) * parseFloat(a.circulating_supply),
  })).sort((a, b) => b.mc - a.mc);
  const top20 = assetsWithMc.slice(0, 20);
  const top20TotalMc = top20.reduce((s, a) => s + a.mc, 0);

  // Historical values
  const yesterday = apex20Value * (1 - (rng() * 0.02 - 0.005));
  const lastWeek = apex20Value * (1 - (rng() * 0.05 - 0.01));
  const lastMonth = apex20Value * (1 - (rng() * 0.12 - 0.03));
  const yearlyHigh = apex20Value * (1 + rng() * 0.8);
  const yearlyLow = apex20Value * (1 - rng() * 0.4);
  const yearlyHighDate = "Oct 07, 2025";
  const yearlyLowDate = "Jun 06, 2026";

  // Chart time-series
  const indexSeries = generateTimeSeries("apex20-index-chart-v1", 365, apex20Value * 0.7, 0.012);

  const isUp = apex20Change >= 0;

  // Constituents donut
  const donutData = top20.map((a) => ({
    name: a.ticker,
    value: a.mc / top20TotalMc * 100,
  }));

  const formatNum = (v: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v);
  const formatUsd = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: v < 1 ? 4 : 2 }).format(v);
  const formatCompact = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(v);

  return (
    <div className="space-y-6">
      {/* Top Section: Sidebar + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Current Value */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium mb-1">
              Apex20
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">
              ${formatNum(apex20Value)}
            </div>
            <span className={`inline-block mt-1 text-sm font-semibold px-2 py-0.5 rounded-full ${isUp ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
              {isUp ? "+" : ""}{formatNum(apex20Change)}% (24h)
            </span>
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
                  <span className="font-semibold text-zinc-900 dark:text-white">${formatNum(row.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Performance */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Yearly Performance</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-white/50">Yearly High ({yearlyHighDate})</span>
                <span className="font-semibold text-zinc-900 dark:text-white">${formatNum(yearlyHigh)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-white/50">Yearly Low ({yearlyLowDate})</span>
                <span className="font-semibold text-zinc-900 dark:text-white">${formatNum(yearlyLow)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Main Chart */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Apex20 Index Chart</h3>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <AreaChart data={indexSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="apex20Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  interval={Math.floor(indexSeries.length / 4)}
                />
                <YAxis
                  tickFormatter={(v: number) => `$${formatNum(v)}`}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
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
                    fontSize: 12,
                  }}
                  formatter={(value) => [`$${formatNum(Number(value))}`, "Apex20"]}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#apex20Gradient)"
                  fillOpacity={1}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Constituents Table + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Constituents Table */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Apex20 Index Constituents</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-xs text-zinc-500 dark:text-white/50 uppercase">
                <th className="py-2 px-2">#</th>
                <th className="py-2 px-2">Coin Name</th>
                <th className="py-2 px-2 text-right">Price</th>
                <th className="py-2 px-2 text-right">Price 24h %</th>
                <th className="py-2 px-2 text-right">Market Cap</th>
                <th className="py-2 px-2 text-right">Weight %</th>
              </tr>
            </thead>
            <tbody>
              {top20.map((asset, i) => {
                const change = parseFloat(asset.base_24h_change);
                const weight = (asset.mc / top20TotalMc) * 100;
                return (
                  <tr key={asset.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2 text-zinc-500 dark:text-white/50">{i + 1}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                          <Image src={asset.image_url} alt={asset.name} fill className="object-cover" sizes="24px" />
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-white">{asset.name}</span>
                        <span className="text-xs text-zinc-400 dark:text-white/40">{asset.ticker}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-900 dark:text-white">
                      {formatUsd(parseFloat(asset.base_price))}
                    </td>
                    <td className={`py-3 px-2 text-right font-mono ${change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-700 dark:text-white/80">
                      {formatCompact(asset.mc)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-900 dark:bg-white"
                            style={{ width: `${Math.min(weight, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-zinc-900 dark:text-white">{weight.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Top Constituents</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={1}
                  dataKey="value"
                  isAnimationActive={false}
                  label={(props: PieLabelRenderProps) => {
                    const name = props.name ?? "";
                    const value = Number(props.value ?? 0);
                    return value > 3 ? `${name} ${value.toFixed(1)}%` : "";
                  }}
                  labelLine={false}
                >
                  {donutData.map((_, index) => (
                    <Cell key={`d-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
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
                  formatter={(value) => [`${Number(value).toFixed(2)}%`]}
                />
                {/* Center text */}
                <text x="50%" y="48%" textAnchor="middle" className="fill-zinc-500 dark:fill-white/50 text-[10px]">
                  Total Constituents:
                </text>
                <text x="50%" y="56%" textAnchor="middle" className="fill-zinc-900 dark:fill-white text-2xl font-bold">
                  20
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
