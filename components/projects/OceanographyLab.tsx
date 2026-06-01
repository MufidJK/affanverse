"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";

export default function OceanographyLab() {
  const [temp, setTemp] = useState<number>(15);
  const [salinity, setSalinity] = useState<number>(35);
  const [depth, setDepth] = useState<number>(1000);
  const [frequency, setFrequency] = useState<number>(50);

  const [velocity, setVelocity] = useState<number>(0);
  const [echoTime, setEchoTime] = useState<number>(0);

  // Mackenzie equation for sound velocity in seawater
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
              {/* Base Underline */}
              <span className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 rounded-full" />
              {/* Color-shifting Overlay Underline (SOP Compliant) */}
              <motion.span
                className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "mirror",
                }}
              />
            </span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-4">
            Welcome to the marine acoustics lab. As an oceanographic engineer, hydro-acoustic calculations are vital for tracking deep-sea anomalies like El Maja. Tweak the environmental variables below to dynamically calculate the speed of sound in water and sonar echo return times in real-time.
          </p>
        </div>

        {/* OBJECTIVE 2: MAIN CARD & VISUALIZATION */}
        <div className="max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-slate-700 shadow-2xl mt-12 transform-gpu">
          {/* Sonar Visual Component */}
          <div className="relative w-full h-48 sm:h-64 flex items-center justify-center overflow-hidden mb-8 rounded-xl bg-slate-900/50 border border-slate-700/50">
            {/* Base ping dot */}
            <div className="absolute z-10 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)] flex items-center justify-center">
              <Waves className="w-2 h-2 text-slate-900" />
            </div>

            {/* Concentric ripples */}
            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{
                scale: [1, 2.5, 4],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{
                scale: [1, 2.5, 4],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2,
                delay: 0.6,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <motion.div
              className="absolute w-16 h-16 border border-cyan-400/50 rounded-full"
              animate={{
                scale: [1, 2.5, 4],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 2,
                delay: 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* Simulated deep sea background scanline */}
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
            {/* Dropdown 1: Water Temp */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block">
                Water Temp
              </label>
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

            {/* Dropdown 2: Salinity */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block">
                Salinity
              </label>
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

            {/* Dropdown 3: Target Depth */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block">
                Target Depth
              </label>
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

            {/* Dropdown 4: Ping Freq */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 tracking-wider uppercase block">
                Ping Freq
              </label>
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
}
