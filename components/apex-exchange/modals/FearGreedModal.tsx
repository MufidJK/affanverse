"use client";

import React, { useState } from "react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import { seedRandom, generateTimeSeries } from "@/lib/seedRandom";

interface FearGreedModalProps {
  totalMarketCap: number;
}

function getLabel(val: number): string {
  if (val <= 20) return "Extreme Fear";
  if (val <= 40) return "Fear";
  if (val <= 60) return "Neutral";
  if (val <= 80) return "Greed";
  return "Greed";
}

function getLabelColor(val: number): string {
  if (val <= 20) return "#ef4444";
  if (val <= 40) return "#f97316";
  if (val <= 60) return "#eab308";
  if (val <= 80) return "#84cc16";
  return "#22c55e";
}

export default function FearGreedModal({ totalMarketCap }: FearGreedModalProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentValue = 87;
  const rng = seedRandom("fg-hist-v1");

  // Historical values
  const yesterday = Math.round(20 + rng() * 10);
  const lastWeek = Math.round(15 + rng() * 20);
  const lastMonth = Math.round(10 + rng() * 30);
  const yearlyHigh = 92;
  const yearlyHighDate = "Jul 18, 2025";
  const yearlyLow = 5;
  const yearlyLowDate = "Feb 06, 2026";

  // Chart data: fear&greed index + Jekacoin price over ~2 years
  const fgRng = seedRandom("fg-chart-v2");
  const priceRng = seedRandom("jka-price-chart-v2");
  const chartData: { date: string; fg: number; price: number }[] = [];
  let fgVal = 45;
  let priceVal = totalMarketCap * 0.00000005; // Scaled to readable

  const days = 730; // ~2 years
  const now = new Date("2026-06-20T00:00:00Z");

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    fgVal = Math.max(2, Math.min(98, fgVal + (fgRng() - 0.48) * 12));
    priceVal = priceVal * (1 + (priceRng() - 0.47) * 0.03);

    chartData.push({
      date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      fg: Math.round(fgVal),
      price: priceVal,
    });
  }

  // Thin the data for rendering (every 3rd point)
  const thinned = chartData.filter((_, i) => i % 3 === 0);

  const fearGreedRotation = (currentValue / 100) * 180;

  const faqs = [
    {
      q: "What is the Affanverse Fear and Greed Index?",
      a: "The Affanverse Fear and Greed Index is a proprietary tool that measures the prevailing sentiment in the cryptocurrency market within the Affanverse ecosystem. This index ranges from 0 to 100, where a lower value indicates extreme fear, and a higher value indicates extreme greed. It helps investors understand the emotional state of the market, which can influence buying and selling behaviors.",
    },
    {
      q: "How can I use this index?",
      a: "You can use this index as a contrarian indicator. When the market is in extreme fear, it may present buying opportunities as assets are potentially undervalued. When the market is in extreme greed, it may be a signal to take profits as assets may be overvalued. It's best used alongside other fundamental and technical analysis tools.",
    },
    {
      q: "How is this index calculated?",
      a: "The index aggregates multiple data points including price volatility, trading volume momentum, social media sentiment analysis, market dominance shifts, and overall market cap trends. Each factor is weighted to produce a composite score between 0 (extreme fear) and 100 (extreme greed).",
    },
    {
      q: "Can I get this data through an API?",
      a: "Yes! The Affanverse API provides real-time and historical Fear & Greed Index data. Check the API documentation for endpoints, rate limits, and integration guides.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section: Sidebar + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Left Sidebar */}
        <div className="space-y-4">
          {/* Gauge */}
          <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-wider font-medium mb-3">
              Affanverse Fear and Greed Index
            </div>
            <div className="flex justify-center">
              <div className="relative w-[140px] aspect-[2/1]">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 21.72 21.72" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="butt" />
                  <path d="M 21.72 21.72 A 40 40 0 0 1 50 10" fill="none" stroke="#f97316" strokeWidth="10" strokeLinecap="butt" />
                  <path d="M 50 10 A 40 40 0 0 1 78.28 21.72" fill="none" stroke="#eab308" strokeWidth="10" strokeLinecap="butt" />
                  <path d="M 78.28 21.72 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="butt" />
                  <circle
                    cx="10" cy="50" r="5"
                    className="fill-white dark:fill-[#0b0e14]"
                    stroke={getLabelColor(currentValue)}
                    strokeWidth="2.5"
                    transform={`rotate(${fearGreedRotation}, 50, 50)`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-white leading-none">{currentValue}</span>
                  <span className="text-xs font-bold" style={{ color: getLabelColor(currentValue) }}>
                    {getLabel(currentValue)}
                  </span>
                </div>
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
                <div key={row.label} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 dark:text-white/50">{row.label}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getLabelColor(row.value)}20`,
                      color: getLabelColor(row.value),
                    }}
                  >
                    {getLabel(row.value)} - {row.value}
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  Greed - {yearlyHigh}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-white/50 text-xs">Yearly Low ({yearlyLowDate})</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">
                  Extreme Fear - {yearlyLow}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Main Chart */}
        <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Fear and Greed Index Chart</h3>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-white/50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Fear and Greed Index</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/60" /> Jekacoin Price</span>
            </div>
          </div>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                <ComposedChart data={thinned} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fgAreaGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

                  {/* Background reference bands */}
                  <ReferenceArea y1={75} y2={100} fill="#22c55e" fillOpacity={0.08} yAxisId="fg" />
                  <ReferenceArea y1={50} y2={75} fill="#84cc16" fillOpacity={0.05} yAxisId="fg" />
                  <ReferenceArea y1={25} y2={50} fill="#f97316" fillOpacity={0.05} yAxisId="fg" />
                  <ReferenceArea y1={0} y2={25} fill="#ef4444" fillOpacity={0.08} yAxisId="fg" />

                  {/* Band labels on right side */}
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    interval={Math.floor(thinned.length / 6)}
                  />
                  <YAxis
                    yAxisId="price"
                    orientation="left"
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 }).format(v)
                    }
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    label={{ value: "USD", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 10, dx: -5 }}
                  />
                  <YAxis
                    yAxisId="fg"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    label={{ value: "F&G", angle: 90, position: "insideRight", fill: "rgba(255,255,255,0.3)", fontSize: 10, dx: 5 }}
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

                  {/* Jekacoin price line */}
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="price"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1.5}
                    dot={false}
                    name="Jekacoin Price"
                    isAnimationActive={false}
                  />

                  {/* Fear & Greed line */}
                  <Area
                    yAxisId="fg"
                    type="monotone"
                    dataKey="fg"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#fgAreaGreen)"
                    fillOpacity={1}
                    name="Fear & Greed"
                    isAnimationActive={false}
                  />
                </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Band labels */}
          <div className="flex items-center justify-end gap-3 mt-2 text-[10px] text-zinc-500 dark:text-white/40">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-emerald-500/30" /> Extreme Greed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-lime-500/20" /> Greed</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-orange-500/20" /> Fear</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-red-500/30" /> Extreme Fear</span>
          </div>
        </div>
      </div>

      {/* Bottom: FAQ Accordion */}
      <div className="bg-white dark:bg-[#111827]/50 rounded-xl border border-gray-200 dark:border-white/10 p-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          About Apex Exchange Fear and Greed Index
        </h3>
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-center justify-between py-4 text-left hover:opacity-80 transition-opacity"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-zinc-500 dark:text-white/50 transition-transform duration-200 flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="pb-4 text-sm text-zinc-600 dark:text-white/60 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
