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

const OceanographyLab = () => {
  const [temp, setTemp] = useState<number>(15);
  const [salinity, setSalinity] = useState<number>(35);
  const [depth, setDepth] = useState<number>(1000);
  const [frequency, setFrequency] = useState<number>(50);

  const [velocity, setVelocity] = useState<number>(0);
  const [echoTime, setEchoTime] = useState<number>(0);

  useEffect(() => {
    const v =
      1449.2 +
      4.6 * temp -
      0.055 * (temp * temp) +
      1.34 * (salinity - 35) +
      0.016 * depth;
    const time = (depth * 2) / v;

    setVelocity(v);
    setEchoTime(time);
  }, [temp, salinity, depth, frequency]);

  return (
    <section className="relative w-full py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-8 max-w-[90rem]">
        {/* OBJECTIVE 1: HEADER SECTION */}
        <div className="text-center space-y-3 mb-12">
          <div className="text-cyan-400 text-sm tracking-widest font-bold uppercase mb-2">
            Interactive Experiment
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            <span className="relative inline-block pb-3">
              The Oceanography Lab
              <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 rounded-full" />
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            </span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
            Welcome to the marine acoustics lab. As an oceanographic engineer, hydro-acoustic calculations are vital for tracking deep-sea anomalies like El Maja. Tweak the environmental variables below to dynamically calculate the speed of sound in water and sonar echo return times in real-time.
          </p>
        </div>

        {/* OBJECTIVE 2: MAIN CARD & VISUALIZATION */}
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-slate-700 shadow-2xl mt-12 transform-gpu">
          <div className="relative w-full h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-8 rounded-xl bg-slate-900/50 border border-slate-700/50">
            <div className="absolute z-10 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)] flex items-center justify-center">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
            </div>

            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{ scale: [1, 2.5, 4], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{ scale: [1, 2.5, 4], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{ scale: [1, 2.5, 4], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 2, delay: 1.2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-30" />
          </div>

          {/* OBJECTIVE 3: CALCULATOR LOGIC & INSET DISPLAY */}
          <div className="bg-[#0f172a] rounded-xl p-6 text-center shadow-inner border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-3">
              Echo Return Time
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] mb-2 tracking-tight">
              {echoTime.toFixed(3)} <span className="text-2xl text-cyan-500 font-medium">s</span>
            </div>
            <div className="text-sm font-mono text-cyan-200/70 bg-cyan-950/40 inline-block px-4 py-1.5 rounded-full border border-cyan-900/50">
              Sound Velocity: <span className="text-cyan-300 font-semibold">{velocity.toFixed(1)} m/s</span>
            </div>
          </div>

          {/* OBJECTIVE 4: INPUT DROPDOWNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block text-left">Water Temp</label>
              <select
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-colors"
              >
                <option value={5}>5°C (Deep Cold)</option>
                <option value={15}>15°C (Average)</option>
                <option value={25}>25°C (Tropical)</option>
                <option value={30}>30°C (Surface)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block text-left">Salinity</label>
              <select
                value={salinity}
                onChange={(e) => setSalinity(Number(e.target.value))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-colors"
              >
                <option value={0}>Fresh (0 ppt)</option>
                <option value={20}>Brackish (20 ppt)</option>
                <option value={35}>Ocean (35 ppt)</option>
                <option value={50}>Dead Sea (50 ppt)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block text-left">Target Depth</label>
              <select
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-colors"
              >
                <option value={100}>Epipelagic (100m)</option>
                <option value={500}>Mesopelagic (500m)</option>
                <option value={1000}>Bathypelagic (1000m)</option>
                <option value={4000}>Abyssopelagic (4000m)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block text-left">Ping Freq</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-colors"
              >
                <option value={10}>Low (10 kHz)</option>
                <option value={50}>Med (50 kHz)</option>
                <option value={200}>High (200 kHz)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DiplomacyCommandCenter = () => {
  const [aiPolicy, setAiPolicy] = useState<number>(25);
  const [trade, setTrade] = useState<number>(15);
  const [stance, setStance] = useState<number>(25);
  const [region, setRegion] = useState<number>(1.2);

  const rawGsi = (30 + aiPolicy + trade + stance) * region;
  const gsi = Math.min(99.9, Math.max(0.1, rawGsi));
  const gdpImpact = ((gsi - 50) / 8).toFixed(2);

  return (
    <section className="relative w-full py-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-8 max-w-[90rem]">
        {/* OBJECTIVE 3: UI & LIGHT/DARK MODE STYLING */}
        <div className="text-center space-y-3 mb-12">
          <div className="text-orange-600 dark:text-orange-400 text-sm tracking-widest font-bold uppercase mb-2">
            Geopolitical Simulation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            <span className="relative inline-block pb-3">
              The Diplomacy Command Center
              <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full" />
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            </span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-4">
            A global stability matrix for the 2030 Great Reset. Adjust the strategic variables below to simulate how different policies affect the Global Stability Index (GSI) and forecast global economic impacts.
          </p>
        </div>

        {/* MAIN CARD & VISUALIZATION */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-slate-200 dark:border-slate-700 shadow-xl mt-12 transform-gpu">
          <div className="relative w-full h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-8 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
            {/* Simple Framer Motion Animated Network */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32">
                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <line x1="50%" y1="10%" x2="15%" y2="85%" stroke="currentColor" strokeWidth="1" className="text-orange-500/30 dark:text-orange-500/50" />
                  <line x1="50%" y1="10%" x2="85%" y2="85%" stroke="currentColor" strokeWidth="1" className="text-orange-500/30 dark:text-orange-500/50" />
                  <line x1="15%" y1="85%" x2="85%" y2="85%" stroke="currentColor" strokeWidth="1" className="text-orange-500/30 dark:text-orange-500/50" />
                </svg>

                {/* Nodes */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                />
              </div>
            </div>
            {/* Background decorative grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          </div>

          {/* INSET DISPLAY */}
          <div className="bg-slate-50 dark:bg-[#0f172a] rounded-xl p-6 text-center shadow-inner border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h3 className="text-xs font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-3">
              Global Stability Index (GSI)
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)] mb-2 tracking-tight">
              {gsi.toFixed(1)} <span className="text-2xl text-orange-400 font-medium">%</span>
            </div>
            <div className="text-sm font-mono text-slate-600 dark:text-slate-300 font-medium inline-block px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              Est. Global GDP Impact: <span className="text-orange-500 dark:text-orange-400 font-bold">{Number(gdpImpact) > 0 ? "+" : ""}{gdpImpact}%</span>
            </div>
          </div>

          {/* INPUT DROPDOWNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase block text-left">AI Policy</label>
              <select
                value={aiPolicy}
                onChange={(e) => setAiPolicy(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              >
                <option value={-10}>Unrestricted (-10)</option>
                <option value={10}>Regulated (+10)</option>
                <option value={25}>Balanced (+25)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase block text-left">Trade Deal</label>
              <select
                value={trade}
                onChange={(e) => setTrade(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              >
                <option value={-5}>Protectionist (-5)</option>
                <option value={15}>Strategic (+15)</option>
                <option value={20}>Free Trade (+20)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase block text-left">Diplomacy Stance</label>
              <select
                value={stance}
                onChange={(e) => setStance(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              >
                <option value={-20}>Aggressive (-20)</option>
                <option value={5}>Neutral (+5)</option>
                <option value={25}>Cooperative (+25)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase block text-left">Target Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 w-full font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
              >
                <option value={0.9}>North America (0.9)</option>
                <option value={1.0}>Eurozone (1.0)</option>
                <option value={1.1}>Global South (1.1)</option>
                <option value={1.2}>APAC (1.2)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

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
          <div className="lg:col-span-8 flex flex-col justify-between h-full p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-card/30 backdrop-blur-sm relative overflow-hidden transform-gpu">
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
                  At 16, Affan stands before a digital crossroads that splits his academic destiny. On one vector lies the <strong className="text-[#2398f7] font-medium">IPA Pathway</strong>—deciphering fluid physics, marine tracking and computational oceanography. On the opposite vector lies the <strong className="text-amber-600 dark:text-amber-400 font-medium">IPS Pathway</strong>—orchestrating global digital diplomacy networks and soft power strategies. Guided by his development mentor, Elio Zayneez, this is the timeline detailing the circuits of his split ambition.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 my-6">
              <div className="bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-[#2398f7]">8+</div>
                <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 text-center mt-1 uppercase tracking-wide">Multiverse Projects</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-emerald-500">100</div>
                <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 text-center mt-1 uppercase tracking-wide">Days Ambatron</div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f172a]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                <div className="text-2xl md:text-3xl font-black text-orange-500">Lvl 19</div>
                <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 text-center mt-1 uppercase tracking-wide">Current Entity Age</div>
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
          <div className="lg:col-span-4 p-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 flex flex-col justify-between h-full relative overflow-hidden transform-gpu">
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
                    ELIO ZAYNEEZ <span className="text-slate-500 text-[10px] font-normal">{"[MENTOR & EX-LEADER OF RPD]"}</span>
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

            <div className="flex flex-col items-center justify-center flex-grow py-4">
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700"></circle>
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="0"></circle>
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#2398f7" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="-20"></circle>
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="-60"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-bold text-slate-800 dark:text-white leading-none">100%</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">AFFAN</span>
                </div>
              </div>
              
              <div className="flex gap-3 text-[10px] text-slate-500 font-mono mt-3 uppercase">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Sport 20%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#2398f7]"></div>IPA 40%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>IPS 40%</div>
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
      <div className="container mx-auto px-4 sm:px-8 max-w-[90rem]">
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

      {/* 4. THE OCEANOGRAPHY LAB (Interactive Sonar Calculator) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <OceanographyLab />
      </motion.div>

      {/* 5. THE DIPLOMACY COMMAND CENTER (Interactive Geopolitical Calculator) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <DiplomacyCommandCenter />
      </motion.div>

      {/* 6. FOOTER CROSSROADS ACTION */}
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <section className="w-full text-center py-16">
          <div className="inline-flex flex-col items-center space-y-6 max-w-3xl mx-auto">
            <motion.div 
              className="flex items-center justify-center bg-slate-900 border border-[#2398f7]/20 rounded-full text-[#2398f7] w-16 h-16 md:w-20 md:h-20"
              animate={{ scale: [1, 1.15, 1], boxShadow: ["0px 0px 0px rgba(35,152,247,0)", "0px 0px 20px rgba(35,152,247,0.6)", "0px 0px 0px rgba(35,152,247,0)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Decide the Destiny</h3>
            <p className="text-base md:text-lg lg:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Which pathway will Affan solidify? Send your telemetry data directly to his inbox or schedule a briefing session to state your thesis.
            </p>
            <Button asChild className="px-8 py-4 h-auto bg-[#2398f7] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg border-2 border-transparent hover:bg-transparent hover:text-[#2398f7] hover:border-[#2398f7] dark:hover:bg-transparent dark:hover:text-[#4db4ff] dark:hover:border-[#4db4ff]">
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
