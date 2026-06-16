"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Skull, ShieldAlert, Cpu } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function AbyssTermPage() {
  return (
    <div className="w-full bg-slate-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-4 pb-6 border-b border-red-900/20 dark:border-red-900/40">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-red-600 dark:text-red-500 font-semibold uppercase">
                [ RESTRICTED AREA: ABYSS TERM ]
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-red-700 dark:text-red-500">
              Abyss Terms & Conditions
            </h1>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Classified Protocol Guidelines. Unauthorized access will trigger immediate memory wipe.
            </p>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-col gap-6">
          
          <Card className="rounded-lg bg-red-950/5 dark:bg-red-950/10 shadow-none border border-red-600/30 dark:border-red-600/20">
            <CardHeader className="border-b border-red-900/10 dark:border-red-900/20 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                <CardTitle className="font-mono text-sm tracking-widest uppercase text-red-700 dark:text-red-500">
                  Protocol 0: Data Corruption
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                Interaction with the Abyss Layer exposes the user to severe cognitive resonance hazards. Any fragmented data recovered from Minigame runners or legacy system logs is strictly quarantined. Attempting to reverse-engineer Corrupted Data Fragments without Apex Clearance will result in immediate neural severing and account termination.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-white dark:bg-zinc-900/40 shadow-none border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                <CardTitle className="font-mono text-sm tracking-widest uppercase text-zinc-700 dark:text-zinc-300">
                  The Predator Pact
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-4">
              <p>
                By navigating beyond the Nexus Coordinator, you acknowledge the absolute authority of the Affanverse architecture. The main timeline ("Affan: The Apex Predator") operates independently of player actions, but high-score anomalies in the Minigame Ecosystem may echo into the Spinoff Chronology ("Ambasuke").
              </p>
              <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400">
                <li>You surrender all rights to complain about plot armor.</li>
                <li>You acknowledge that Gravity Shift is a feature, not a bug.</li>
                <li>Your telemetry data is permanently linked to the Neural Sync index.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-red-950/5 dark:bg-red-950/10 shadow-none border border-red-600/30 dark:border-red-600/20">
            <CardHeader className="border-b border-red-900/10 dark:border-red-900/20 pb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-red-600 dark:text-red-500" />
                <CardTitle className="font-mono text-sm tracking-widest uppercase text-red-700 dark:text-red-500">
                  Neural Stability Warning
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                Prolonged exposure to the Abyss Terminal may cause visual hallucinations, false memories of non-existent chapters, and an overwhelming desire to replay "Flappy Affan". The system actively deploys WebGL garbage collection and AudioContext purging to protect your hardware, but your biological neural pathways are unsupported by our warranty.
              </p>
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded text-xs font-mono text-red-800 dark:text-red-400">
                &gt; WARNING: COGNITIVE OVERLOAD IMMINENT. PROCEED AT YOUR OWN RISK.
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
