"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateTimeSeries } from "@/lib/seedRandom";

interface AssetPriceChartProps {
  ticker: string;
  name: string;
  basePrice: number;
  volatilityIndex: string;
  base7dChange: number;
}

type Timeframe = "1D" | "7D" | "1M" | "1Y";

const TIMEFRAME_CONFIG: Record<Timeframe, { count: number; label: string }> = {
  "1D": { count: 24, label: "1D" },
  "7D": { count: 7, label: "7D" },
  "1M": { count: 30, label: "1M" },
  "1Y": { count: 365, label: "1Y" },
};

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const formatCompactCurrency = (val: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(val);

export default function AssetPriceChart({
  ticker,
  name,
  basePrice,
  volatilityIndex,
  base7dChange,
}: AssetPriceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("7D");

  // ── Double-rAF guard (AGENTS.md Rule 2) ──
  // Prevents Recharts width=-1 warning by waiting for layout paint
  const [chartReady, setChartReady] = useState<boolean>(false);
  useEffect(() => {
    let id1: number;
    let id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setChartReady(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, []);

  // ── Generate deterministic chart data ──
  const chartData = useMemo(() => {
    const config = TIMEFRAME_CONFIG[activeTimeframe];
    const seed = `${ticker}-${activeTimeframe}-chart-v1`;
    const volatility = (parseFloat(volatilityIndex) / 100) * 0.8;
    const rawData = generateTimeSeries(seed, config.count, basePrice, volatility);

    // For 1Y, thin to every 3rd point for performance
    if (activeTimeframe === "1Y") {
      return rawData.filter((_, i) => i % 3 === 0);
    }
    return rawData;
  }, [ticker, activeTimeframe, basePrice, volatilityIndex]);

  const isPositive = base7dChange > 0;
  const chartColor = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `chart-gradient-${ticker}`;

  return (
    <div className="bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5">
      {/* Chart Title */}
      <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">
        {name} Price Chart
      </h2>

      {/* Timeframe Tabs */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(TIMEFRAME_CONFIG) as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTimeframe === tf
                ? "bg-[#2398f7] text-white"
                : "bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            {TIMEFRAME_CONFIG[tf].label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      {chartReady ? (
        <div className="w-full h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickFormatter={(val: number) => formatCompactCurrency(val)}
                width={60}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(24, 24, 27, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
                formatter={(value: any) => [formatCurrency(Number(value)), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center">
          <div className="text-[#2398f7] font-mono animate-pulse text-sm">
            Rendering Chart...
          </div>
        </div>
      )}
    </div>
  );
}
