"use client"

import React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Mock data representing activity over the last 7 days in the Affanverse
const chartData = [
  { day: "Mon", chapters: 135, minigames: 670, queries: 1200 },
  { day: "Tue", chapters: 138, minigames: 780, queries: 1450 },
  { day: "Wed", chapters: 141, minigames: 720, queries: 1320 },
  { day: "Thu", chapters: 144, minigames: 890, queries: 1680 },
  { day: "Fri", chapters: 146, minigames: 1100, queries: 2100 },
  { day: "Sat", chapters: 148, minigames: 1420, queries: 2650 },
  { day: "Sun", chapters: 150, minigames: 1890, queries: 3200 },
]

const chartConfig = {
  chapters: {
    label: "Novel chapters sync",
    color: "#2398f7",
  },
  minigames: {
    label: "Minigame Deflections",
    color: "#10b981",
  },
  queries: {
    label: "AI Neural Queries",
    color: "#a855f7",
  },
} satisfies ChartConfig

export default function EcosystemChart() {
  return (
    <div className="w-full h-[320px] pt-4">
      <ChartContainer config={chartConfig} className="w-full h-full aspect-auto">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorChapters" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2398f7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2398f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMinigames" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/50 dark:stroke-zinc-800/50" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="fill-zinc-500 font-mono text-[10px]"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={60}
            className="fill-zinc-500 font-mono text-[10px]"
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="chapters"
            stroke="#2398f7"
            fillOpacity={1}
            fill="url(#colorChapters)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="minigames"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorMinigames)"
            strokeWidth={1.5}
          />
          <Area
            type="monotone"
            dataKey="queries"
            stroke="#a855f7"
            fillOpacity={1}
            fill="url(#colorQueries)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
