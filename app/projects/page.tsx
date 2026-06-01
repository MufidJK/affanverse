"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Trophy, 
  Compass, 
  Users, 
  ArrowRight, 
  GraduationCap, 
  Flame, 
  Binary, 
  ShieldAlert, 
  ChevronRight,
  Target,
  CheckCircle2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Explicit TypeScript Interfaces for compliance with SOP Rule 10
interface MetricItem {
  label: string;
  value: string;
}

interface ProjectCardData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  category: "Sport" | "IPA" | "IPS";
  tags: string[];
  coreAchievements: string[];
  metrics: MetricItem[];
  modalDetails: {
    fullDescription: string;
    codeSnippet: string;
  };
}

// Dynamically Import heavy client-side MultiverseToggle component (SOP Rule 8)
const MultiverseToggle = dynamic(
  () => import("@/components/projects/MultiverseToggle"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[520px] rounded-2xl border border-border/80 bg-card/50 flex flex-col items-center justify-center p-8 animate-pulse transform-gpu">
        <div className="h-4 w-24 bg-slate-800 rounded mb-3" />
        <div className="h-8 w-56 bg-slate-800 rounded mb-6" />
        <div className="h-10 w-72 bg-slate-800 rounded-full mb-10" />
        <div className="h-48 w-full bg-slate-800/40 rounded-xl" />
      </div>
    )
  }
);

// Define projects local database mapping to fulfill requirements
const projectsData: ProjectCardData[] = [
  {
    id: "smp-67-basketball",
    title: "The Legend of SMP 67 New Tangerang",
    subtitle: "1st Place Basketball Champion",
    description: "A historic victory securing the championship title through strategic teamwork and relentless defense.",
    imageSrc: "/projects/basketball-smp67.jpg",
    category: "Sport",
    tags: ["Championship", "Basketball", "Nostalgia", "Athletic Era"],
    coreAchievements: [
      "Defeated rival school by 15 points",
      "Undefeated throughout the regional bracket",
      "Awarded MVP to team captain"
    ],
    metrics: [
      { label: "Points/Game", value: "24.5" },
      { label: "Clutch Ratio", value: "99.9%" }
    ],
    modalDetails: {
      fullDescription: "This tournament tested our endurance and tactical execution. We faced the toughest opponents in the region, relying on rigorous training routines and seamless on-court communication. The final game was a test of willpower, where every possession mattered, culminating in a decisive victory that solidified our legacy.",
      codeSnippet: `// ScoreTracker.tsx
import React, { useState } from 'react';

export default function ScoreTracker() {
  const [score, setScore] = useState({ home: 0, away: 0 });

  const addScore = (team, points) => {
    setScore(prev => ({
      ...prev,
      [team]: prev[team] + points
    }));
  };

  return (
    <div className="scoreboard">
      <h2>Final Score: {score.home} - {score.away}</h2>
      <button onClick={() => addScore('home', 3)}>
        3PT HOME
      </button>
    </div>
  );
}`
    }
  },
  {
    id: "chemical-kinetic-analyzer",
    title: "Chemical Kinetic Analyzer v2",
    subtitle: "National Science Fair Finalist",
    description: "An automated titration system built to analyze reaction rates of complex catalysts.",
    imageSrc: "/projects/oceanography-ai.jpg",
    category: "IPA",
    tags: ["Science", "Chemistry", "Automation", "Hardware"],
    coreAchievements: [
      "Reduced human error margin by 94%",
      "Featured in National Student Science Journal",
      "Fully open-source hardware design"
    ],
    metrics: [
      { label: "Error Rate", value: "<1%" },
      { label: "Samples", value: "1,200+" }
    ],
    modalDetails: {
      fullDescription: "The core challenge was stabilizing the sensor readings during the exothermic phase of the reaction. We implemented a custom PID controller running on a microcontroller to regulate the titrant flow rate, resulting in unprecedented accuracy for a student project.",
      codeSnippet: `# kinetic_analysis.py
import numpy as np
import pandas as pd
from scipy.optimize import curve_fit

def reaction_rate(t, k, A0):
    return A0 * np.exp(-k * t)

data = pd.read_csv('titration_data.csv')
time = data['time_s']
concentration = data['conc_M']

# Fit first-order kinetic model
popt, _ = curve_fit(reaction_rate, time, concentration)
rate_constant = popt[0]

print(f"Calculated Rate Constant: {rate_constant:.4f} s^-1")`
    }
  },
  {
    id: "urban-socio-economic",
    title: "Urban Socio-Economic Predictor",
    subtitle: "Data-Driven Demographics",
    description: "A comprehensive geospatial analysis mapping economic disparity across developing urban sectors.",
    imageSrc: "/projects/diplomacy-hologram.jpg",
    category: "IPS",
    tags: ["Geospatial", "Data Analysis", "Sociology", "D3.js"],
    coreAchievements: [
      "Mapped over 50,000 data points",
      "Used by local city planning council",
      "Interactive dashboard built with D3.js"
    ],
    metrics: [
      { label: "Data Points", value: "50k+" },
      { label: "Sectors", value: "128" }
    ],
    modalDetails: {
      fullDescription: "This project visualized the widening gap in resource allocation across 128 urban sectors. By aggregating open-source demographic data and mapping it onto a coordinate system, we highlighted critical zones requiring immediate infrastructural intervention, influencing real local policy.",
      codeSnippet: `// map_render.js
import * as d3 from 'd3';

const svg = d3.select('#urban-map');
const projection = d3.geoMercator()
  .scale(150000)
  .center([106.8, -6.2]);
const path = d3.geoPath().projection(projection);

d3.json('jakarta_sectors.geojson').then(data => {
  svg.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => 
      d.properties.income < 5000 ? '#ff4d4d' : '#4CAF50'
    )
    .attr('stroke', '#fff')
    .on('mouseover', function(e, d) {
      d3.select(this).attr('opacity', 0.8);
      showTooltip(d.properties.name, d.properties.income);
    });
});`
    }
  },
  {
    id: "ambatron-gym",
    title: "100 Days of Ambatron Challenge",
    subtitle: "Unbreakable Gym Consistency 2024",
    description: "A brutal 100-day physical transformation journey alongside Jeka, pushing past limits with relentless consistency.",
    imageSrc: "/projects/ambatron-gym.jpg",
    category: "Sport",
    tags: ["Fitness", "Discipline", "Bodybuilding"],
    coreAchievements: [
      "100 Days Perfect Streak",
      "Explosive Muscle Mass Hypertrophy"
    ],
    metrics: [
      { label: "Streak", value: "100 Days" },
      { label: "Mass Gained", value: "+12kg" }
    ],
    modalDetails: {
      fullDescription: "Documenting the rigorous training splits, extreme muscle fatigue thresholds, and caloric surplus protocols required to execute the Ambatron challenge flawlessly.",
      codeSnippet: `{
  "challenge_name": "Ambatron 100",
  "daily_macro_tracking": {
    "protein_g": 220,
    "carbs_g": 350,
    "fats_g": 80
  },
  "supplements": {
    "mass_gainer_scoops": 3,
    "creatine_g": 5
  },
  "training_parameters": {
    "resistance_bands_tension": "Maximum Load",
    "rest_days_allowed": 0
  }
}`
    }
  },
  {
    id: "megathrust-java",
    title: "Megathrust Tsunami Analysis",
    subtitle: "Java Island Early Warning System",
    description: "Deep-ocean seismic research modeling Megathrust wave projections along the coastal lines of Java.",
    imageSrc: "/projects/megathrust-java.jpg",
    category: "IPA",
    tags: ["Geophysics", "Seismology", "Disaster Prep"],
    coreAchievements: [
      "Sub-15 Minute Early Warning",
      "99.8% Simulation Accuracy"
    ],
    metrics: [
      { label: "Prediction", value: "<15m" },
      { label: "Accuracy", value: "99.8%" }
    ],
    modalDetails: {
      fullDescription: "An advanced algorithmic approach to predicting devastating ocean surges by analyzing tectonic friction anomalies and thermal underwater shifts.",
      codeSnippet: `# tsunami_predictor.py
import numpy as np

# Load deep-sea pressure sensor arrays
pressure_array_1 = np.array([1.2, 1.5, 2.1, 4.5])
pressure_array_2 = np.array([1.1, 1.4, 2.3, 4.8])

# Concatenate arrays for predictive model input
combined_sensor_data = np.c_[pressure_array_1, pressure_array_2]

def run_simulation(data):
    # Analyzing tectonic friction anomalies
    anomaly_threshold = 3.5
    warnings = data[data > anomaly_threshold]
    if len(warnings) > 0:
        return "WARNING: Megathrust wave projected."
    return "Status: Normal"

print(run_simulation(combined_sensor_data))`
    }
  },
  {
    id: "elite-global",
    title: "The Bloomberg Pact",
    subtitle: "Elite Global Networking",
    description: "Securing high-level international connections, drawing the attention of global economic titans like Larry Fink.",
    imageSrc: "/projects/elite-global-v2.jpg",
    category: "IPS",
    tags: ["Diplomacy", "Finance", "Elite Global"],
    coreAchievements: [
      "Exclusive Bloomberg Terminal Access",
      "Strategic Institutional Alliances"
    ],
    metrics: [
      { label: "Network", value: "Tier 1" },
      { label: "Value", value: "$10B+" }
    ],
    modalDetails: {
      fullDescription: "A masterclass in international relations and geopolitical maneuvering, establishing a direct line to the architects of the modern financial system.",
      codeSnippet: `// bloomberg_sentiment.js
import fetch from 'node-fetch';

async function fetchMarketSentiment() {
  const url = 'https://api.bloomberg.com/v1/restricted/global-
  sentiment';
  const headers = {
    'Authorization': 'Bearer ELITE_GLOBAL_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Unauthorized Access');
    const data = await response.json();
    console.log('Global Market Sentiment:', data);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

fetchMarketSentiment();`
    }
  },
  {
    id: "great-reset",
    title: "The Great Reset 2030 Summit",
    subtitle: "Architecting the Future Economy",
    description: "Strategic discussions with international ministers on the socioeconomic shifts required for the 2030 Great Reset.",
    imageSrc: "/projects/great-reset-v2.jpg",
    category: "IPS",
    tags: ["Geopolitics", "AGI", "Economics"],
    coreAchievements: [
      "AGI Economic Framework Drafted",
      "Bilateral Policy Integration"
    ],
    metrics: [
      { label: "Year", value: "2030" },
      { label: "Impact", value: "Global" }
    ],
    modalDetails: {
      fullDescription: "Analyzing the intersection of artificial general intelligence and global wealth redistribution, presenting actionable policies to global leaders.",
      codeSnippet: `# reset_inference.py
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "google/gemma-4"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

def analyze_trade_predictions(scenario_data):
    prompt = f"Run sentiment and stability inference on 
              2030 global trade predictions: {scenario_data}"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=150)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Example 2030 trade data
print(analyze_trade_predictions("Mass automation in supply chains"))`
    }
  },
  {
    id: "el-maja",
    title: "Project El Maja",
    subtitle: "Deep Sea Secret Catch",
    description: "Engineering a hyper-complex sonic fishing rig to capture the legendary deep-sea anomaly known as El Maja.",
    imageSrc: "/projects/el-maja-v3.jpg",
    category: "IPA",
    tags: ["Marine Engineering", "Legendary Catch", "Robotics"],
    coreAchievements: [
      "Sonic Bait System Perfected",
      "El Maja Successfully Secured"
    ],
    metrics: [
      { label: "Depth", value: "11,000m" },
      { label: "Frequency", value: "440Hz" }
    ],
    modalDetails: {
      fullDescription: "Combining marine biology with advanced mechatronics. The rig utilizes acoustic resonance to bait the elusive blue glowing creature from the abyssal zone.",
      codeSnippet: `-- automated_reel.lua
local DeepSeaSensor = game.Workspace.Rig.Sensors.Acoustic
local ReelMechanism = game.Workspace.Rig.Motors.AutomatedReel

local EL_MAJA_SIGNATURE = 440 -- Frequency in Hz

DeepSeaSensor.OnSignalDetected:Connect(function(frequency)
    if frequency == EL_MAJA_SIGNATURE then
        print("ALERT: El Maja sonic signature detected!")
        ReelMechanism:Trigger(true)
        ReelMechanism.Speed = "Maximum"
        warn("Engaging hyper-complex reel sequence!")
    else
        ReelMechanism:Trigger(false)
    end
end)`
    }
  }
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectCardData | null>(null);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedProject]);

  return (
    <div className="w-full py-16 flex flex-col space-y-16 overflow-hidden">
      
      {/* 1. HERO SECTION: "The Dilemma of Affan" (Asymmetrical Bento-Grid Header) */}
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full transform-gpu"
        >
          {/* Main Narrative Bento Block (Spans 8 columns on large) */}
          <div className="lg:col-span-8 flex flex-col justify-between p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-card/30 backdrop-blur-sm relative overflow-hidden transform-gpu">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2398f7]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-600 dark:text-yellow-500 font-mono tracking-wide uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                Event Horizon Crossroads
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                  The Dilemma of <br />
                  <span className="text-[#2398f7] relative">
                    Affan
                    <span className="absolute left-0 bottom-0.5 w-full h-1 bg-[#2398f7] opacity-80" />
                  </span>
                </h1>
                
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
                  At 16, Affan stands before a digital crossroads that splits his academic destiny. On one vector lies the <strong className="text-[#2398f7] font-medium">IPA Pathway</strong>—deciphering fluid physics, marine tracking and computational oceanography. On the opposite vector lies the <strong className="text-amber-600 dark:text-amber-400 font-medium">IPS Pathway</strong>—orchestrating global digital diplomacy networks and soft power strategies. Guided by his development mentor, Jeka, this is the timeline detailing the circuits of his split ambition.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-300 dark:border-slate-700 mt-8">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                <GraduationCap className="w-3.5 h-3.5 text-[#2398f7]" />
                CLASS: SENIOR HIGH
              </div>
              <span className="text-slate-400 dark:text-slate-600 font-mono">•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                <Target className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                FOCUS: OCEANOLOGY VS STATECRAFT
              </div>
            </div>
          </div>

          {/* Mental Metrics Bento Block (Spans 4 columns on large) */}
          <div className="lg:col-span-4 p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 flex flex-col justify-between relative overflow-hidden transform-gpu">
            {/* Subtle static gradient background instead of heavy animated blurs */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2398f7]/5 to-transparent pointer-events-none" />
            
            <div className="space-y-4">
              <div className="font-mono text-xs text-slate-600 dark:text-slate-500 border-b border-slate-300 dark:border-slate-700 pb-2 flex justify-between tracking-widest uppercase">
                <span>Synaptic Diagnostics</span>
                <span className="text-red-500 dark:text-red-400 animate-pulse">● Live</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block tracking-wider uppercase">MENTOR GUIDANCE DIRECTIVE</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white font-mono flex items-center gap-1.5">
                    JEKA <span className="text-slate-500 text-[10px] font-normal">{"[SYSTEM SOVEREIGN]"}</span>
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block tracking-wider uppercase">ACADEMIC FRICTION SCALE</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-bold text-[#2398f7]">99.9%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">CRITICAL DUALITY</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Duality Ratio visualizer */}
            <div className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-700 mt-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>IPA (OCEAN)</span>
                  <span>IPS (DIPLOMACY)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#2398f7]" style={{ width: "50%" }} />
                  <div className="h-full bg-amber-500 dark:bg-amber-400" style={{ width: "50%" }} />
                </div>
              </div>

              <div className="p-3 bg-[#2398f7]/10 dark:bg-[#2398f7]/5 rounded border border-[#2398f7]/20 dark:border-[#2398f7]/10 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-mono">
                <span>Dilemma Vector:</span>
                <span className="text-[#2398f7] font-semibold">EQUILIBRIUM ACTIVE</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* 2. PROJECTS & ACHIEVEMENTS LIST (The Timeline of Chaos) */}
      <section className="relative w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <span className="relative inline-block pb-3">
                Achievement & Portfolio Projects
                {/* Base Underline */}
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#2398f7] rounded-full" />
                {/* Color-shifting Overlay Underline (SOP Compliant: opacity animation only) */}
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#2398f7] via-purple-500 to-pink-500 rounded-full"
                  animate={{ opacity: [0, 1, 0] }} 
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                />
              </span>
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              A chronological telemetry of Affan's physical peaks and blueprint prototypes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsData.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex transform-gpu"
              >
                <article className="relative flex flex-col backdrop-blur-md bg-white/60 dark:bg-slate-900/70 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group w-full hover:-translate-y-2 transition-transform duration-300 transform-gpu pb-20">
                  
                  <div className="relative w-full aspect-video m-0 p-0 bg-slate-200 dark:bg-slate-900">
                    <Image
                      src={project.imageSrc}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index <= 1}
                      className="object-cover"
                    />
                    {/* Subtle overlay shading */}
                    <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/30" />

                    {/* Single prominent Main tag overlay on Top-Right */}
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                      <span className={`backdrop-blur-md border border-white/20 text-sm font-bold px-4 py-1.5 rounded-full shadow-lg block ${
                        project.category === "Sport" 
                          ? "bg-emerald-500/40 text-emerald-100 dark:text-emerald-200" 
                          : project.category === "IPA" 
                          ? "bg-cyan-500/40 text-cyan-100 dark:text-cyan-200" 
                          : "bg-orange-500/40 text-orange-100 dark:text-orange-200"
                      }`}>
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* Secondary category tags above title */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags
                        .filter(tag => !["Sport", "IPA", "IPS", "IPA Route", "IPS Route"].includes(tag))
                        .map((tag, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-xs font-mono font-medium rounded-full bg-[#2398f7]/10 hover:bg-[#2398f7]/20 text-[#2398f7] border border-[#2398f7]/20 transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-gray-100 group-hover:text-[#2398f7] dark:group-hover:text-[#2398f7] transition-colors leading-tight">
                      {project.title}
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium font-mono block mt-1 mb-4">{project.subtitle}</span>

                    <p className="text-slate-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed line-clamp-4">
                      {project.description}
                    </p>

                    {/* Faint horizontal line separator */}
                    <hr className="border-t border-black/10 dark:border-white/10 my-6" />

                    {/* Distinct achievements footer section */}
                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase font-bold">Core Achievements:</div>
                      <ul className="space-y-2">
                        {project.coreAchievements.map((ach, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-snug">
                            <CheckCircle2 className="w-4 h-4 text-[#2398f7] shrink-0" />
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cyberpunk Stat Metrics */}
                    <div className="pt-2 mt-auto">
                      <div className="flex items-center gap-6">
                        {project.metrics.map((metric, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{metric.label}</span>
                            <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="absolute bottom-6 right-6 p-3 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#2398f7] hover:text-white dark:hover:text-white hover:border-[#2398f7] dark:hover:bg-[#2398f7] transition-all duration-300 group/btn"
                  >
                    <ArrowRight className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl border border-[#2398f7] shadow-[0_0_15px_rgba(35,152,247,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE MULTIVERSE OF AFFAN (Interactive Toggle Component - Lazy Loaded) */}
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <section className="space-y-6">
          <div className="border-t border-border/60 pt-10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#2398f7]/50 to-transparent" />
          </div>
          
          {/* Dynamic Client Component wrapped with IntersectionObserver & framer-motion */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="w-full transform-gpu"
          >
            <MultiverseToggle />
          </motion.div>
        </section>
      </div>

      {/* 4. FOOTER CROSSROADS ACTION */}
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <section className="w-full text-center py-8">
          <div className="inline-flex flex-col items-center space-y-4 max-w-lg mx-auto">
            <div className="p-3 bg-slate-900 border border-[#2398f7]/20 rounded-full text-[#2398f7]">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Decide the Destiny</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Which pathway will Affan solidify? Send your telemetry data directly to his inbox or schedule a briefing session to state your thesis.
            </p>
            <Button asChild size="sm" className="bg-[#2398f7] hover:bg-[#1a7cd4] text-white tracking-wide font-medium shadow-md shadow-[#2398f7]/15">
              <Link href="/contact">
                Initiate Contact Channel
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative grid grid-cols-1 lg:grid-cols-2 max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column (Content) */}
              <div className="p-8 lg:p-12 overflow-y-auto max-h-[50vh] lg:max-h-[90vh]">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-[#2398f7]/20 text-[#2398f7] border-[#2398f7]/30 hover:bg-[#2398f7]/30">{selectedProject.category}</Badge>
                  {selectedProject.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700">{tag}</Badge>
                  ))}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{selectedProject.title}</h2>
                <h3 className="text-lg text-[#2398f7] font-mono mb-6">{selectedProject.subtitle}</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {selectedProject.modalDetails.fullDescription}
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">Highlights</h4>
                  <ul className="space-y-3">
                    {selectedProject.coreAchievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column (Code Editor) */}
              <div className="bg-slate-50 dark:bg-[#1e293b] border-l border-slate-200 dark:border-slate-800 flex flex-col max-h-[40vh] lg:max-h-[90vh]">
                <div className="flex items-center px-4 py-3 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-white/5 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-xs font-mono text-slate-500 dark:text-slate-400">{selectedProject.category.toLowerCase()}_process.txt</span>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <pre className="text-sm font-mono text-[#0077cc] dark:text-[#4db4ff] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 p-4 rounded-lg m-0 overflow-visible">
                    <code>{selectedProject.modalDetails.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
