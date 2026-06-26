"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { submitEndlessRunnerScore } from "./actions";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface Hazard {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  glowPhase: number;
  active: boolean;
}

interface Collectible {
  x: number;
  y: number;
  size: number;
  speed: number;
  glowPhase: number;
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface MatrixColumn {
  x: number;
  chars: string[];
  speeds: number[];
  yOffsets: number[];
  layer: number; // 0 = back, 1 = front
}

interface ScoreEntry {
  player_name: string;
  score: number;
}

type GamePhase = "register" | "tutorial" | "playing" | "gameover";

/* ═══════════════════════════════════════════════
   CONSTANTS — delta-time based (units per SECOND)
   ═══════════════════════════════════════════════ */

const LOGICAL_W = 1280;
const LOGICAL_H = 720;

const PLAYER_SIZE = 64;
const PLAYER_DRAW_SIZE = 80;
const PLAYER_X = Math.floor(LOGICAL_W * 0.15); // Fixed X position

const FLOOR_HEIGHT = 60; // Bottom/top safe zone height
const FLOOR_Y = LOGICAL_H - FLOOR_HEIGHT - PLAYER_SIZE; // Player on floor
const CEIL_Y = FLOOR_HEIGHT; // Player on ceiling

const GRAVITY_FLIP_SPEED = 600; // px/s — tween speed for gravity flip
const ROTATION_SPEED = 8; // radians/s — rotation tween speed
const FLIP_COOLDOWN = 0.18; // seconds — prevent double-flip spam

const INITIAL_SCROLL_SPEED = 280; // px/s
const SCROLL_SPEED_RAMP = 0.004; // +0.4% per second
const MAX_SCROLL_SPEED = 700;

const HAZARD_POOL_SIZE = 25;
const HAZARD_W_MIN = 40;
const HAZARD_W_MAX = 70;
const HAZARD_H_MIN = 50;
const HAZARD_H_MAX = 100;
const HAZARD_SPAWN_INITIAL = 1.4; // seconds
const HAZARD_SPAWN_MIN = 0.35;
const HAZARD_SPAWN_RAMP = 0.003; // interval decrease per second

const COLLECTIBLE_POOL_SIZE = 15;
const COLLECTIBLE_SIZE = 22;
const COLLECTIBLE_SPAWN_INTERVAL = 2.0; // seconds

const PARTICLE_POOL_SIZE = 60;

const MATRIX_COLUMNS = 40;
const MATRIX_CHARS = "01";

const SCANLINE_ALPHA = 0.03;

const LS_NAME_KEY = "endless_runner_player_name";
const LS_HIGH_KEY = "endless_runner_high_score";

const NEON_BLUE = "#2398f7";
const HAZARD_RED = "#ff2040";

// Audio crossfade
const BGM_VOLUME = 0.75;
const BGM_CROSSFADE_INTERVAL_S = 60; // Switch every 60 seconds
const BGM_CROSSFADE_DURATION_MS = 3000; // 3 seconds fade

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

const HandwrittenParallaxLayer = ({ isVisible }: { isVisible: boolean }) => {
  const [topPos, setTopPos] = useState("30%");
  const [loopKey, setLoopKey] = useState(0);
  
  if (!isVisible) return null;

  return (
    <motion.div 
      key={loopKey}
      className="absolute z-10 flex items-center justify-center pointer-events-none transform-gpu mix-blend-screen opacity-70"
      style={{ top: topPos }}
      animate={{ x: ["120vw", "-150vw"] }}
      transition={{ 
        duration: 25, 
        ease: "linear"
      }}
      onAnimationComplete={() => { 
        setTopPos(Math.floor(Math.random() * 70) + 10 + "%"); 
        setLoopKey(prev => prev + 1); 
      }}
    >
      <div className="relative transform-gpu -rotate-6 scale-150">
        {/* Rule 5 Compliant static glow without CSS filters */}
        <div 
          className="absolute inset-0 -inset-x-12 -inset-y-12 z-0 transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(35,152,247,0.5) 0%, rgba(35,152,247,0) 65%)",
          }}
        />
        <span 
          className="relative z-10 text-[#2398f7] font-bold tracking-widest whitespace-nowrap opacity-90"
          style={{ 
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive",
            fontSize: "6rem",
          }}
        >
          I LUV AFFAN
        </span>
      </div>
    </motion.div>
  );
};

export default function EndlessRunnerEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  /* ── Mutable game state (never triggers re-render) ── */
  const g = useRef({
    phase: "register" as GamePhase,
    playerY: FLOOR_Y,
    targetY: FLOOR_Y,
    isOnCeiling: false,
    playerRotation: 0, // 0 = normal, Math.PI = flipped
    targetRotation: 0,
    flipCooldown: 0,

    scrollSpeed: INITIAL_SCROLL_SPEED,
    distance: 0,
    fragments: 0,
    elapsed: 0,
    lastTime: 0,

    // Object pools
    hazards: [] as Hazard[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    matrixColumns: [] as MatrixColumn[],

    // Spawn timers
    hazardSpawnTimer: 0,
    collectibleSpawnTimer: 0,

    // Audio crossfade
    currentTrackIndex: 0,
    nextCrossfadeAt: BGM_CROSSFADE_INTERVAL_S,
    isCrossfading: false,
  });

  /* ── Audio refs — SOP Rule 7 ── */
  const bgmRefs = useRef<(HTMLAudioElement | null)[]>([null, null, null]);
  const sfxPickerRef = useRef<HTMLAudioElement | null>(null);
  const sfxDeathRef = useRef<HTMLAudioElement | null>(null);
  const crossfadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioReady = useRef(false);

  /* ── Player sprite ── */
  const sprite = useRef<HTMLImageElement | null>(null);
  const spriteOk = useRef(false);

  /* ── React state (UI overlays only) ── */
  const [uiPhase, setUiPhase] = useState<GamePhase>("register");
  const [gameState, setGameState] = useState<'REGISTER' | 'TUTORIAL' | 'PLAYING' | 'GAMEOVER'>('TUTORIAL');
  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  /* ═══════════════════════════════════════════
     OBJECT POOL INITIALIZATION
     ═══════════════════════════════════════════ */

  const initPools = useCallback(() => {
    const s = g.current;

    // Hazard pool
    s.hazards = [];
    for (let i = 0; i < HAZARD_POOL_SIZE; i++) {
      s.hazards.push({
        x: -200, y: 0, w: 50, h: 60,
        speed: 0, glowPhase: Math.random() * Math.PI * 2, active: false,
      });
    }

    // Collectible pool
    s.collectibles = [];
    for (let i = 0; i < COLLECTIBLE_POOL_SIZE; i++) {
      s.collectibles.push({
        x: -200, y: 0, size: COLLECTIBLE_SIZE,
        speed: 0, glowPhase: Math.random() * Math.PI * 2, active: false,
      });
    }

    // Particle pool
    s.particles = [];
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      s.particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0 });
    }

    // Matrix columns
    s.matrixColumns = [];
    for (let i = 0; i < MATRIX_COLUMNS; i++) {
      const layer = i < MATRIX_COLUMNS / 2 ? 0 : 1;
      const charCount = 15 + Math.floor(Math.random() * 10);
      const chars: string[] = [];
      const speeds: number[] = [];
      const yOffsets: number[] = [];
      for (let j = 0; j < charCount; j++) {
        chars.push(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
        speeds.push(30 + Math.random() * 60);
        yOffsets.push(Math.random() * LOGICAL_H);
      }
      s.matrixColumns.push({
        x: (i / MATRIX_COLUMNS) * LOGICAL_W + Math.random() * 20,
        chars, speeds, yOffsets, layer,
      });
    }
  }, []);

  /* ═══════════════════════════════════════════
     LEADERBOARD
     ═══════════════════════════════════════════ */

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("minigame_scores")
        .select("player_name, score")
        .eq("game_slug", "affan-endless-runner")
        .order("score", { ascending: false })
        .limit(5);

      if (!error && data) {
        setLeaderboard(data as ScoreEntry[]);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  }, []);

  /* ═══════════════════════════════════════════
     AUDIO — SOP Rule 7
     ═══════════════════════════════════════════ */

  const initAudio = useCallback(() => {
    const bgmPaths = [
      "/minigame/affan-endless-runner/safe-and-sound-Music.mp3",
      "/minigame/affan-endless-runner/dreamland-Music.mp3",
      "/minigame/affan-endless-runner/night-run-Music.mp3",
    ];
    for (let i = 0; i < 3; i++) {
      if (!bgmRefs.current[i]) {
        const a = new window.Audio(bgmPaths[i]);
        a.preload = "auto";
        a.loop = true;
        a.volume = i === 0 ? BGM_VOLUME : 0;
        bgmRefs.current[i] = a;
      }
    }
    if (!sfxPickerRef.current) {
      const a = new window.Audio("/minigame/affan-endless-runner/picker.mp3");
      a.preload = "auto";
      a.volume = 0.8;
      sfxPickerRef.current = a;
    }
    if (!sfxDeathRef.current) {
      const a = new window.Audio("/minigame/affan-endless-runner/death-whistle.mp3");
      a.preload = "auto";
      a.volume = 1.0;
      sfxDeathRef.current = a;
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioReady.current) return;
    audioReady.current = true;
    // Unlock SFX contexts
    [sfxPickerRef.current, sfxDeathRef.current].forEach((a) => {
      if (a) {
        const playPromise = a.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            a.pause();
            a.currentTime = 0;
          }).catch(error => console.warn("Audio play interrupted:", error.name));
        }
      }
    });
  }, []);

  const playSfx = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const a = ref.current;
    if (!a || !audioReady.current) return;
    a.currentTime = 0;
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => console.warn("Audio play interrupted:", error.name));
    }
  }, []);

  const stopAllBgm = useCallback(() => {
    // Clear any ongoing crossfade
    if (crossfadeIntervalRef.current) {
      clearInterval(crossfadeIntervalRef.current);
      crossfadeIntervalRef.current = null;
    }
    bgmRefs.current.forEach((a) => {
      if (a) {
        a.pause();
        a.currentTime = 0;
        a.volume = 0;
      }
    });
    g.current.isCrossfading = false;
  }, []);

  const startBgm = useCallback(() => {
    const s = g.current;
    s.currentTrackIndex = 0;
    s.nextCrossfadeAt = BGM_CROSSFADE_INTERVAL_S;
    s.isCrossfading = false;
    // Reset all volumes
    bgmRefs.current.forEach((a, i) => {
      if (a) {
        a.currentTime = 0;
        a.volume = i === 0 ? BGM_VOLUME : 0;
      }
    });
    // Play first track
    const first = bgmRefs.current[0];
    if (first) {
      const playPromise = first.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.warn("Audio play interrupted:", error.name));
      }
    }
  }, []);

  /** Crossfade from current track to next */
  const triggerCrossfade = useCallback(() => {
    const s = g.current;
    if (s.isCrossfading) return;
    s.isCrossfading = true;

    const fromIdx = s.currentTrackIndex;
    const toIdx = (fromIdx + 1) % 3;
    const fromAudio = bgmRefs.current[fromIdx];
    const toAudio = bgmRefs.current[toIdx];

    if (!fromAudio || !toAudio) {
      s.isCrossfading = false;
      return;
    }

    // Start the next track
    toAudio.volume = 0;
    toAudio.currentTime = 0;
    const playPromise = toAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => console.warn("Audio play interrupted:", error.name));
    }

    const steps = BGM_CROSSFADE_DURATION_MS / 50;
    let step = 0;

    crossfadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      fromAudio.volume = Math.max(0, BGM_VOLUME * (1 - progress));
      toAudio.volume = Math.min(BGM_VOLUME, BGM_VOLUME * progress);

      if (step >= steps) {
        if (crossfadeIntervalRef.current) {
          clearInterval(crossfadeIntervalRef.current);
          crossfadeIntervalRef.current = null;
        }
        fromAudio.pause();
        fromAudio.currentTime = 0;
        fromAudio.volume = 0;
        toAudio.volume = BGM_VOLUME;

        s.currentTrackIndex = toIdx;
        s.nextCrossfadeAt = s.elapsed + BGM_CROSSFADE_INTERVAL_S;
        s.isCrossfading = false;
      }
    }, 50);
  }, []);

  /* ═══════════════════════════════════════════
     SPAWNING (from object pool)
     ═══════════════════════════════════════════ */

  const spawnHazard = useCallback(() => {
    const s = g.current;
    // Find first inactive hazard
    const h = s.hazards.find((hz) => !hz.active);
    if (!h) return; // Pool exhausted — skip

    h.w = HAZARD_W_MIN + Math.random() * (HAZARD_W_MAX - HAZARD_W_MIN);
    h.h = HAZARD_H_MIN + Math.random() * (HAZARD_H_MAX - HAZARD_H_MIN);
    h.x = LOGICAL_W + 20;
    h.speed = s.scrollSpeed * (0.9 + Math.random() * 0.3);
    h.glowPhase = Math.random() * Math.PI * 2;
    h.active = true;

    // Decide lane: floor, ceiling, or both after 30s
    if (s.elapsed > 30 && Math.random() < 0.3) {
      // Dual-lane: spawn one on floor AND one on ceiling
      h.y = LOGICAL_H - FLOOR_HEIGHT - h.h; // Floor
      const h2 = s.hazards.find((hz) => !hz.active);
      if (h2) {
        h2.w = h.w;
        h2.h = h.h * (0.7 + Math.random() * 0.3);
        h2.x = h.x;
        h2.y = FLOOR_HEIGHT; // Ceiling
        h2.speed = h.speed;
        h2.glowPhase = Math.random() * Math.PI * 2;
        h2.active = true;
      }
    } else {
      // Single lane — random floor or ceiling
      if (Math.random() < 0.5) {
        h.y = LOGICAL_H - FLOOR_HEIGHT - h.h; // Floor
      } else {
        h.y = FLOOR_HEIGHT; // Ceiling
      }
    }
  }, []);

  const spawnCollectible = useCallback(() => {
    const s = g.current;
    const c = s.collectibles.find((cl) => !cl.active);
    if (!c) return;

    c.x = LOGICAL_W + 20;
    c.size = COLLECTIBLE_SIZE;
    c.speed = s.scrollSpeed;
    c.glowPhase = Math.random() * Math.PI * 2;
    c.active = true;

    // Place in safe zone between hazard lanes
    const laneChoice = Math.random();
    if (laneChoice < 0.4) {
      // Floor lane
      c.y = LOGICAL_H - FLOOR_HEIGHT - PLAYER_SIZE / 2;
    } else if (laneChoice < 0.8) {
      // Ceiling lane
      c.y = FLOOR_HEIGHT + PLAYER_SIZE / 2;
    } else {
      // Middle
      c.y = LOGICAL_H / 2 + (Math.random() - 0.5) * 100;
    }
  }, []);

  const spawnParticles = useCallback((px: number, py: number) => {
    const s = g.current;
    for (let i = 0; i < 4; i++) {
      const p = s.particles.find((pt) => pt.life <= 0);
      if (!p) break;
      p.x = px;
      p.y = py;
      p.vx = -(80 + Math.random() * 120);
      p.vy = (Math.random() - 0.5) * 80;
      p.life = 0.3 + Math.random() * 0.3;
      p.maxLife = p.life;
    }
  }, []);

  /* ═══════════════════════════════════════════
     DRAWING HELPERS
     ═══════════════════════════════════════════ */

  const drawMatrixRain = useCallback(
    (ctx: CanvasRenderingContext2D, dt: number) => {
      const s = g.current;
      ctx.save();
      
      // ── Enhance: Wireframe Parallax Tunnel ──
      ctx.strokeStyle = "rgba(35, 152, 247, 0.1)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      const cx = LOGICAL_W / 2;
      const cy = LOGICAL_H / 2;
      const gridSpacing = 80;
      const scrollOffset = (s.distance * 100) % gridSpacing;
      
      // Vertical lines moving left
      for (let x = -gridSpacing; x <= LOGICAL_W + gridSpacing; x += gridSpacing) {
        const lineX = x - scrollOffset;
        ctx.moveTo(lineX, 0);
        ctx.lineTo(lineX, LOGICAL_H);
      }
      
      // Horizontal perspective lines
      for (let i = 0; i <= 6; i++) {
        const pow = Math.pow(i / 6, 2);
        const yTop = cy - (cy * pow);
        const yBot = cy + (cy * pow);
        ctx.moveTo(0, yTop); ctx.lineTo(LOGICAL_W, yTop);
        ctx.moveTo(0, yBot); ctx.lineTo(LOGICAL_W, yBot);
      }
      ctx.stroke();

      for (const col of s.matrixColumns) {
        const scrollMult = col.layer === 0 ? 0.3 : 0.7;
        const alpha = col.layer === 0 ? 0.06 : 0.12;
        const fontSize = col.layer === 0 ? 10 : 14;

        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = `rgba(35, 152, 247, ${alpha})`;

        // Scroll columns leftward with parallax
        col.x -= s.scrollSpeed * scrollMult * dt;
        if (col.x < -30) {
          col.x = LOGICAL_W + Math.random() * 40;
          // Randomize characters
          for (let j = 0; j < col.chars.length; j++) {
            col.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }
        }

        for (let j = 0; j < col.chars.length; j++) {
          col.yOffsets[j] += col.speeds[j] * dt;
          if (col.yOffsets[j] > LOGICAL_H) {
            col.yOffsets[j] = -fontSize;
            col.chars[j] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          }
          ctx.fillText(col.chars[j], col.x, col.yOffsets[j]);
        }
      }
      ctx.restore();
    },
    []
  );

  const drawFloorCeiling = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    const gridScroll = (s.distance * 2) % 40;

    ctx.save();

    // Floor
    ctx.fillStyle = "rgba(35, 152, 247, 0.04)";
    ctx.fillRect(0, LOGICAL_H - FLOOR_HEIGHT, LOGICAL_W, FLOOR_HEIGHT);
    ctx.strokeStyle = "rgba(35, 152, 247, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, LOGICAL_H - FLOOR_HEIGHT);
    ctx.lineTo(LOGICAL_W, LOGICAL_H - FLOOR_HEIGHT);
    ctx.stroke();

    // Floor grid lines
    ctx.strokeStyle = "rgba(35, 152, 247, 0.06)";
    ctx.lineWidth = 1;
    for (let x = -gridScroll; x < LOGICAL_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, LOGICAL_H - FLOOR_HEIGHT);
      ctx.lineTo(x, LOGICAL_H);
      ctx.stroke();
    }

    // Ceiling
    ctx.fillStyle = "rgba(35, 152, 247, 0.04)";
    ctx.fillRect(0, 0, LOGICAL_W, FLOOR_HEIGHT);
    ctx.strokeStyle = "rgba(35, 152, 247, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, FLOOR_HEIGHT);
    ctx.lineTo(LOGICAL_W, FLOOR_HEIGHT);
    ctx.stroke();

    // Ceiling grid lines
    ctx.strokeStyle = "rgba(35, 152, 247, 0.06)";
    ctx.lineWidth = 1;
    for (let x = -gridScroll; x < LOGICAL_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FLOOR_HEIGHT);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  const drawHazard = useCallback((ctx: CanvasRenderingContext2D, h: Hazard, time: number) => {
    if (!h.active) return;
    ctx.save();

    const pulse = 0.6 + Math.sin(time * 6 + h.glowPhase) * 0.4;

    // Outer glow — drawn natively via canvas shadow
    ctx.shadowColor = HAZARD_RED;
    ctx.shadowBlur = 15 * pulse;

    // Glitch offset
    const glitch = Math.sin(time * 12 + h.glowPhase) * 2;

    // RGB split (red)
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "rgba(255, 0, 60, 0.5)";
    ctx.fillRect(h.x + glitch + 2, h.y - 1, h.w, h.h);
    // RGB split (cyan)
    ctx.fillStyle = "rgba(0, 255, 200, 0.2)";
    ctx.fillRect(h.x - glitch - 2, h.y + 1, h.w, h.h);

    // Main body
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = `rgba(255, 32, 64, ${0.7 + pulse * 0.3})`;
    ctx.fillRect(h.x + glitch * 0.5, h.y, h.w, h.h);

    // Scanline overlay on hazard
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#000";
    for (let sy = h.y; sy < h.y + h.h; sy += 3) {
      ctx.fillRect(h.x, sy, h.w, 1);
    }

    // Border
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = HAZARD_RED;
    ctx.lineWidth = 1;
    ctx.strokeRect(h.x + glitch * 0.5, h.y, h.w, h.h);

    ctx.restore();
  }, []);

  const drawCollectible = useCallback(
    (ctx: CanvasRenderingContext2D, c: Collectible, time: number) => {
      if (!c.active) return;
      ctx.save();

      const pulse = 0.7 + Math.sin(time * 4 + c.glowPhase) * 0.3;
      const rot = time * 2 + c.glowPhase;

      ctx.translate(c.x, c.y);
      ctx.rotate(rot);

      // Glow
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 12 * pulse;

      // Diamond shape (rotated square)
      const s = c.size * (0.9 + pulse * 0.1);
      ctx.fillStyle = `rgba(35, 152, 247, ${0.7 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s, 0);
      ctx.closePath();
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = `rgba(180, 220, 255, ${0.5 + pulse * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.4);
      ctx.lineTo(s * 0.4, 0);
      ctx.lineTo(0, s * 0.4);
      ctx.lineTo(-s * 0.4, 0);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    },
    []
  );

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    ctx.save();
    for (const p of s.particles) {
      if (p.life <= 0) continue;
      const alpha = (p.life / p.maxLife) * 0.8;
      const radius = 2 + (1 - p.life / p.maxLife) * 3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = NEON_BLUE;
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }, []);

  const drawScanlines = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = `rgba(0, 0, 0, ${SCANLINE_ALPHA})`;
    for (let y = 0; y < LOGICAL_H; y += 4) {
      ctx.fillRect(0, y, LOGICAL_W, 2);
    }
  }, []);

  /* ═══════════════════════════════════════════
     GAME ACTIONS
     ═══════════════════════════════════════════ */

  const resetGame = useCallback(() => {
    const s = g.current;
    s.playerY = FLOOR_Y;
    s.targetY = FLOOR_Y;
    s.isOnCeiling = false;
    s.playerRotation = 0;
    s.targetRotation = 0;
    s.flipCooldown = 0;
    s.scrollSpeed = INITIAL_SCROLL_SPEED;
    s.distance = 0;
    s.fragments = 0;
    s.elapsed = 0;
    s.lastTime = 0;
    s.hazardSpawnTimer = 0;
    s.collectibleSpawnTimer = 0;
    s.currentTrackIndex = 0;
    s.nextCrossfadeAt = BGM_CROSSFADE_INTERVAL_S;
    s.isCrossfading = false;

    // Deactivate all pooled objects
    s.hazards.forEach((h) => (h.active = false));
    s.collectibles.forEach((c) => (c.active = false));
    s.particles.forEach((p) => (p.life = 0));
  }, []);

  const flipGravity = useCallback(() => {
    const s = g.current;
    if (s.phase !== "playing") return;
    if (s.flipCooldown > 0) return;

    s.isOnCeiling = !s.isOnCeiling;
    s.targetY = s.isOnCeiling ? CEIL_Y : FLOOR_Y;
    s.targetRotation = s.isOnCeiling ? Math.PI : 0;
    s.flipCooldown = FLIP_COOLDOWN;

    // Spawn trail particles at player center
    const pcx = PLAYER_X + PLAYER_SIZE / 2;
    const pcy = s.playerY + PLAYER_SIZE / 2;
    spawnParticles(pcx, pcy);
  }, [spawnParticles]);

  const computeFinalScore = useCallback(() => {
    const s = g.current;
    return Math.floor(s.distance) + s.fragments * 100;
  }, []);

  const doDeath = useCallback(() => {
    const s = g.current;
    if (s.phase !== "playing") return;
    s.phase = "gameover";
    stopAllBgm();
    playSfx(sfxDeathRef);

    const finalScore = computeFinalScore();
    setDisplayScore(finalScore);
    setUiPhase("gameover");
    setGameState("GAMEOVER");

    const prevHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);

    if (finalScore > 0 && finalScore > prevHigh) {
      localStorage.setItem(LS_HIGH_KEY, String(finalScore));
      setHighScore(finalScore);

      const name = localStorage.getItem(LS_NAME_KEY) || "Anon";

      // Server Action — fire and forget
      submitEndlessRunnerScore({
        player_name: name,
        game_slug: "affan-endless-runner",
        score: finalScore,
      })
        .then(() => fetchLeaderboard())
        .catch(() => {});

      setScoreSaved(true);
    } else {
      setScoreSaved(false);
    }
  }, [stopAllBgm, playSfx, computeFinalScore, fetchLeaderboard]);

  /* ═══════════════════════════════════════════
     GAME LOOP — delta-time physics
     ═══════════════════════════════════════════ */

  const loop = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const s = g.current;

      // Delta time (seconds), capped at 50ms
      if (s.lastTime === 0) s.lastTime = timestamp;
      const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
      s.lastTime = timestamp;

      // Set canvas logical size
      canvas.width = LOGICAL_W;
      canvas.height = LOGICAL_H;

      /* ── UPDATE ── */
      if (s.phase === "playing") {
        s.elapsed += dt;
        s.flipCooldown = Math.max(0, s.flipCooldown - dt);

        // ── Scroll speed ramp ──
        s.scrollSpeed = Math.min(
          MAX_SCROLL_SPEED,
          INITIAL_SCROLL_SPEED * (1 + s.elapsed * SCROLL_SPEED_RAMP)
        );

        // ── Distance ──
        s.distance += s.scrollSpeed * dt * 0.01; // Arbitrary unit

        // ── Player gravity tween ──
        const dy = s.targetY - s.playerY;
        if (Math.abs(dy) > 1) {
          const move = Math.sign(dy) * GRAVITY_FLIP_SPEED * dt;
          if (Math.abs(move) > Math.abs(dy)) {
            s.playerY = s.targetY;
          } else {
            s.playerY += move;
          }
          // Spawn trailing particles during movement
          if (Math.abs(dy) > 10) {
            const pcx = PLAYER_X + PLAYER_SIZE / 2;
            const pcy = s.playerY + PLAYER_SIZE / 2;
            spawnParticles(pcx, pcy);
          }
        }

        // ── Player rotation tween ──
        const dr = s.targetRotation - s.playerRotation;
        if (Math.abs(dr) > 0.01) {
          const rotMove = Math.sign(dr) * ROTATION_SPEED * dt;
          if (Math.abs(rotMove) > Math.abs(dr)) {
            s.playerRotation = s.targetRotation;
          } else {
            s.playerRotation += rotMove;
          }
        }

        // ── Hazard spawning ──
        s.hazardSpawnTimer += dt;
        const spawnInterval = Math.max(
          HAZARD_SPAWN_MIN,
          HAZARD_SPAWN_INITIAL - s.elapsed * HAZARD_SPAWN_RAMP
        );
        if (s.hazardSpawnTimer >= spawnInterval) {
          s.hazardSpawnTimer -= spawnInterval;
          spawnHazard();
        }

        // ── Collectible spawning ──
        s.collectibleSpawnTimer += dt;
        if (s.collectibleSpawnTimer >= COLLECTIBLE_SPAWN_INTERVAL) {
          s.collectibleSpawnTimer -= COLLECTIBLE_SPAWN_INTERVAL;
          spawnCollectible();
        }

        // ── Update hazards ──
        for (const h of s.hazards) {
          if (!h.active) continue;
          h.x -= h.speed * dt;
          if (h.x + h.w < -20) {
            h.active = false; // Recycle to pool
          }
        }

        // ── Update collectibles ──
        for (const c of s.collectibles) {
          if (!c.active) continue;
          c.x -= c.speed * dt;
          if (c.x + c.size < -20) {
            c.active = false; // Recycle to pool
          }
        }

        // ── Update particles ──
        for (const p of s.particles) {
          if (p.life <= 0) continue;
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        // ── Collision: Hazards ──
        const playerLeft = PLAYER_X + 8;
        const playerRight = PLAYER_X + PLAYER_SIZE - 8;
        const playerTop = s.playerY + 8;
        const playerBottom = s.playerY + PLAYER_SIZE - 8;

        for (const h of s.hazards) {
          if (!h.active) continue;
          if (
            playerRight > h.x &&
            playerLeft < h.x + h.w &&
            playerBottom > h.y &&
            playerTop < h.y + h.h
          ) {
            doDeath();
            break;
          }
        }

        // ── Collision: Collectibles ──
        if (s.phase === "playing") {
          const pcx = PLAYER_X + PLAYER_SIZE / 2;
          const pcy = s.playerY + PLAYER_SIZE / 2;
          const pickupRadius = PLAYER_SIZE * 0.6;

          for (const c of s.collectibles) {
            if (!c.active) continue;
            const cdx = pcx - c.x;
            const cdy = pcy - c.y;
            const dist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (dist < pickupRadius + c.size) {
              c.active = false;
              s.fragments++;
              playSfx(sfxPickerRef);
              // Burst particles at collect point
              spawnParticles(c.x, c.y);
            }
          }
        }

        // ── Audio crossfade check ──
        if (s.elapsed >= s.nextCrossfadeAt && !s.isCrossfading) {
          triggerCrossfade();
        }
      }

      /* ── DRAW ── */

      // a. ctx.clearRect to make canvas transparent for the DOM background layer behind it
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // b. Draw the Abyss/Parallax background
      drawMatrixRain(ctx, dt);
      drawFloorCeiling(ctx);
      
      drawParticles(ctx);

      // c. Draw the Data Fragments (Diamonds) FIRST
      for (const c of s.collectibles) {
        drawCollectible(ctx, c, s.elapsed);
      }

      // d. Draw the Memory Leaks (Red Boxes) SECOND so they visually block/cover the diamonds
      for (const h of s.hazards) {
        drawHazard(ctx, h, s.elapsed);
      }

      // e. Draw the Cyber-Bust Player character LAST so it always remains in the foreground
      ctx.save();
      const pcx = PLAYER_X + PLAYER_SIZE / 2;
      const pcy = s.playerY + PLAYER_SIZE / 2;

      ctx.translate(pcx, pcy);
      ctx.rotate(s.playerRotation);

      // Neon glow
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 20;

      if (spriteOk.current && sprite.current) {
        ctx.drawImage(
          sprite.current,
          -PLAYER_DRAW_SIZE / 2,
          -PLAYER_DRAW_SIZE / 2,
          PLAYER_DRAW_SIZE,
          PLAYER_DRAW_SIZE
        );
      } else {
        // Fallback circle
        ctx.fillStyle = NEON_BLUE;
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER_DRAW_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Trailing glow line behind player ──
      if (s.phase === "playing") {
        ctx.save();
        const trailGrad = ctx.createLinearGradient(
          PLAYER_X - 80, pcy, PLAYER_X, pcy
        );
        trailGrad.addColorStop(0, "rgba(35, 152, 247, 0)");
        trailGrad.addColorStop(1, "rgba(35, 152, 247, 0.3)");
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(PLAYER_X - 80, pcy);
        ctx.lineTo(PLAYER_X, pcy);
        ctx.stroke();
        ctx.restore();

        // ── HUD ──
        // Distance (bottom-right)
        ctx.save();
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(35, 152, 247, 0.15)";
        ctx.fillText(`DIST: ${Math.floor(s.distance)}m`, LOGICAL_W - 18, LOGICAL_H - 18);
        ctx.fillStyle = "rgba(35, 152, 247, 0.7)";
        ctx.fillText(`DIST: ${Math.floor(s.distance)}m`, LOGICAL_W - 20, LOGICAL_H - 20);
        ctx.restore();

        // Fragments (top-right)
        ctx.save();
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(35, 152, 247, 0.15)";
        ctx.fillText(`DATA: ${s.fragments}`, LOGICAL_W - 18, 42);
        ctx.fillStyle = "rgba(35, 152, 247, 0.7)";
        ctx.fillText(`DATA: ${s.fragments}`, LOGICAL_W - 20, 40);
        ctx.restore();

        // Score (top-center)
        ctx.save();
        ctx.font = "bold 22px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(35, 152, 247, 0.5)";
        const currentScore = Math.floor(s.distance) + s.fragments * 100;
        ctx.fillText(`SCORE: ${currentScore}`, LOGICAL_W / 2, 40);
        ctx.restore();
      }

      // Scanlines (always on top)
      drawScanlines(ctx);

      // Continue loop only when playing
      if (s.phase === "playing") {
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [
      doDeath,
      drawMatrixRain,
      drawFloorCeiling,
      drawHazard,
      drawCollectible,
      drawParticles,
      drawScanlines,
      spawnHazard,
      spawnCollectible,
      spawnParticles,
      playSfx,
      triggerCrossfade,
    ]
  );

  /* ═══════════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════════ */

  const handleRegister = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_NAME_KEY, trimmed);
    setPlayerName(trimmed);
    resetGame();
    initPools();

    g.current.phase = "tutorial";
    g.current.lastTime = 0;
    setUiPhase("tutorial");
    setGameState("TUTORIAL");

    // We wait for the user to click the tutorial overlay before starting loop/audio
  }, [nameInput, resetGame, initPools]);

  const startPlaying = useCallback(() => {
    g.current.phase = "playing";
    g.current.lastTime = 0;
    setUiPhase("playing");
    setGameState("PLAYING");

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);

    unlockAudio();
    startBgm();
  }, [loop, unlockAudio, startBgm]);

  const handleRestart = useCallback(() => {
    resetGame();
    // Re-init pools (deactivate all)
    g.current.hazards.forEach((h) => (h.active = false));
    g.current.collectibles.forEach((c) => (c.active = false));
    g.current.particles.forEach((p) => (p.life = 0));

    g.current.phase = "tutorial";
    g.current.lastTime = 0;
    setUiPhase("tutorial");
    setGameState("TUTORIAL");
    setScoreSaved(false);

    stopAllBgm();
    cancelAnimationFrame(rafRef.current);
  }, [resetGame, stopAllBgm]);

  /* ═══════════════════════════════════════════
     MOUNT / UNMOUNT — SOP Rule 2 & 7
     ═══════════════════════════════════════════ */

  useEffect(() => {
    // Sprite — use native Image to avoid Next.js <Image> terminal warnings
    const img = new window.Image();
    img.src = "/minigame/affan-endless-runner/affanChar.png";
    img.onload = () => {
      spriteOk.current = true;
    };
    sprite.current = img;

    // Audio
    initAudio();

    // Initialize object pools
    initPools();

    // LocalStorage
    const storedName = localStorage.getItem(LS_NAME_KEY);
    const storedHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);
    setHighScore(storedHigh);

    if (storedName) {
      setPlayerName(storedName);
      g.current.phase = "tutorial";
      setUiPhase("tutorial");
      setGameState("TUTORIAL");
    } else {
      g.current.phase = "register";
      setUiPhase("register");
    }

    fetchLeaderboard();
    
    // Draw initial static frame for background, don't start continuous loop
    setTimeout(() => {
      if (canvasRef.current && containerRef.current) {
        loop(0);
        cancelAnimationFrame(rafRef.current);
      }
    }, 100);

    // ── Input Listeners ──
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (g.current.phase === "playing") {
          flipGravity();
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("[data-ui-overlay]")
      )
        return;

      if (g.current.phase === "playing") {
        e.preventDefault();
        flipGravity();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: false });

    /* ── CLEANUP — SOP Rule 2 & 7 ── */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);

      // Audio cleanup — Rule 7
      if (crossfadeIntervalRef.current) {
        clearInterval(crossfadeIntervalRef.current);
        crossfadeIntervalRef.current = null;
      }
      bgmRefs.current.forEach((a, i) => {
        if (a) {
          a.pause();
          a.src = "";
          a.load();
          bgmRefs.current[i] = null;
        }
      });
      [sfxPickerRef, sfxDeathRef].forEach((r) => {
        const a = r.current;
        if (a) {
          a.pause();
          a.src = "";
          a.load();
          r.current = null;
        }
      });
      audioReady.current = false;

      // Sprite cleanup
      if (sprite.current) {
        sprite.current.onload = null;
        sprite.current = null;
      }
      spriteOk.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-[9999] bg-black selection:bg-[#2398f7]/30 overflow-hidden">
      {/* PORTRAIT MODE BLOCKER */}
      <div className="fixed inset-0 z-[99999] bg-black text-[#2398f7] flex-col items-center justify-center portrait:flex landscape:hidden px-8">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-[#2398f7] rounded-xl transform rotate-90 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#2398f7] rounded-full absolute right-2" />
          </div>
          <svg
            className="absolute -bottom-4 -right-4 w-10 h-10 text-[#2398f7]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          </svg>
        </div>
        <p className="text-xl font-bold text-center mb-2">
          [SYSTEM_ERROR]
        </p>
        <p className="text-sm text-center text-[#2398f7]/70 max-w-xs">
          Orientation mismatch. Rotate device to{" "}
          <span className="text-[#2398f7] font-bold">LANDSCAPE</span> to
          initialize The Abyss Runner protocol.
        </p>
      </div>

      {/* CANVAS — fills container */}
      <div
        ref={containerRef}
        className="relative w-full h-[100dvh] overflow-hidden bg-black"
      >
        {/* PARALLAX HANDWRITTEN BACKGROUND */}
        <HandwrittenParallaxLayer isVisible={gameState !== "REGISTER"} />
        {/* ── BACK BUTTON ── */}
        <Link
          href="/minigame"
          className="absolute top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <canvas
          ref={canvasRef}
          className="w-full h-full block relative z-20 bg-transparent"
          style={{ imageRendering: "pixelated" }}
        />

        {/* ── TUTORIAL OVERLAY ── */}
        {gameState === "TUTORIAL" && uiPhase !== "register" && (
          <div 
            className="absolute inset-0 z-[40] flex items-center justify-center bg-black/50 cursor-pointer"
            onClick={startPlaying}
          >
            <div className="bg-[#0a0a0f]/80 p-6 rounded-xl border border-[#2398f7]/50 text-center max-w-lg shadow-[0_0_40px_rgba(35,152,247,0.2)]">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">SYSTEM INITIALIZED</h2>
              <p className="text-[#2398f7] font-mono text-lg leading-relaxed">
                💻 Laptop: Press [SPACE] to Shift Gravity<br/>
                📱 Mobile/Tab: Tap Anywhere to Shift Gravity
              </p>
              <p className="text-white/50 text-sm mt-4 animate-pulse">Click anywhere to start</p>
            </div>
          </div>
        )}
      </div>

      {/* ── REGISTER OVERLAY ── */}
      {uiPhase === "register" && (
        <div
          data-ui-overlay
          className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center px-4"
        >
          <div className="bg-[#0a0a0f] border border-[#2398f7]/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                AFFAN ENDLESS RUNNER
              </h1>
              <p className="text-[#2398f7]/60 text-sm mt-2 font-mono">
                // SHIFT GRAVITY. DODGE MEMORY LEAKS. COLLECT DATA.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={20}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="Enter your callsign..."
                className="w-full bg-black/60 border border-[#2398f7]/30 text-white px-4 py-3 rounded-lg text-center font-mono focus:outline-none focus:border-[#2398f7] transition-colors placeholder:text-white/20"
              />
              <button
                onClick={handleRegister}
                disabled={!nameInput.trim()}
                className="w-full bg-[#2398f7] hover:bg-[#1e82d4] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors text-lg will-change-transform transform-gpu active:scale-95"
              >
                ENTER THE ABYSS
              </button>
            </div>

            <div className="text-xs text-white/20 font-mono">
              TAP or SPACEBAR to flip gravity
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="border-t border-[#2398f7]/10 pt-4">
                <h3 className="text-xs font-bold text-[#2398f7]/50 uppercase tracking-wider mb-3">
                  Top Runners
                </h3>
                <div className="space-y-1">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={`${entry.player_name}-${i}`}
                      className="flex justify-between text-sm font-mono"
                    >
                      <span className="text-white/50 truncate max-w-[60%]">
                        {i + 1}. {entry.player_name}
                      </span>
                      <span className="text-[#2398f7]">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GAME OVER OVERLAY ── */}
      {uiPhase === "gameover" && (
        <div
          data-ui-overlay
          className="fixed inset-0 z-[100000] bg-black/85 flex items-center justify-center px-4"
        >
          <div className="bg-[#0a0a0f] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div>
              <h2 className="text-4xl font-black text-red-500 tracking-tight">
                SYSTEM CRASH
              </h2>
              <p className="text-white/40 text-sm mt-2 font-mono">
                // MEMORY LEAK DETECTED — PROCESS TERMINATED
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-black text-white">
                {displayScore.toLocaleString()}
              </div>
              <div className="text-sm text-[#2398f7]/60 font-mono">
                {Math.floor(g.current.distance)}m traveled · {g.current.fragments} data fragments
              </div>
              {scoreSaved && (
                <div className="text-xs text-green-400/80 font-mono mt-1">
                  ★ NEW HIGH SCORE — SAVED TO LEADERBOARD
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-[#2398f7] hover:bg-[#1e82d4] text-white font-bold py-3 rounded-lg transition-colors text-lg will-change-transform transform-gpu active:scale-95"
              >
                RE-INITIALIZE
              </button>
              <Link
                href="/minigame"
                className="block w-full bg-white/5 hover:bg-white/10 text-white/60 font-medium py-3 rounded-lg transition-colors text-sm"
              >
                EXIT TO VOID
              </Link>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="border-t border-[#2398f7]/10 pt-4">
                <h3 className="text-xs font-bold text-[#2398f7]/50 uppercase tracking-wider mb-3">
                  Top Runners
                </h3>
                <div className="space-y-1">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={`${entry.player_name}-${i}`}
                      className="flex justify-between text-sm font-mono"
                    >
                      <span className="text-white/50 truncate max-w-[60%]">
                        {i + 1}. {entry.player_name}
                      </span>
                      <span className="text-[#2398f7]">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
