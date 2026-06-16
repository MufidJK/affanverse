"use client"

import React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  BookOpen,
  Layers,
  Gamepad2,
  Terminal,
  Activity,
  ArrowUpRight,
  Database,
  Cpu,
  RefreshCw,
  Search,
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Lazy-load EcosystemChart with SSR disabled to prevent hydration mismatches and save initial bundle size
const EcosystemChart = dynamic(() => import("./components/EcosystemChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] flex flex-col items-center justify-center text-xs font-medium text-muted-foreground animate-pulse">
      <RefreshCw className="h-4 w-4 animate-spin mb-2 text-[#2398f7]" />
      <span>INITIALIZING NEURAL GRID FEED...</span>
    </div>
  ),
})

// TypeScript interfaces for our state and data structures (Strict Compliance with Rule 10)
interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  description: string
  icon: React.ReactNode
  isActive?: boolean
}

interface ActivityItem {
  id: string
  timestamp: string
  event: string
  source: "novel_chapters" | "ambasuke_chapters" | "minigame_scores" | "system" | "minigame_runner" | "ai_backend" | "minigame_audio" | "minigame_ambasuke"
  status: "SYNCED" | "NEW_RECORD" | "ANOMALY" | "MAINTENANCE" | "OPTIMIZED" | "SYSTEM_LOG"
  details: string
}

interface DiagnosticItem {
  name: string
  value: string
  status: "optimal" | "warning" | "stable"
}

// Lore-accurate mock data structures
const mockMetrics: MetricCardProps[] = [
  {
    title: "Apex Core Logs",
    value: "150",
    unit: "Chapters",
    description: "Total entries recorded in the novel_chapters index",
    icon: <BookOpen className="h-4 w-4" />,
    isActive: true,
  },
  {
    title: "Protocol Archives",
    value: "21",
    unit: "Chapters",
    description: "Total entries compiled in the ambasuke_chapters index",
    icon: <Layers className="h-4 w-4" />,
    isActive: false,
  },
  {
    title: "Anomaly Deflections",
    value: "67,420",
    unit: "Actions",
    description: "Total high-score defenses recorded in minigame_scores",
    icon: <Gamepad2 className="h-4 w-4" />,
    isActive: true,
  },
  {
    title: "Cognitive Stability",
    value: "98.7",
    unit: "% Sync",
    description: "AI Persona neural feedback loop alignment metrics",
    icon: <Terminal className="h-4 w-4" />,
    isActive: false,
  },
]

const recentActivities: ActivityItem[] = [
  {
    id: "act-1",
    timestamp: "00:54:12Z",
    event: "New High Score Registered",
    source: "minigame_scores",
    status: "NEW_RECORD",
    details: "Elio_Zaynezz scored 120,670 pts in Affan Strike",
  },
  {
    id: "act-2",
    timestamp: "22:15:00Z",
    event: "Chapter Synchronization Completed",
    source: "novel_chapters",
    status: "SYNCED",
    details: "Chapter 150: 'The End of All Authority' synced to Supabase",
  },
  {
    id: "act-3",
    timestamp: "19:30:22Z",
    event: "Spinoff Chronology Update",
    source: "ambasuke_chapters",
    status: "SYNCED",
    details: "Ambasuke Vol 7 Chapter 21: 'Ambasuke vs Author' compiled",
  },
  {
    id: "act-4",
    timestamp: "15:45:10Z",
    event: "Anomaly Deflection Triggered",
    source: "system",
    status: "ANOMALY",
    details: "Sub-level 67 integrity breach deflected automatically",
  },
  {
    id: "act-5",
    timestamp: "12:00:00Z",
    event: "Database Index Rebuild",
    source: "system",
    status: "MAINTENANCE",
    details: "Supabase connection pool reset and performance optimized",
  },
  {
    id: "act-6",
    timestamp: "08:12:45Z",
    event: "Gravity Shift Overload",
    source: "minigame_runner",
    status: "NEW_RECORD",
    details: "Gravity Shift executed 500 times in a single run",
  },
  {
    id: "act-7",
    timestamp: "07:30:10Z",
    event: "VRAM Garbage Collection",
    source: "system",
    status: "OPTIMIZED",
    details: "WebGL memory dump executed via SOP #3 - 1.2GB VRAM freed",
  },
  {
    id: "act-8",
    timestamp: "06:45:33Z",
    event: "Claude Opus Core Update",
    source: "ai_backend",
    status: "SYSTEM_LOG",
    details: "Agent.py AI Persona strictly updated with Volume 7 lore",
  },
  {
    id: "act-9",
    timestamp: "05:15:22Z",
    event: "Audio Memory Leak Prevented",
    source: "minigame_audio",
    status: "OPTIMIZED",
    details: "AudioContext AbortError completely mitigated across 12 active tabs",
  },
  {
    id: "act-10",
    timestamp: "04:50:05Z",
    event: "Max Combo Achievement",
    source: "minigame_ambasuke",
    status: "NEW_RECORD",
    details: "Ambasuke Protocol Hack & Slash max combo reached (999 Hits)",
  },
  {
    id: "act-11",
    timestamp: "03:22:18Z",
    event: "Data Fragment Surge",
    source: "minigame_runner",
    status: "ANOMALY",
    details: "Data Fragments collected threshold breached by User_Xero",
  },
  {
    id: "act-12",
    timestamp: "02:10:00Z",
    event: "Turbopack Bundler Sync",
    source: "system",
    status: "SYNCED",
    details: "Next.js 16 incremental build finished in 450ms",
  },
  {
    id: "act-13",
    timestamp: "01:05:40Z",
    event: "Framer Motion Profiling",
    source: "system",
    status: "MAINTENANCE",
    details: "Refactored continuous keyframes to RequestAnimationFrame sync",
  },
  {
    id: "act-14",
    timestamp: "00:30:12Z",
    event: "Novel Indexing Complete",
    source: "novel_chapters",
    status: "SYNCED",
    details: "Batch upload of Chapters 151-155 initialized without timeout",
  },
  {
    id: "act-15",
    timestamp: "23:45:00Z",
    event: "Flappy Affan Record Broken",
    source: "minigame_scores",
    status: "NEW_RECORD",
    details: "Top score of 4,200 pipes cleared without collision",
  }
]

const diagnosticStats: DiagnosticItem[] = [
  { name: "Supabase Pool", value: "Singleton Active", status: "optimal" },
  { name: "WebGL Frameloop", value: "Demand-Driven (Auto)", status: "optimal" },
  { name: "CSS Animation Filters", value: "Backdrop-Blur Suspended", status: "stable" },
  { name: "VSync Frame Sync", value: "Framer Motion Active", status: "optimal" },
  { name: "Initial Bundle Size", value: "Optimized (Dynamic)", status: "optimal" },
  { name: "DB Sync Connection", value: "67ms Latency", status: "stable" },
  { name: "RAM Saver SOP", value: "Enforced", status: "optimal" },
]

export default function NexusDashboard() {
  const [searchTerm, setSearchTerm] = React.useState<string>("")
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false)
  const [metrics, setMetrics] = React.useState<MetricCardProps[]>(mockMetrics)

  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Simulation of refresh state (Strict React Cleanup - Rule 2)
  const handleRefresh = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    
    setIsRefreshing(true)
    timerRef.current = setTimeout(() => {
      setIsRefreshing(false)
      // Subtle data shuffle to simulate real-time API sync check
      setMetrics(prev =>
        prev.map(m => {
          if (m.title === "Anomaly Deflections") {
            const val = parseInt(String(m.value).replace(/,/g, "")) + Math.floor(Math.random() * 5)
            return { ...m, value: val.toLocaleString() }
          }
          if (m.title === "Cognitive Stability") {
            const val = Math.min(99.9, Math.max(95, parseFloat(String(m.value)) + (Math.random() - 0.5)))
            return { ...m, value: val.toFixed(1) }
          }
          return m
        })
      )
    }, 800)
  }, [])

  // SOP Rule 2: Proper unmount cleanup for the timeout
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const filteredActivities = React.useMemo(() => {
    if (!searchTerm) return recentActivities
    return recentActivities.filter(
      act =>
        act.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Simple CSS utility class definitions for active/neon states
  const borderClass = "border border-zinc-200 dark:border-zinc-800"
  const activeBorderClass = "border border-zinc-300 dark:border-[#2398f7]/60"

  return (
    <div className="w-full bg-slate-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#2398f7] animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-[#2398f7] font-semibold uppercase">
                [ SYSTEM STATUS: SYNCED ]
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Nexus Coordinator
            </h1>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Ecosystem Management, Chapters Synchronizer & Anomaly Deflection Center.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {/* SYNC DATABASE BUTTON - Safe to keep as Shadcn Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 text-xs bg-[#2398f7] text-white hover:bg-[#2398f7]/90 transition-colors border-none font-bold shadow-none"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 glitch:text-[#10b981] ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="glitch:text-[#10b981]">{isRefreshing ? "SYNCING..." : "SYNC DATABASE"}</span>
            </Button>
            
            {/* ABYSS TERM BUTTON - NATIVE HTML OVERRIDE */}
            <Link 
              href="/nexus/abyss-term"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold h-9 px-4 transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 hover:text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:text-zinc-900 border border-transparent shadow-sm cursor-pointer"
            >
              <span>ABYSS TERM</span>
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* METRICS GRID - Fluid responsive grid layout (Rule 10 strictly typed) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => {
            const isCardActive = metric.isActive
            return (
              <Card
                key={idx}
                className={`transition-all duration-200 rounded-lg bg-white dark:bg-zinc-900/40 shadow-none ${
                  isCardActive ? activeBorderClass : borderClass
                } hover:border-[#2398f7]/50`}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs tracking-tight text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">
                    {metric.title}
                  </span>
                  <div className={`text-zinc-400 dark:text-zinc-500 ${isCardActive ? "text-[#2398f7] dark:text-[#2398f7]" : ""}`}>
                    {metric.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                    {metric.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* MAIN BODY GRID - Splitting content between Recharts Feed & System Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* RECHARTS ACTIVITY GRID (Span 2) */}
          <Card className={`lg:col-span-2 rounded-lg bg-white dark:bg-zinc-900/40 shadow-none ${borderClass}`}>
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl font-extrabold tracking-tight">Ecosystem Activity Flow</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Neural queries, chapters sync updates, and anomaly deflection rates (Last 7 Days).
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#2398f7]" />
                    <span className="text-zinc-500 dark:text-zinc-400">Chapters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                    <span className="text-zinc-500 dark:text-zinc-400">Minigames</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#a855f7]" />
                    <span className="text-zinc-500 dark:text-zinc-400">Neural Sync</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Dynamic Lazy-loaded Chart */}
              <EcosystemChart />
            </CardContent>
          </Card>

          {/* SYSTEM DIAGNOSTICS CARD (Span 1) */}
          <Card className={`rounded-lg bg-white dark:bg-zinc-900/40 shadow-none ${borderClass}`}>
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80">
              <CardTitle className="text-lg font-extrabold tracking-tight">
                Memory & Performance Diagnostics
              </CardTitle>
              <CardDescription className="text-xs">
                Live environment enforcement tracking from AGENTS.md directives.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {diagnosticStats.map((stat, idx) => {
                  const isLatency = stat.name.includes("Latency") || stat.value.includes("ms")
                  return (
                    <div key={idx} className="flex items-center justify-between px-6 py-3.5 text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {stat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-zinc-900 dark:text-white ${isLatency ? 'font-mono' : ''}`}>
                          {stat.value}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          stat.status === "optimal" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM SECTION: SHADCN TABLE FOR RECENT ACTIVITY */}
        <Card className={`rounded-lg bg-white dark:bg-zinc-900/40 shadow-none ${borderClass}`}>
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-extrabold tracking-tight">
                Recent Ecosystem Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Live ledger of chapters added, high scores registered, and system state updates.
              </CardDescription>
            </div>
            
            {/* Search filter input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-[#2398f7]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/20">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-transparent">
                    <TableHead className="w-[100px] text-[11px] uppercase tracking-wider text-zinc-400 pl-6">Timestamp</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400">Event</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400">Protocol Source</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400">Activity State</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-zinc-400 pr-6 text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                        No matches found in the ledger.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((act) => (
                      <TableRow key={act.id} className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20">
                        <TableCell className="font-mono text-xs pl-6 text-zinc-500 dark:text-zinc-400">
                          {act.timestamp}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                          {act.event}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 dark:text-zinc-400">
                          {act.source}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              act.status === "NEW_RECORD"
                                ? "default"
                                : act.status === "ANOMALY"
                                ? "destructive"
                                : act.status === "MAINTENANCE"
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-[9px] px-1.5 py-0.5 rounded-full select-none ${
                              act.status === "SYNCED"
                                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/20"
                                : act.status === "NEW_RECORD"
                                ? "bg-[#2398f7] hover:bg-[#2398f7]/80 text-white border-transparent"
                                : ""
                            }`}
                          >
                            {act.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400 pr-6 text-right">
                          {act.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

