"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { submitLowCortisolScore } from "./actions";

/* ═══════════════════════════════════════════════
   TYPES — SOP Rule 10: Strict TypeScript
   ═══════════════════════════════════════════════ */

type GamePhase = "REGISTER" | "TUTORIAL" | "PLAYING" | "GAME_OVER" | "VICTORY";
type Judgement = "PERFECT" | "GREAT" | "GOOD" | "MISS";

interface BeatmapNote {
  time: number;
  lane: number;
  hit: boolean;
  missed: boolean;
}

interface HitEffect {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  color: string;
}

interface LeaderboardEntry {
  player_name: string;
  score: number;
}

/** All mutable game state lives in a single ref — ZERO useState in the rAF loop */
interface GameState {
  phase: GamePhase;
  score: number;
  combo: number;
  maxCombo: number;
  hp: number;
  currentTime: number;
  beatmap: BeatmapNote[];
  hitEffects: HitEffect[];
  judgementFlash: { text: string; color: string; timer: number } | null;
  gaugeShown: boolean;
  activeLanes: boolean[];
  laneTimers: (ReturnType<typeof setTimeout> | null)[];
  lastFrameTime: number;
  isDecodingAudio: boolean;
}

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const LANE_KEYS = ["d", "f", "j", "k"] as const;
const LANE_LABELS = ["D", "F", "J", "K"] as const;
const NEON_BLUE = "#2398f7";
const NEON_BLUE_RGB = "35, 152, 247";
const NEON_RED = "#ff2d55";
const NEON_AMBER = "#ffb800";
const NEON_GREEN = "#00e676";
const LS_NAME_KEY = "affan_player_name";

const SPRITE = {
  totalFrames: 77,
  frameWidth: 374,
  frameHeight: 374,
  sheetWidth: 28798,
  fps: 14,
} as const;

const NOTE_H = 22;
const JUDGEMENT_Y_OFFSET = 100;
const NOTE_TRAVEL_TIME = 2.0;
const HIT_WINDOW_PERFECT = 0.05;
const HIT_WINDOW_GREAT = 0.10;
const HIT_WINDOW_GOOD = 0.15;
const MISS_THRESHOLD = 0.20;
const GROOVE_GAUGE_APPEAR_TIME = 31;

const SCORE_PERFECT = 300;
const SCORE_GREAT = 200;
const SCORE_GOOD = 100;

const HP_GAIN_PERFECT = 2;
const HP_GAIN_GREAT = 2;
const HP_GAIN_GOOD = 0;
const HP_LOSS_MISS = -10;

/* ═══════════════════════════════════════════════
   PROCEDURAL BEATMAP GENERATOR (500+ notes, 0–230s)
   Full 3:50 track coverage
   ═══════════════════════════════════════════════ */

function generateProceduralBeatmap(): BeatmapNote[] {
  const notes: BeatmapNote[] = [];

  // Seeded pseudo-random for consistency
  let seed = 67;
  const rand = (): number => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const pushNote = (time: number, lane: number) => {
    if (time > 228) return; // don't push past end of track
    notes.push({ time: parseFloat(time.toFixed(3)), lane, hit: false, missed: false });
  };

  // ── Phase 1: Warm-up (2s – 15s) — slow, simple patterns ──
  for (let t = 2; t < 15; t += 1.0 + rand() * 0.5) {
    pushNote(t, Math.floor(rand() * 4));
  }

  // ── Phase 2: Build-up (15s – 31s) — medium density ──
  for (let t = 15; t < 31; t += 0.5 + rand() * 0.4) {
    pushNote(t, Math.floor(rand() * 4));
    if (rand() < 0.2) {
      pushNote(t, (Math.floor(rand() * 3) + 1) % 4);
    }
  }

  // ── Phase 3: DROP 1 (31s – 65s) — high density, many doubles ──
  for (let t = 31; t < 65; t += 0.25 + rand() * 0.25) {
    const lane = Math.floor(rand() * 4);
    pushNote(t, lane);
    if (rand() < 0.3) {
      pushNote(t, (lane + 1 + Math.floor(rand() * 3)) % 4);
    }
    if (rand() < 0.1) {
      pushNote(t + 0.125, Math.floor(rand() * 4));
    }
  }

  // ── Phase 4: Breakdown (65s – 85s) — staircase patterns ──
  for (let t = 65; t < 85; t += 0.4 + rand() * 0.3) {
    const baseTime = t;
    const startLane = Math.floor(rand() * 4);
    const count = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < count && baseTime + i * 0.15 < 85; i++) {
      pushNote(baseTime + i * 0.15, (startLane + i) % 4);
    }
    t += count * 0.15;
  }

  // ── Phase 5: DROP 2 (85s – 125s) — maximum intensity ──
  for (let t = 85; t < 125; t += 0.2 + rand() * 0.2) {
    const lane = Math.floor(rand() * 4);
    pushNote(t, lane);
    if (rand() < 0.4) {
      pushNote(t, (lane + 2) % 4);
    }
    if (rand() < 0.15) {
      for (let b = 1; b <= 3; b++) {
        pushNote(t + b * 0.1, Math.floor(rand() * 4));
      }
    }
  }

  // ── Phase 6: Bridge / Cooldown (125s – 145s) — melodic breathing room ──
  for (let t = 125; t < 145; t += 0.6 + rand() * 0.5) {
    pushNote(t, Math.floor(rand() * 4));
    if (rand() < 0.15) {
      pushNote(t, (Math.floor(rand() * 3) + 1) % 4);
    }
  }

  // ── Phase 7: Re-build (145s – 160s) — tension rising ──
  for (let t = 145; t < 160; t += 0.4 + rand() * 0.3) {
    pushNote(t, Math.floor(rand() * 4));
    if (rand() < 0.25) {
      pushNote(t, (Math.floor(rand() * 3) + 1) % 4);
    }
    // Alternating staircase
    if (rand() < 0.2) {
      const sl = Math.floor(rand() * 4);
      pushNote(t + 0.12, (sl + 1) % 4);
      pushNote(t + 0.24, (sl + 2) % 4);
    }
  }

  // ── Phase 8: DROP 3 / Climax (160s – 200s) — peak intensity ──
  for (let t = 160; t < 200; t += 0.2 + rand() * 0.18) {
    const lane = Math.floor(rand() * 4);
    pushNote(t, lane);
    // 45% double
    if (rand() < 0.45) {
      pushNote(t, (lane + 2) % 4);
    }
    // 20% burst triplet
    if (rand() < 0.2) {
      for (let b = 1; b <= 3; b++) {
        pushNote(t + b * 0.09, Math.floor(rand() * 4));
      }
    }
    // 8% quad chord
    if (rand() < 0.08) {
      pushNote(t, 0); pushNote(t, 1); pushNote(t, 2); pushNote(t, 3);
    }
  }

  // ── Phase 9: Outro fade (200s – 222s) — decelerating ──
  for (let t = 200; t < 222; t += 0.5 + rand() * 0.6) {
    pushNote(t, Math.floor(rand() * 4));
    if (rand() < 0.1) {
      pushNote(t, (Math.floor(rand() * 3) + 1) % 4);
    }
  }

  // ── Phase 10: Final chord (225s) ──
  pushNote(225, 0);
  pushNote(225, 1);
  pushNote(225, 2);
  pushNote(225, 3);

  // Sort by time
  notes.sort((a, b) => a.time - b.time);
  return notes;
}

/* ═══════════════════════════════════════════════
   CANVAS DRAWING HELPERS
   ═══════════════════════════════════════════════ */

function drawHPBar(
  ctx: CanvasRenderingContext2D,
  w: number,
  hp: number,
  time: number
) {
  const barW = w * 0.8;
  const barH = 10;
  const x = (w - barW) / 2;
  const y = 8;

  // Background track
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x, y, barW, barH);

  // HP fill color: green → yellow → blinking red
  let fillColor: string;
  if (hp > 50) {
    fillColor = NEON_GREEN;
  } else if (hp > 25) {
    fillColor = NEON_AMBER;
  } else {
    // Blinking red
    const blink = Math.sin(time * 12) > 0 ? 1 : 0.3;
    fillColor = `rgba(255, 45, 85, ${blink})`;
  }

  const fillW = barW * Math.max(0, hp / 100);
  ctx.save();
  ctx.shadowColor = fillColor;
  ctx.shadowBlur = hp <= 25 ? 15 : 8;
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, fillW, barH);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barW, barH);

  // HP text
  ctx.save();
  ctx.font = "bold 10px 'Inter', monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(`HP ${Math.max(0, Math.ceil(hp))}%`, x + barW, y + barH + 14);
  ctx.restore();
}

function drawLanes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  activeLanes: boolean[]
) {
  const laneW = w / 4;
  const judgementY = h - JUDGEMENT_Y_OFFSET;

  // Lane separator lines
  ctx.strokeStyle = `rgba(${NEON_BLUE_RGB}, 0.1)`;
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneW, 0);
    ctx.lineTo(i * laneW, h);
    ctx.stroke();
  }

  // Lane glow on active hit
  for (let i = 0; i < 4; i++) {
    if (activeLanes[i]) {
      const grd = ctx.createLinearGradient(0, judgementY - 40, 0, h);
      grd.addColorStop(0, `rgba(${NEON_BLUE_RGB}, 0.3)`);
      grd.addColorStop(1, `rgba(${NEON_BLUE_RGB}, 0.02)`);
      ctx.fillStyle = grd;
      ctx.fillRect(i * laneW, judgementY - 40, laneW, h - judgementY + 40);
    }
  }

  // Judgement line — neon glow
  ctx.save();
  ctx.shadowColor = NEON_BLUE;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = `rgba(${NEON_BLUE_RGB}, 0.85)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, judgementY);
  ctx.lineTo(w, judgementY);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // Target circles on judgement line
  for (let i = 0; i < 4; i++) {
    const cx = i * laneW + laneW / 2;
    ctx.strokeStyle = `rgba(${NEON_BLUE_RGB}, 0.2)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, judgementY, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawNotes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  beatmap: BeatmapNote[],
  currentTime: number,
  mobile: boolean
) {
  const laneW = w / 4;
  const judgementY = h - JUDGEMENT_Y_OFFSET;
  const noteW = laneW * 0.65;

  for (const note of beatmap) {
    if (note.hit || note.missed) continue;
    const timeDiff = note.time - currentTime;
    if (timeDiff < -MISS_THRESHOLD || timeDiff > NOTE_TRAVEL_TIME + 0.5) continue;

    const progress = 1 - timeDiff / NOTE_TRAVEL_TIME;
    const noteY = progress * judgementY - NOTE_H / 2;
    if (noteY < -NOTE_H * 2 || noteY > h + NOTE_H) continue;

    const cx = note.lane * laneW + laneW / 2;
    const nx = cx - noteW / 2;
    const r = 5;

    ctx.save();
    if (!mobile) {
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 10;
    }

    // Outer glow
    ctx.fillStyle = `rgba(${NEON_BLUE_RGB}, 0.12)`;
    ctx.fillRect(nx - 3, noteY - 3, noteW + 6, NOTE_H + 6);

    // Note body — gradient
    const grd = ctx.createLinearGradient(nx, noteY, nx + noteW, noteY);
    grd.addColorStop(0, `rgba(${NEON_BLUE_RGB}, 0.65)`);
    grd.addColorStop(0.5, `rgba(${NEON_BLUE_RGB}, 1)`);
    grd.addColorStop(1, `rgba(${NEON_BLUE_RGB}, 0.65)`);
    ctx.fillStyle = grd;

    // Rounded rect
    ctx.beginPath();
    ctx.moveTo(nx + r, noteY);
    ctx.lineTo(nx + noteW - r, noteY);
    ctx.quadraticCurveTo(nx + noteW, noteY, nx + noteW, noteY + r);
    ctx.lineTo(nx + noteW, noteY + NOTE_H - r);
    ctx.quadraticCurveTo(nx + noteW, noteY + NOTE_H, nx + noteW - r, noteY + NOTE_H);
    ctx.lineTo(nx + r, noteY + NOTE_H);
    ctx.quadraticCurveTo(nx, noteY + NOTE_H, nx, noteY + NOTE_H - r);
    ctx.lineTo(nx, noteY + r);
    ctx.quadraticCurveTo(nx, noteY, nx + r, noteY);
    ctx.fill();

    // Highlight stripe
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(nx + 3, noteY + 2, noteW - 6, NOTE_H * 0.3);

    ctx.restore();
  }
}

function drawHitEffects(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  effects: HitEffect[],
  dt: number
) {
  const judgementY = h - JUDGEMENT_Y_OFFSET;
  for (let i = effects.length - 1; i >= 0; i--) {
    const fx = effects[i];
    fx.timer -= dt;
    if (fx.timer <= 0) {
      effects.splice(i, 1);
      continue;
    }
    const progress = 1 - fx.timer / fx.maxTimer;
    const alpha = 1 - progress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = fx.color;
    ctx.lineWidth = 2.5 * alpha;
    ctx.beginPath();
    ctx.arc(fx.x, judgementY, 18 + progress * 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowColor = fx.color;
    ctx.shadowBlur = 18 * alpha;
    ctx.fillStyle = fx.color;
    ctx.beginPath();
    ctx.arc(fx.x, judgementY, 6 * (1 - progress * 0.6), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawJudgementText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  flash: GameState["judgementFlash"],
  dt: number
): GameState["judgementFlash"] {
  if (!flash) return null;
  flash.timer -= dt;
  if (flash.timer <= 0) return null;

  const alpha = Math.min(1, flash.timer / 0.2);
  const yOff = (1 - alpha) * -25;
  const judgementY = h - JUDGEMENT_Y_OFFSET;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = "bold 26px 'Inter', 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = flash.color;
  ctx.shadowColor = flash.color;
  ctx.shadowBlur = 14;
  ctx.fillText(flash.text, w / 2, judgementY - 55 + yOff);
  ctx.restore();

  return flash;
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  w: number,
  score: number,
  combo: number,
  currentTime: number
) {
  // Score — top right
  ctx.save();
  ctx.font = "bold 10px 'Inter', monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("SCORE", w - 14, 40);
  ctx.font = "bold 22px 'Inter', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(score.toLocaleString(), w - 14, 62);
  ctx.restore();

  // Combo — center-top
  if (combo > 0) {
    ctx.save();
    ctx.textAlign = "center";
    if (combo > 20) {
      ctx.fillStyle = NEON_GREEN;
      ctx.shadowColor = NEON_GREEN;
      ctx.shadowBlur = 12;
    } else if (combo > 10) {
      ctx.fillStyle = NEON_BLUE;
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
    }
    ctx.font = "bold 32px 'Inter', sans-serif";
    ctx.fillText(`${combo}`, w / 2, 58);
    ctx.shadowBlur = 0;
    ctx.font = "bold 10px 'Inter', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillText("COMBO", w / 2, 72);
    ctx.restore();
  }

  // Time — top left
  const m = Math.floor(currentTime / 60);
  const s = Math.floor(currentTime % 60);
  ctx.save();
  ctx.font = "bold 10px 'Inter', monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("TIME", 14, 40);
  ctx.font = "bold 18px 'Inter', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(`${m}:${s.toString().padStart(2, "0")}`, 14, 60);
  ctx.restore();
}

function drawKeyLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  activeLanes: boolean[]
) {
  const laneW = w / 4;
  const labelY = h - 28;
  for (let i = 0; i < 4; i++) {
    const cx = i * laneW + laneW / 2;
    ctx.save();
    ctx.font = "bold 16px 'Inter', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (activeLanes[i]) {
      ctx.fillStyle = NEON_BLUE;
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.15)";
    }
    ctx.fillText(LANE_LABELS[i], cx, labelY);
    ctx.restore();
  }
}

function drawScanlines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "rgba(0,0,0,0.025)";
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
}

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function LowCortisolEngine() {
  // Lock body scroll on mount
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require("react").useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }, []);
  }
  /* ── React State: ONLY for UI overlays that need re-render ── */
  const [phase, setPhase] = useState<GamePhase>("REGISTER");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showGauge, setShowGauge] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Snapshot for game-over display (captured once at death)
  const [deathSnapshot, setDeathSnapshot] = useState({ score: 0, maxCombo: 0 });

  /* ── ALL mutable game state in a single ref — NEVER triggers re-render ── */
  const g = useRef<GameState>({
    phase: "REGISTER",
    score: 0,
    combo: 0,
    maxCombo: 0,
    hp: 100,
    currentTime: 0,
    beatmap: [],
    hitEffects: [],
    judgementFlash: null,
    gaugeShown: false,
    activeLanes: [false, false, false, false],
    laneTimers: [null, null, null, null],
    lastFrameTime: 0,
    isDecodingAudio: false,
  });

  /* ── Refs — SOP Rule 2 & 7 ── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const canvasSizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const phaseRef = useRef<GamePhase>("REGISTER");
  const playerNameRef = useRef("");

  /* ── Keep refs in sync with React state ── */
  useEffect(() => {
    phaseRef.current = phase;
    g.current.phase = phase;
  }, [phase]);
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  /* ── Leaderboard ── */
  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await (supabase.from("minigame_scores") as any)
        .select("player_name,score")
        .eq("game_slug", "affan_low_cortisol")
        .order("score", { ascending: false })
        .limit(5);
      if (!error && data) setLeaderboard(data as LeaderboardEntry[]);
    } catch (err) {
      console.error("[LowCortisol] Leaderboard fetch failed", err);
    }
  }, []);

  /* ── Mobile Detection — SOP Rule 2 ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Mount: Load name & leaderboard ── */
  useEffect(() => {
    const stored = localStorage.getItem(LS_NAME_KEY);
    if (stored) {
      setPlayerName(stored);
      setNameInput(stored);
    }
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  /* ══════════════════════════════════════
     AUDIO ENGINE — SOP Rule 7
     ══════════════════════════════════════ */

  const initAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      return audioContextRef.current;
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    return ctx;
  }, []);

  const loadAudioBuffer = useCallback(async (ctx: AudioContext): Promise<AudioBuffer> => {
    if (audioBufferRef.current) return audioBufferRef.current;
    const response = await fetch("/minigame/affan-low-cortisol/low-cortisol-music.mp3");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    audioBufferRef.current = buffer;
    return buffer;
  }, []);

  const stopAllAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /* ══════════════════════════════════════
     HIT DETECTION — operates entirely on refs
     ══════════════════════════════════════ */

  const handleHit = useCallback((laneIndex: number) => {
    const s = g.current;
    if (s.phase !== "PLAYING") return;

    // Visual lane flash via ref (no setState)
    s.activeLanes[laneIndex] = true;
    if (s.laneTimers[laneIndex]) clearTimeout(s.laneTimers[laneIndex]!);
    s.laneTimers[laneIndex] = setTimeout(() => {
      s.activeLanes[laneIndex] = false;
      s.laneTimers[laneIndex] = null;
    }, 100);

    // Find closest unhit note in this lane
    const currentTime = s.currentTime;
    let bestNote: BeatmapNote | null = null;
    let bestDiff = Infinity;

    for (const note of s.beatmap) {
      if (note.lane !== laneIndex || note.hit || note.missed) continue;
      const diff = Math.abs(note.time - currentTime);
      if (diff < bestDiff && diff <= HIT_WINDOW_GOOD) {
        bestDiff = diff;
        bestNote = note;
      }
    }
    if (!bestNote) return;

    bestNote.hit = true;

    let scoreVal: number;
    let hpDelta: number;
    let color: string;
    let text: string;

    if (bestDiff <= HIT_WINDOW_PERFECT) {
      text = "PERFECT"; scoreVal = SCORE_PERFECT; hpDelta = HP_GAIN_PERFECT; color = NEON_GREEN;
    } else if (bestDiff <= HIT_WINDOW_GREAT) {
      text = "GREAT"; scoreVal = SCORE_GREAT; hpDelta = HP_GAIN_GREAT; color = NEON_BLUE;
    } else {
      text = "GOOD"; scoreVal = SCORE_GOOD; hpDelta = HP_GAIN_GOOD; color = NEON_AMBER;
    }

    s.combo += 1;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const comboMult = 1 + Math.floor(s.combo / 10) * 0.1;
    s.score += Math.floor(scoreVal * comboMult);
    s.hp = Math.min(100, s.hp + hpDelta);

    // Hit effect
    const canvas = canvasRef.current;
    const canvasW = canvas ? (canvas.width / Math.min(window.devicePixelRatio || 1, 1.5)) : 400;
    const laneW = canvasW / 4;
    s.hitEffects.push({
      x: laneIndex * laneW + laneW / 2,
      y: 0,
      timer: 0.35,
      maxTimer: 0.35,
      color,
    });

    s.judgementFlash = { text, color, timer: 0.45 };
  }, []);

  /* ══════════════════════════════════════
     GAME OVER
     ══════════════════════════════════════ */

  const doGameOver = useCallback(async () => {
    const s = g.current;
    stopAllAudio();

    // Snapshot for UI
    setDeathSnapshot({ score: s.score, maxCombo: s.maxCombo });
    setPhase("GAME_OVER");

    // Jumpscare SFX — SOP Rule 7 safe
    if (!loseAudioRef.current) {
      loseAudioRef.current = new Audio("/minigame/affan-low-cortisol/challenge-lose.mp3");
      loseAudioRef.current.volume = 0.8;
    }
    loseAudioRef.current.currentTime = 0;
    loseAudioRef.current.play().catch(() => {});

    // Submit score
    const name = playerNameRef.current;
    if (name && s.score > 0) {
      const result = await submitLowCortisolScore({
        player_name: name,
        game_slug: "affan_low_cortisol",
        score: s.score,
      });
      if (result.success) setScoreSaved(true);
      fetchLeaderboard();
    }
  }, [stopAllAudio, fetchLeaderboard]);

  const doVictory = useCallback(async () => {
    const s = g.current;
    stopAllAudio();

    setDeathSnapshot({ score: s.score, maxCombo: s.maxCombo });
    setPhase("VICTORY");

    // Success SFX
    if (!winAudioRef.current) {
      winAudioRef.current = new Audio("/minigame/affan-low-cortisol/success.mp3");
      winAudioRef.current.volume = 0.8;
    }
    winAudioRef.current.currentTime = 0;
    winAudioRef.current.play().catch(() => {});

    // Submit score
    const name = playerNameRef.current;
    if (name && s.score > 0) {
      const result = await submitLowCortisolScore({
        player_name: name,
        game_slug: "affan_low_cortisol",
        score: s.score,
      });
      if (result.success) setScoreSaved(true);
      fetchLeaderboard();
    }
  }, [stopAllAudio, fetchLeaderboard]);

  /* ══════════════════════════════════════
     MAIN GAME LOOP — rAF, ZERO setState
     ══════════════════════════════════════ */

  const gameLoop = useCallback((timestamp: number) => {
    const s = g.current;
    if (s.phase !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d") ?? null;
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Delta time
    if (s.lastFrameTime === 0) s.lastFrameTime = timestamp;
    const dt = Math.min((timestamp - s.lastFrameTime) / 1000, 0.05);
    s.lastFrameTime = timestamp;

    if (!s.isDecodingAudio) {
      // Audio time as source of truth
      if (audioContextRef.current && sourceNodeRef.current) {
        s.currentTime = audioContextRef.current.currentTime - startTimeRef.current;
      }

      // Win condition check
      if (s.currentTime >= 230) {
        doVictory();
        return;
      }

      // Groove gauge — single setState call, guarded. Fades out on mobile at 90s
      const shouldShowGauge = isMobile 
        ? s.currentTime >= GROOVE_GAUGE_APPEAR_TIME && s.currentTime < 90
        : s.currentTime >= GROOVE_GAUGE_APPEAR_TIME;

      if (shouldShowGauge !== s.gaugeShown) {
        s.gaugeShown = shouldShowGauge;
        setShowGauge(shouldShowGauge);
      }

      // Miss detection (operates on refs only)
      for (const note of s.beatmap) {
        if (note.hit || note.missed) continue;
        if (s.currentTime - note.time > MISS_THRESHOLD) {
          note.missed = true;
          s.combo = 0;
          s.hp = Math.max(0, s.hp + HP_LOSS_MISS);
          s.judgementFlash = { text: "MISS", color: NEON_RED, timer: 0.35 };
        }
      }

      // Game over
      if (s.hp <= 0) {
        doGameOver();
        return;
      }
    }

    // Canvas sizing
    const container = containerRef.current;
    if (container) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = container.getBoundingClientRect();
      const newW = Math.round(rect.width * dpr);
      const newH = Math.round(rect.height * dpr);
      const cached = canvasSizeRef.current;
      if (newW !== cached.w || newH !== cached.h || dpr !== cached.dpr) {
        canvas.width = newW;
        canvas.height = newH;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        canvasSizeRef.current = { w: newW, h: newH, dpr };
        ctx.scale(dpr, dpr);
      }
    }

    const dpr = canvasSizeRef.current.dpr || Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Clear
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(5, 5, 10, 0.88)";
    ctx.fillRect(0, 0, w, h);

    // Draw everything on canvas — ZERO DOM updates
    drawHPBar(ctx, w, s.hp, s.currentTime);
    drawLanes(ctx, w, h, s.activeLanes);
    
    if (s.isDecodingAudio) {
      ctx.save();
      ctx.fillStyle = NEON_BLUE;
      ctx.shadowColor = NEON_BLUE;
      ctx.shadowBlur = 15;
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      const alpha = 0.5 + Math.sin(timestamp / 150) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillText("SYNCING BEAT...", w / 2, h / 2);
      ctx.restore();
    } else {
      drawNotes(ctx, w, h, s.beatmap, s.currentTime, isMobile);
      drawHitEffects(ctx, w, h, s.hitEffects, dt);
      s.judgementFlash = drawJudgementText(ctx, w, h, s.judgementFlash, dt);
    }
    
    drawHUD(ctx, w, s.score, s.combo, s.currentTime);
    if (!isMobile) drawKeyLabels(ctx, w, h, s.activeLanes);


    rafRef.current = requestAnimationFrame(gameLoop);
  }, [doGameOver, doVictory, isMobile]);

  /* ══════════════════════════════════════
     START GAME
     ══════════════════════════════════════ */

  const startGame = useCallback(async () => {
    const s = g.current;
    s.score = 0;
    s.combo = 0;
    s.maxCombo = 0;
    s.hp = 100;
    s.currentTime = 0;
    s.hitEffects = [];
    s.judgementFlash = null;
    s.gaugeShown = false;
    s.activeLanes = [false, false, false, false];
    s.laneTimers.forEach((t) => { if (t) clearTimeout(t); });
    s.laneTimers = [null, null, null, null];
    s.beatmap = generateProceduralBeatmap();
    s.lastFrameTime = 0;
    s.isDecodingAudio = true;

    setShowGauge(false);
    setScoreSaved(false);

    // Initialize audio context during user interaction to satisfy browser policies
    await initAudioContext();

    s.phase = "PLAYING";
    setPhase("PLAYING");
  }, [initAudioContext]);

  // Handle Canvas Mount and Engine Start securely
  useEffect(() => {
    if (phase === "PLAYING") {
      let isCancelled = false;

      const startEngine = async () => {
        // Wait for React to paint the <canvas> to the DOM
        await new Promise((resolve) => setTimeout(resolve, 0));
        // IMMEDIATELY start RAF loop to avoid blank canvas while decoding
        g.current.isDecodingAudio = true;
        rafRef.current = requestAnimationFrame(gameLoop);

        const ctx = await initAudioContext();
        const buffer = await loadAudioBuffer(ctx);
        if (isCancelled) return;

        if (sourceNodeRef.current) {
          try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
          sourceNodeRef.current.disconnect();
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        sourceNodeRef.current = source;
        startTimeRef.current = ctx.currentTime;

        source.onended = () => {
          // handled by gameLoop
        };

        g.current.isDecodingAudio = false;
      };

      startEngine();

      return () => {
        isCancelled = true;
      };
    }
  }, [phase, initAudioContext, loadAudioBuffer, gameLoop]);

  /* ══════════════════════════════════════
     KEYBOARD — SOP Rule 2
     ══════════════════════════════════════ */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (g.current.phase !== "PLAYING") return;
      const idx = LANE_KEYS.indexOf(e.key.toLowerCase() as any);
      if (idx === -1) return;
      e.preventDefault();
      handleHit(idx);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleHit]);

  /* ══════════════════════════════════════
     HANDLERS
     ══════════════════════════════════════ */

  const handleRegister = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_NAME_KEY, trimmed);
    setPlayerName(trimmed);
    setPhase("TUTORIAL");
  }, [nameInput]);

  const handleStart = useCallback(() => { startGame(); }, [startGame]);
  const handleRestart = useCallback(() => { stopAllAudio(); startGame(); }, [stopAllAudio, startGame]);
  const handleBackToBriefing = useCallback(() => { stopAllAudio(); setPhase("TUTORIAL"); }, [stopAllAudio]);

  /* ══════════════════════════════════════
     MASTER CLEANUP — SOP Rule 2 & 7
     ══════════════════════════════════════ */

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (loseAudioRef.current) {
        loseAudioRef.current.pause();
        loseAudioRef.current.src = "";
        loseAudioRef.current.load();
        loseAudioRef.current = null;
      }
      if (winAudioRef.current) {
        winAudioRef.current.pause();
        winAudioRef.current.src = "";
        winAudioRef.current.load();
        winAudioRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      const s = g.current;
      s.laneTimers.forEach((t) => { if (t) clearTimeout(t); });
      s.laneTimers = [null, null, null, null];
    };
  }, []);

  /* ══════════════════════════════════════
     HELPERS
     ══════════════════════════════════════ */

  const getHealthColor = (h: number): string => {
    if (h > 50) return NEON_GREEN;
    if (h > 25) return NEON_AMBER;
    return NEON_RED;
  };

  /* ═══════════════════════════════════════════════
     RENDER — Minimal DOM, heavy lifting is on canvas
     ═══════════════════════════════════════════════ */

  const isActive = phase === "PLAYING";

  return (
    <div className="fixed inset-0 z-[100] w-[100dvw] h-[100dvh] max-w-none overflow-hidden flex flex-col bg-zinc-950 selection:bg-[#2398f7]/30 font-mono touch-none select-none">
      {/* ═══ KEYFRAMES ═══ */}
      <style jsx global>{`
        @keyframes playSprite {
          from { background-position: 0 0; }
          to { background-position: -${SPRITE.sheetWidth}px 0; }
        }
        @keyframes scanline-sweep {
          0% { transform: translateY(-100%) translateZ(0); }
          100% { transform: translateY(100vh) translateZ(0); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 12px rgba(${NEON_BLUE_RGB}, 0.3), inset 0 0 12px rgba(${NEON_BLUE_RGB}, 0.1); }
          50% { box-shadow: 0 0 28px rgba(${NEON_BLUE_RGB}, 0.6), inset 0 0 28px rgba(${NEON_BLUE_RGB}, 0.2); }
        }
        @keyframes glitch-noise {
          0%, 100% { clip-path: inset(0 0 96% 0); }
          10% { clip-path: inset(38% 0 22% 0); }
          20% { clip-path: inset(78% 0 2% 0); }
          30% { clip-path: inset(12% 0 58% 0); }
          40% { clip-path: inset(48% 0 32% 0); }
          50% { clip-path: inset(22% 0 48% 0); }
          60% { clip-path: inset(68% 0 12% 0); }
          70% { clip-path: inset(2% 0 78% 0); }
          80% { clip-path: inset(32% 0 38% 0); }
          90% { clip-path: inset(58% 0 22% 0); }
        }
      `}</style>

      {/* ═══ BACK BUTTON ═══ */}
      <Link
        href="/minigame"
        className="fixed top-6 left-6 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* ═══ LAYER 1: Deep Abyss Background ═══ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/minigame/affan-low-cortisol/affanPeci.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            mixBlendMode: "luminosity",
            transform: "translateZ(0)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>

      {/* ═══ LAYER 2: Hologram Tachyon Sprite ═══ */}
      {isActive && (
        <div className="relative z-10 flex flex-col justify-center items-center mt-8 mb-4 pointer-events-none">
          <div
            className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden"
            style={{
              border: `2px solid ${NEON_BLUE}`,
              animation: "pulse-border 2.5s ease-in-out infinite",
              willChange: "box-shadow",
              transform: "translateZ(0)",
            }}
          >
            {/* Sprite: GPU-accelerated, screen blend to kill grey bg, perfectly scaled inside bounds */}
            <div
              className="absolute left-1/2 top-1/2 w-[374px] h-[374px] -translate-x-1/2 -translate-y-1/2 scale-[0.513] md:scale-[0.684]"
              style={{
                backgroundImage: "url(/minigame/affan-low-cortisol/tachyonLowCortisol.png)",
                backgroundRepeat: "no-repeat",
                backgroundSize: `${SPRITE.sheetWidth}px ${SPRITE.frameHeight}px`,
                animation: "playSprite 3s steps(77) infinite",
                mixBlendMode: "screen",
                filter: "contrast(1.4) brightness(1.2)",
                willChange: "background-position, transform",
              }}
            />
            {/* CRT scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(${NEON_BLUE_RGB}, 0.04) 2px, rgba(${NEON_BLUE_RGB}, 0.04) 4px)`,
              }}
            />
            {/* Moving scanline */}
            <div
              className="absolute left-0 right-0 h-[2px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(${NEON_BLUE_RGB}, 0.5), transparent)`,
                animation: "scanline-sweep 3s linear infinite",
                willChange: "transform",
                transform: "translateZ(0)",
              }}
            />
          </div>
          <div className="text-center mt-1">
            <span className="text-[10px] text-[#2398f7]/40 tracking-[0.3em] uppercase">TACHYON.SYNC</span>
          </div>
        </div>
      )}

      {/* ═══ LAYER 3: Groove Gauge (MASSIVE) ═══ */}
      <AnimatePresence>
        {showGauge && isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-4 md:top-20 right-4 md:right-10 z-50 pointer-events-none origin-top-right scale-110"
            style={{ willChange: "opacity" }}
          >
            <div style={{ animation: "pulse-border 3s ease-in-out infinite" }}>
              <div style={{ transform: "scale(1.1) translateZ(0)" }}>
                <div className="relative w-40 md:w-96 h-auto">
                <Image
                  src="/minigame/affan-low-cortisol/lowCortisol.webp"
                  alt="Cortisol Level Gauge"
                  width={612}
                  height={367}
                  className="w-full h-auto"
                  unoptimized
                />
                {/* Needle rotation: hp 100 = left/green, hp 0 = right/red */}
                <div
                  className="absolute bottom-[14%] left-1/2 origin-bottom"
              style={{
                width: "2px",
                height: "32%",
                background: `linear-gradient(to top, #1a1a1a, ${getHealthColor(g.current.hp)})`,
                transform: `translateX(-50%) rotate(${-90 + (100 - g.current.hp) * 1.8}deg) translateZ(0)`,
              }}
            />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LAYER 4: Canvas Rhythm Engine ═══ */}
      {isActive && (
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div
            ref={containerRef}
            className={`relative ${isMobile ? "w-full" : "w-[400px]"} overflow-hidden pointer-events-auto`}
            style={{
              height: isMobile ? "calc(100dvh - 240px)" : "calc(100dvh - 280px)",
              borderLeft: `1px solid rgba(${NEON_BLUE_RGB}, 0.12)`,
              borderRight: `1px solid rgba(${NEON_BLUE_RGB}, 0.12)`,
              borderTop: `1px solid rgba(${NEON_BLUE_RGB}, 0.08)`,
              transform: "translateZ(0)",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full max-w-none object-contain"
              style={{ touchAction: "none", imageRendering: "auto" }}
            />
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
              }}
            />
            {/* Mobile touch zones */}
            {isMobile && (
              <div className="absolute bottom-6 left-0 right-0 h-[140px] z-30 flex">
                {LANE_KEYS.map((key, i) => (
                  <button
                    key={key}
                    className="flex-1 w-full py-6 relative active:bg-[#2398f7]/20 transition-colors will-change-transform transform-gpu"
                    style={{
                      borderLeft: i > 0 ? `1px solid rgba(${NEON_BLUE_RGB}, 0.12)` : "none",
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleHit(i);
                    }}
                  >
                    <span className="hidden md:flex text-[#2398f7]/25 text-xs font-bold">{LANE_LABELS[i]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PHASE: REGISTER ═══ */}
      {phase === "REGISTER" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-zinc-950/95" />
          <div
            className="relative z-10 max-w-md w-full mx-4 p-8 rounded-2xl font-mono"
            style={{
              background: "linear-gradient(135deg, rgba(8,8,12,0.97), rgba(15,15,25,0.97))",
              border: `1px solid rgba(${NEON_BLUE_RGB}, 0.2)`,
              boxShadow: `0 0 80px rgba(${NEON_BLUE_RGB}, 0.08)`,
            }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
              AFFAN<br />
              <span style={{ color: NEON_BLUE }}>LOW CORTISOL</span>
            </h1>
            <p className="text-white/25 text-xs mb-6 leading-relaxed">
              {">"} EDM RHYTHM PROTOCOL // CORTISOL MANAGEMENT SYSTEM
            </p>

            {/* Earphone warning */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg mb-6"
              style={{
                background: `rgba(${NEON_BLUE_RGB}, 0.06)`,
                border: `1px solid rgba(${NEON_BLUE_RGB}, 0.15)`,
              }}
            >
              <svg className="w-5 h-5 shrink-0" style={{ color: NEON_BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
              <span className="text-xs text-white/50">
                <strong className="text-white/70">Earphone Required.</strong>{" "}
                Audio-driven experience. Plug in for precision.
              </span>
            </div>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="ENTER_CALLSIGN..."
              maxLength={30}
              autoFocus
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white placeholder-white/20 outline-none transition-all mb-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => { e.target.style.borderColor = `rgba(${NEON_BLUE_RGB}, 0.5)`; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
              onKeyDown={(e) => { if (e.key === "Enter") handleRegister(); e.stopPropagation(); }}
            />

            <button
              onClick={handleRegister}
              disabled={!nameInput.trim()}
              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all will-change-transform transform-gpu active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: nameInput.trim() ? `linear-gradient(135deg, ${NEON_BLUE}, #1a7ad4)` : "rgba(255,255,255,0.04)",
                color: nameInput.trim() ? "white" : "rgba(255,255,255,0.25)",
                boxShadow: nameInput.trim() ? `0 4px 24px rgba(${NEON_BLUE_RGB}, 0.35)` : "none",
              }}
            >
              INITIALIZE PROTOCOL
            </button>

            {leaderboard.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] mb-3">Top Protocols</p>
                <div className="space-y-1.5">
                  {leaderboard.map((entry, i) => (
                    <div key={`${entry.player_name}-${i}`} className="flex items-center justify-between text-xs">
                      <span className="text-white/40 truncate mr-2">
                        <span className="text-white/15 mr-2">{i + 1}.</span>
                        {entry.player_name}
                      </span>
                      <span className="text-[#2398f7] font-black tabular-nums">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PHASE: TUTORIAL ═══ */}
      {phase === "TUTORIAL" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-zinc-950/90" />
          <div
            className="relative z-10 max-w-md w-full mx-4 p-8 rounded-2xl font-mono"
            style={{
              background: "linear-gradient(135deg, rgba(8,8,12,0.97), rgba(15,15,25,0.97))",
              border: `1px solid rgba(${NEON_BLUE_RGB}, 0.2)`,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#2398f7] rounded-full animate-pulse" />
              <h3 className="text-[#2398f7] text-xs font-bold uppercase tracking-[0.2em]">SYSTEM BRIEFING</h3>
            </div>
            <p className="text-white/40 text-xs mb-1">
              {">"} Playing as <span className="text-[#2398f7]">{playerName}</span>
            </p>
            <div className="space-y-3 mt-4">
              <p className="text-white/30 text-xs leading-relaxed">
                {">"} OBJECTIVE: Hit the falling notes as they cross the Judgement Line.
                Keep your HP above zero or the void consumes you.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/[0.03] border border-white/5 rounded px-3 py-2">
                  <span className="text-[#2398f7] font-bold">D F J K</span>
                  <span className="text-white/30"> — Hit Lanes</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded px-3 py-2">
                  <span className="text-[#2398f7] font-bold">TIMING</span>
                  <span className="text-white/30"> — PERFECT / GREAT / GOOD</span>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded px-3 py-2 col-span-2">
                  <span className="text-[#2398f7] font-bold">MOBILE</span>
                  <span className="text-white/30"> — Tap the lane zones at the bottom</span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] px-1">
                <span style={{ color: NEON_GREEN }}>■ PERFECT ±50ms</span>
                <span style={{ color: NEON_BLUE }}>■ GREAT ±100ms</span>
                <span style={{ color: NEON_AMBER }}>■ GOOD ±150ms</span>
                <span style={{ color: NEON_RED }}>■ MISS</span>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded px-3 py-2 text-[10px]">
                <span className="text-[#2398f7] font-bold">HP BAR</span>
                <span className="text-white/30"> — Hit: +2 HP / Miss: -10 HP / Game Over at 0%</span>
              </div>
            </div>
            <button
              onClick={handleStart}
              className="w-full mt-6 py-3 bg-[#2398f7] hover:bg-[#1e82d4] text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-[0.97] animate-pulse"
            >
              {">"} BEGIN PROTOCOL
            </button>
          </div>
        </div>
      )}

      {/* ═══ PHASE: GAME OVER ═══ */}
      {phase === "GAME_OVER" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,45,85,0.12), rgba(5,5,10,0.98))" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: NEON_RED,
              opacity: 0.02,
              animation: "glitch-noise 0.15s infinite",
              willChange: "clip-path",
              transform: "translateZ(0)",
            }}
          />
          <div
            className="relative z-10 text-center max-w-sm mx-4 p-8 rounded-2xl font-mono"
            style={{
              background: "rgba(8,8,12,0.96)",
              border: "1px solid rgba(255,45,85,0.25)",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-black mb-2"
              style={{ color: NEON_RED, textShadow: "0 0 30px rgba(255,45,85,0.4)" }}
            >
              HIGH CORTISOL
            </h2>
            <p className="text-white/30 text-xs mb-6">The void consumed your rhythm.</p>

            <div className="bg-white/[0.03] rounded-xl px-6 py-4 mb-3 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Score</span>
                <span className="text-white font-black tabular-nums">{deathSnapshot.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Max Combo</span>
                <span className="text-[#2398f7] font-black tabular-nums">{deathSnapshot.maxCombo}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Health</span>
                <span className="font-black tabular-nums" style={{ color: NEON_RED }}>0%</span>
              </div>
            </div>

            {scoreSaved ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400/70 text-xs font-medium mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Score Saved for {playerName}
              </div>
            ) : (
              <p className="text-white/20 text-xs mb-4">
                {deathSnapshot.score === 0 ? "> Score too low to upload" : "> Uploading..."}
              </p>
            )}

            <button
              onClick={handleRestart}
              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all will-change-transform transform-gpu active:scale-[0.97]"
              style={{
                background: `linear-gradient(135deg, ${NEON_BLUE}, #1a7ad4)`,
                color: "white",
              }}
            >
              REINITIALIZE PROTOCOL
            </button>
            <button
              onClick={handleBackToBriefing}
              className="block w-full mt-2 text-white/20 text-xs hover:text-white/40 transition-colors py-2"
            >
              ← Back to Briefing
            </button>

            {leaderboard.length > 0 && (
              <div className="bg-black/30 border border-white/5 rounded-xl p-3 mt-4">
                <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center justify-between">
                  <span>Top Protocols</span>
                  <svg className="w-3 h-3 text-[#2398f7]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </h3>
                <div className="space-y-1.5">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-white/40 truncate mr-2">
                        <span className="text-white/15 mr-1.5">{i + 1}.</span>
                        {entry.player_name}
                      </span>
                      <span className="text-[#2398f7] font-black tabular-nums">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PHASE: VICTORY ═══ */}
      {phase === "VICTORY" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(35,152,247,0.12), rgba(5,5,10,0.98))" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: NEON_BLUE,
              opacity: 0.02,
              animation: "pulse-border 2s ease-in-out infinite",
              transform: "translateZ(0)",
            }}
          />
          <div
            className="relative z-10 text-center max-w-sm w-full mx-4 p-8 rounded-2xl font-mono"
            style={{
              background: "rgba(8,8,12,0.96)",
              border: `1px solid rgba(${NEON_BLUE_RGB}, 0.25)`,
              boxShadow: `0 0 40px rgba(${NEON_BLUE_RGB}, 0.1)`,
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-black mb-2 tracking-tight"
              style={{ color: NEON_BLUE, textShadow: `0 0 30px rgba(${NEON_BLUE_RGB}, 0.5)` }}
            >
              PROTOCOL CLEARED
            </h2>
            <p className="text-[#2398f7]/50 text-xs mb-6 uppercase tracking-[0.2em]">Cortisol Levels Stabilized</p>

            <div className="bg-white/[0.03] rounded-xl px-6 py-4 mb-3 border border-[#2398f7]/10 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Final Score</span>
                <span className="text-white font-black tabular-nums">{deathSnapshot.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Max Combo</span>
                <span className="text-[#2398f7] font-black tabular-nums">{deathSnapshot.maxCombo}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Status</span>
                <span className="font-black tabular-nums" style={{ color: NEON_GREEN }}>SURVIVED</span>
              </div>
            </div>

            {scoreSaved ? (
              <div className="flex items-center justify-center gap-2 text-emerald-400/70 text-xs font-medium mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Score Uploaded Successfully
              </div>
            ) : (
              <p className="text-[#2398f7]/40 text-xs mb-4 animate-pulse">
                {">"} Syncing with Tachyon network...
              </p>
            )}

            <button
              onClick={handleBackToBriefing}
              className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all will-change-transform transform-gpu active:scale-[0.97] bg-[#2398f7]/10 text-[#2398f7] hover:bg-[#2398f7]/20 border border-[#2398f7]/30"
            >
              RETURN TO NEXUS
            </button>

            {leaderboard.length > 0 && (
              <div className="bg-black/30 border border-[#2398f7]/10 rounded-xl p-3 mt-4 text-left">
                <h3 className="text-[#2398f7]/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 flex items-center justify-between border-b border-[#2398f7]/10 pb-2">
                  <span>Global Leaderboard</span>
                  <svg className="w-3 h-3 text-[#2398f7]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </h3>
                <div className="space-y-1.5 pt-1">
                  {leaderboard.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-white/60 truncate mr-2 font-medium">
                        <span className="text-[#2398f7]/40 mr-2 w-3 inline-block">{i + 1}.</span>
                        {entry.player_name}
                      </span>
                      <span className="text-white font-black tabular-nums">{entry.score.toLocaleString()}</span>
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
