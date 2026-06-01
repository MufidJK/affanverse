"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Users, Anchor, Globe, Sparkles, CheckCircle2 } from "lucide-react";

// Explicit TypeScript Interfaces for compliance with SOP Rule 10
interface OceanParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

interface DiplomacyNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

export default function MultiverseToggle() {
  const [mode, setMode] = useState<"ipa" | "ips">("ipa");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Viewport visibility state (SOP Rule 4: Intersection Observer)
  const isVisibleRef = useRef<boolean>(true);

  // Set up intersection observer to pause rendering when component is offscreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisibleRef.current = entry.isIntersecting;
        }
      },
      { threshold: 0.05 } // Trigger when at least 5% of container is visible
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Canvas Animation loop with strict requestAnimationFrame cleanup (SOP Rule 2)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: OceanParticle[] = [];
    let nodes: DiplomacyNode[] = [];
    
    // Resize handler (SOP Rule 2: Clean up window listeners)
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 450;
      
      // Re-initialize elements
      initElements(canvas.width, canvas.height);
    };

    const initElements = (width: number, height: number) => {
      // 1. Initialize Ocean Particles (IPA)
      particles = [];
      const particleCount = Math.min(40, Math.floor(width / 20));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height + height, // Start from bottom
          size: Math.random() * 4 + 1.5,
          speedY: -(Math.random() * 0.8 + 0.3),
          speedX: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
        });
      }

      // 2. Initialize Diplomacy Nodes (IPS)
      nodes = [];
      const nodeCount = Math.min(25, Math.floor(width / 35));
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() * 0.6 - 0.3),
          vy: (Math.random() * 0.6 - 0.3),
          radius: Math.random() * 3.5 + 2,
          pulse: Math.random() * Math.PI,
          pulseSpeed: Math.random() * 0.03 + 0.01,
        });
      }
    };

    // First initialization
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 450;
    initElements(canvas.width, canvas.height);

    window.addEventListener("resize", handleResize);

    // Continuous render function
    const render = () => {
      // If out of viewport, skip rendering to save CPU/GPU cycles (SOP Rule 4)
      if (!isVisibleRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (mode === "ipa") {
        // Draw deep marine blue background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#031525");
        grad.addColorStop(0.5, "#07243d");
        grad.addColorStop(1, "#020f1b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Draw marine grid (cyberpunk oceanography grid)
        ctx.strokeStyle = "rgba(35, 152, 247, 0.03)";
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw and update ocean particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          // Wobble motion
          p.wobble += p.wobbleSpeed;
          p.x += Math.sin(p.wobble) * 0.2;
          p.y += p.speedY;

          // Recycle particle if it goes off screen top
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(35, 152, 247, ${p.opacity})`;
          ctx.fill();

          // Bubble glow (subtle outline, no heavy glow filter to avoid lag)
          ctx.strokeStyle = `rgba(165, 222, 255, ${p.opacity * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      } else {
        // Draw diplomatic/wireframe background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#080c10");
        grad.addColorStop(0.5, "#121820");
        grad.addColorStop(1, "#05070a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cyberpunk tech lines
        ctx.strokeStyle = "rgba(35, 152, 247, 0.02)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 20, height);
          ctx.stroke();
        }

        // Update and draw nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          
          n.x += n.vx;
          n.y += n.vy;
          n.pulse += n.pulseSpeed;

          // Bounce off bounds
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          // Draw node links first
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
            const maxDist = 120;

            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.15;
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(35, 152, 247, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          // Node core
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = "#2398f7";
          ctx.fill();

          // Pulsing halo (SOP Rule 5 compliant: drawn manually in canvas, not CSS drop-shadow)
          const currentRadius = Math.max(0.1, n.radius + Math.sin(n.pulse) * 4);
          ctx.beginPath();
          ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(35, 152, 247, ${0.15 + Math.sin(n.pulse) * 0.05})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(render);

    // Strict cleanup function (SOP Rule 2 & 7 compliance)
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mode]);

  const handleToggle = (selectedMode: "ipa" | "ips") => {
    setMode(selectedMode);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md transition-all duration-300 shadow-xl shadow-black/30 w-full min-h-[500px] flex flex-col transform-gpu will-change-transform"
    >
      {/* Canvas background containing the optimized render loop */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* Main interactive panel grid */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col flex-grow">
        
        {/* Multiverse Title & Subtitle */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2398f7]/20 bg-[#2398f7]/5 text-xs text-[#2398f7] font-mono tracking-wider uppercase mb-3 transform-gpu">
            <Sparkles className="w-3 h-3" />
            Decision Matrix
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            The Multiverse of Affan
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Toggle the timeline crossroads to explore the academic dilemma of Science vs. Social studies. Affan's dual destiny hangs in the balance.
          </p>
        </div>

        {/* Custom Cyberpunk Sliding Toggle Control */}
        <div className="flex justify-center mb-10 w-full">
          <div className="relative flex p-1.5 rounded-full bg-slate-900/90 border border-slate-800 w-full max-w-[450px] shadow-inner select-none">
            {/* Sliding Highlight Block */}
            <div 
              className={`absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-[#2398f7] to-[#1072c4] shadow-md shadow-[#2398f7]/30 transition-all duration-500 ease-out pointer-events-none`}
              style={{
                left: mode === "ipa" ? "6px" : "calc(50% + 3px)",
                width: "calc(50% - 9px)"
              }}
            />

            {/* IPA Selector */}
            <button
              onClick={() => handleToggle("ipa")}
              className={`flex-1 z-10 flex items-center justify-center gap-2 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors duration-300 ${
                mode === "ipa" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4" />
              IPA: Science / Oceanography
            </button>

            {/* IPS Selector */}
            <button
              onClick={() => handleToggle("ips")}
              className={`flex-1 z-10 flex items-center justify-center gap-2 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase transition-colors duration-300 ${
                mode === "ips" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              IPS: Social / Diplomacy
            </button>
          </div>
        </div>

        {/* Dynamic Detail Card with AnimatePresence */}
        <div className="flex-grow flex items-center justify-center">
          <AnimatePresence mode="wait">
            {mode === "ipa" ? (
              <motion.div
                key="ipa-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center transform-gpu"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <span className="text-[#2398f7] font-mono text-sm tracking-widest font-semibold uppercase">
                      The Oceanographic Frontier
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    Mapping Undersea Topography & Coastal Ecosystems
                  </h3>
                  
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Under the Science (IPA) pathway, Affan channels his mathematical precision into understanding ocean systems. With marine sciences calling, this dimension represents computational research into maritime topography, tuna migratory mapping, and climate impact models on coastal waters.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Quantitative physics & fluid mechanics</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Remote sensing and GIS marine data</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>AI systems for biodata tracking</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Coastal geomorphology models</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 relative h-[220px] rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-900/60 p-5 flex flex-col justify-between transform-gpu">
                  {/* Subtle decorative linear gradient instead of animated blur shadows */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="font-mono text-xs text-cyan-400 border-b border-cyan-500/10 pb-2 flex justify-between">
                    <span>SEALOCK STATUS: ONLINE</span>
                    <span>ROUTE: IPA-OCEANIC</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 font-mono">TUNA TRACKER SIGNAL STRENGTH:</div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: "88%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>DEPTH: 4,200m</span>
                      <span>COORD: 8.423° S, 115.267° E</span>
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/15 text-xs text-cyan-200 leading-normal">
                    "Tuning AI algorithms to detect schools of Thunnus alalunga near thermocline fronts in the Nusa Tenggara Strait."
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="ips-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center transform-gpu"
              >
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[#2398f7] font-mono text-sm tracking-widest font-semibold uppercase">
                      The Diplomatic Assembly
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    Digital Diplomacy & International Relations
                  </h3>
                  
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    Under the Social (IPS) pathway, Affan deploys his deep understanding of history, soft power, and geopolitical strategy. With international affairs calling, this reality represents building virtual diplomacy simulation consoles, translation layers for UN resolutions, and analyzing cyber-diplomacy in the digital age.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Geopolitical threat simulations</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Natural language processing for treaties</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Socio-political impact tracking</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Digital communication channels</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 relative h-[220px] rounded-xl overflow-hidden border border-amber-500/20 bg-slate-900/60 p-5 flex flex-col justify-between transform-gpu">
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/20 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="font-mono text-xs text-amber-400 border-b border-amber-500/10 pb-2 flex justify-between">
                    <span>GEOPOL STATUS: SECURE</span>
                    <span>ROUTE: IPS-GLOBAL</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 font-mono">DIPLOMATIC CONSENSUS RATING:</div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: "94%" }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>MEMBERS ACTIVE: 193</span>
                      <span>PACT ID: UN-2026-X8</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/30 rounded border border-amber-500/15 text-xs text-amber-200 leading-normal">
                    "Applying NLP model translations to map conflict risk levels dynamically across multilateral negotiation drafts."
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
