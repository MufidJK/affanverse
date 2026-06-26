"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface Pipe { x: number; gapY: number; scored: boolean }
interface Cloud { x: number; y: number; w: number; h: number; speed: number; opacity: number }
interface ScoreEntry { player_name: string; score: number }

type GamePhase = "register" | "ready" | "playing" | "gameover";

/* ═══════════════════════════════════════════════
   CONSTANTS — delta-time based (units per SECOND)
   ═══════════════════════════════════════════════ */

const LH = 600;
let LW = 400;

const PLAYER_SIZE = 40;
const GRAVITY = 620;        // px/s²  — floaty classic feel
const JUMP_VEL = -275;      // px/s   — gentle flap
const MAX_FALL_SPEED = 340;  // px/s  — terminal velocity
const PLAYER_X = 80;

const PIPE_WIDTH = 55;
const PIPE_GAP = 150;
const PIPE_SPEED = 138;      // px/s
const PIPE_SPAWN_SEC = 1.8;  // seconds between spawns

const CLOUD_COUNT = 6;
const BG_COLOR = "#D0DCE5";
const GROUND_HEIGHT = 40;

const LS_NAME_KEY = "flappy_affan_player_name";
const LS_HIGH_KEY = "flappy_affan_high_score";

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function FlappyAffanPage() {
  // Lock body scroll on mount
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require("react").useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }, []);
  }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastInputTime = useRef(0); // debounce guard for mobile double-fire

  /* ── mutable game state (never triggers re-render) ── */
  const g = useRef({
    phase: "register" as GamePhase,
    playerY: LH / 2 - PLAYER_SIZE / 2,
    velocity: 0,
    pipes: [] as Pipe[],
    clouds: [] as Cloud[],
    score: 0,
    pipeTimer: 0,
    glitchSeed: Math.random() * 999,
    tilt: 0,
    lastTime: 0,
  });

  /* ── audio ── */
  const sfxWing = useRef<HTMLAudioElement | null>(null);
  const sfxPoint = useRef<HTMLAudioElement | null>(null);
  const sfxDeath = useRef<HTMLAudioElement | null>(null);
  const audioReady = useRef(false);

  /* ── sprite ── */
  const sprite = useRef<HTMLImageElement | null>(null);
  const spriteOk = useRef(false);

  /* ── React state (UI overlays only) ── */
  const [uiPhase, setUiPhase] = useState<GamePhase>("register");
  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  /* ═══════════════════════════════════════════
     LEADERBOARD
     ═══════════════════════════════════════════ */

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("minigame_scores")
        .select("player_name, score")
        .eq("game_slug", "flappy-affan")
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
     AUDIO
     ═══════════════════════════════════════════ */

  const initAudio = useCallback(() => {
    if (!sfxWing.current) { sfxWing.current = new Audio("/minigame/flappy-affan/sfx_wing.mp3"); sfxWing.current.volume = 0.5; }
    if (!sfxPoint.current) { sfxPoint.current = new Audio("/minigame/flappy-affan/sfx_point.mp3"); sfxPoint.current.volume = 0.6; }
    if (!sfxDeath.current) { sfxDeath.current = new Audio("/minigame/flappy-affan/flap-jack-scream.mp3"); sfxDeath.current.volume = 0.7; }
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioReady.current) return;
    audioReady.current = true;
    [sfxWing, sfxPoint, sfxDeath].forEach((r) => {
      const a = r.current;
      if (a) { a.play().then(() => a.pause()).catch(() => {}); a.currentTime = 0; }
    });
  }, []);

  const play = useCallback((r: React.RefObject<HTMLAudioElement | null>) => {
    const a = r.current;
    if (!a || !audioReady.current) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);

  /* ═══════════════════════════════════════════
     CLOUD HELPERS
     ═══════════════════════════════════════════ */

  const makeClouds = useCallback((): Cloud[] => {
    const arr: Cloud[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      arr.push({
        x: Math.random() * LW * 1.5,
        y: 20 + Math.random() * LH * 0.45,
        w: 60 + Math.random() * 80,
        h: 24 + Math.random() * 30,
        speed: 10 + Math.random() * 20, // px/s
        opacity: 0.15 + Math.random() * 0.25,
      });
    }
    return arr;
  }, []);

  /* ═══════════════════════════════════════════
     DRAWING
     ═══════════════════════════════════════════ */

  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, c: Cloud) => {
    ctx.save();
    ctx.globalAlpha = c.opacity;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x - c.w * 0.25, c.y + c.h * 0.1, c.w * 0.35, c.h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.28, c.y + c.h * 0.05, c.w * 0.32, c.h * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }, []);

  const drawPillar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, seed: number) => {
    if (h <= 0) return;
    ctx.save();
    const layers: [string, number][] = [["rgba(255,0,80,0.18)", -2], ["rgba(0,200,255,0.18)", 2], ["rgba(20,20,35,0.92)", 0]];
    for (const [color, off] of layers) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + off, y);
      const segs = Math.ceil(h / 18);
      for (let i = 0; i <= segs; i++) {
        const sy = y + (h / segs) * i;
        const j = Math.sin(seed + i * 2.7) * 5 + Math.cos(seed + i * 1.3) * 3;
        ctx.lineTo(x + w + j + off, sy);
      }
      for (let i = segs; i >= 0; i--) {
        const sy = y + (h / segs) * i;
        const j = Math.sin(seed + i * 3.1 + 50) * 4 + Math.cos(seed + i * 0.9 + 30) * 2;
        ctx.lineTo(x + j + off, sy);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 0.06; ctx.fillStyle = "#fff";
    for (let ly = y; ly < y + h; ly += 4) ctx.fillRect(x - 3, ly, w + 6, 1);
    ctx.globalAlpha = 0.35;
    const eg = ctx.createLinearGradient(x, y, x + w, y);
    eg.addColorStop(0, "rgba(0,255,200,0.4)"); eg.addColorStop(0.5, "rgba(0,255,200,0)"); eg.addColorStop(1, "rgba(255,0,120,0.3)");
    ctx.fillStyle = eg; ctx.fillRect(x - 2, y, w + 4, h);
    ctx.restore();
  }, []);

  /* ═══════════════════════════════════════════
     GAME ACTIONS
     ═══════════════════════════════════════════ */

  const resetToReady = useCallback(() => {
    const s = g.current;
    s.phase = "ready";
    s.playerY = LH / 2 - PLAYER_SIZE / 2;
    s.velocity = 0;
    s.pipes = [];
    s.score = 0;
    s.pipeTimer = 0;
    s.glitchSeed = Math.random() * 999;
    s.tilt = 0;
    s.lastTime = 0;
    s.clouds = makeClouds();
    setUiPhase("ready");
    setDisplayScore(0);
  }, [makeClouds]);

  const startPlaying = useCallback(() => {
    const s = g.current;
    s.phase = "playing";
    s.velocity = JUMP_VEL;
    s.tilt = -25;
    s.lastTime = 0; // force dt recalc
    setUiPhase("playing");
  }, []);

  const doDeath = useCallback(() => {
    const s = g.current;
    if (s.phase !== "playing") return;
    s.phase = "gameover";
    play(sfxDeath);
    setDisplayScore(s.score);
    setUiPhase("gameover");

    // High score check — only save to DB if it's a NEW personal best AND > 0
    const prevHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);

    if (s.score > 0 && s.score > prevHigh) {
      // Update localStorage with the new record
      localStorage.setItem(LS_HIGH_KEY, String(s.score));
      setHighScore(s.score);

      // Upsert via secure API route — bypasses RLS
      const name = localStorage.getItem(LS_NAME_KEY) || "Anon";
      const finalScore = s.score;

      (async () => {
        try {
          await fetch("/api/submit-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player_name: name, game_slug: "flappy-affan", score: finalScore }),
          });

          fetchLeaderboard();
        } catch {
          // Silent fail — never block the game-over UI
        }
      })();

      setScoreSaved(true);
    } else {
      // Not a new record or score is 0 — no API call, no localStorage update
      setScoreSaved(false);
    }
  }, [play, fetchLeaderboard]);

  const doFlap = useCallback(() => {
    const s = g.current;
    if (s.phase === "ready") {
      unlockAudio();
      startPlaying();
      play(sfxWing);
      return;
    }
    if (s.phase === "playing") {
      s.velocity = JUMP_VEL;
      s.tilt = -25;
      play(sfxWing);
    }
  }, [startPlaying, unlockAudio, play]);

  /* ═══════════════════════════════════════════
     GAME LOOP — delta-time physics
     ═══════════════════════════════════════════ */

  const loop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = g.current;

    // Delta time (seconds), capped at 50ms to avoid physics explosions
    if (s.lastTime === 0) s.lastTime = timestamp;
    const dt = Math.min((timestamp - s.lastTime) / 1000, 0.05);
    s.lastTime = timestamp;

    // Dynamic logical width from container aspect ratio
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) LW = Math.round(LH * (rect.width / rect.height));
    canvas.width = LW;
    canvas.height = LH;

    /* ── UPDATE ── */

    // Clouds (always)
    for (const c of s.clouds) {
      c.x -= c.speed * dt;
      if (c.x + c.w < 0) { c.x = LW + c.w; c.y = 20 + Math.random() * LH * 0.45; }
    }

    if (s.phase === "playing") {
      // Gravity
      s.velocity = Math.min(s.velocity + GRAVITY * dt, MAX_FALL_SPEED);
      s.playerY += s.velocity * dt;
      s.tilt = Math.min(s.tilt + 120 * dt, 70);

      // Pipe spawning (timer-based)
      s.pipeTimer += dt;
      if (s.pipeTimer >= PIPE_SPAWN_SEC) {
        s.pipeTimer -= PIPE_SPAWN_SEC;
        const minY = 80, maxY = LH - GROUND_HEIGHT - PIPE_GAP - 80;
        s.pipes.push({ x: LW + 10, gapY: minY + Math.random() * (maxY - minY), scored: false });
      }

      // Move pipes
      for (const p of s.pipes) {
        p.x -= PIPE_SPEED * dt;
        if (!p.scored && p.x + PIPE_WIDTH < PLAYER_X) { p.scored = true; s.score++; play(sfxPoint); }
      }
      s.pipes = s.pipes.filter((p) => p.x + PIPE_WIDTH > -20);

      // Collision
      const py = s.playerY, ps = PLAYER_SIZE, inset = 5;
      if (py + ps > LH - GROUND_HEIGHT || py < 0) { doDeath(); }
      else {
        for (const p of s.pipes) {
          if (PLAYER_X + ps - inset > p.x && PLAYER_X + inset < p.x + PIPE_WIDTH) {
            if (py + inset < p.gapY || py + ps - inset > p.gapY + PIPE_GAP) { doDeath(); break; }
          }
        }
      }
    }

    // Idle bobbing (ready state)
    if (s.phase === "ready") {
      s.playerY = LH / 2 - PLAYER_SIZE / 2 + Math.sin(Date.now() / 300) * 8;
      s.tilt = Math.sin(Date.now() / 500) * 8;
    }

    /* ── DRAW ── */
    ctx.fillStyle = BG_COLOR; ctx.fillRect(0, 0, LW, LH);
    for (const c of s.clouds) drawCloud(ctx, c);

    for (const p of s.pipes) {
      const sd = s.glitchSeed + p.x * 0.1;
      drawPillar(ctx, p.x, 0, PIPE_WIDTH, p.gapY, sd);
      const bY = p.gapY + PIPE_GAP;
      drawPillar(ctx, p.x, bY, PIPE_WIDTH, LH - GROUND_HEIGHT - bY, sd + 100);
    }

    // Ground
    ctx.fillStyle = "#8B9DAF"; ctx.fillRect(0, LH - GROUND_HEIGHT, LW, GROUND_HEIGHT);
    ctx.strokeStyle = "#6B7D8F"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, LH - GROUND_HEIGHT); ctx.lineTo(LW, LH - GROUND_HEIGHT); ctx.stroke();
    ctx.fillStyle = "#7A8E9F";
    for (let gx = 0; gx < LW; gx += 20) ctx.fillRect(gx, LH - GROUND_HEIGHT + 4, 12, 3);

    // Player
    ctx.save();
    ctx.translate(PLAYER_X + PLAYER_SIZE / 2, s.playerY + PLAYER_SIZE / 2);
    ctx.rotate((s.tilt * Math.PI) / 180);
    if (spriteOk.current && sprite.current) {
      ctx.drawImage(sprite.current, -PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
    } else {
      ctx.fillStyle = "#FF6B35"; ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // Score on canvas
    if (s.phase === "playing") {
      ctx.save();
      ctx.font = "bold 48px 'Inter', sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillText(String(s.score), LW / 2 + 2, 72);
      ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 3;
      ctx.strokeText(String(s.score), LW / 2, 70);
      ctx.fillStyle = "#fff"; ctx.fillText(String(s.score), LW / 2, 70);
      ctx.restore();
    }

    // Continue loop unless gameover
    if (s.phase !== "gameover") rafRef.current = requestAnimationFrame(loop);
  }, [doDeath, drawCloud, drawPillar, play]);

  /* ═══════════════════════════════════════════
     INPUT — unified with 50ms debounce to
     prevent mobile touch+click double-fire
     ═══════════════════════════════════════════ */

  const handleInput = useCallback(() => {
    // Debounce: ignore inputs within 50ms of the last accepted one
    const now = performance.now();
    if (now - lastInputTime.current < 50) return;
    lastInputTime.current = now;

    const s = g.current;
    if (s.phase === "gameover" || s.phase === "register") return;
    doFlap();
  }, [doFlap]);

  const handleRestart = useCallback(() => {
    resetToReady();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [resetToReady, loop]);

  const handleRegister = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_NAME_KEY, trimmed);
    setPlayerName(trimmed);
    resetToReady();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [nameInput, resetToReady, loop]);

  /* ═══════════════════════════════════════════
     MOUNT / UNMOUNT — SOP Rule 2 & 7
     ═══════════════════════════════════════════ */

  useEffect(() => {
    // Sprite
    const img = new Image();
    img.src = "/minigame/flappy-affan/affanPlayerFlappy.png";
    img.onload = () => { spriteOk.current = true; };
    sprite.current = img;

    // Audio
    initAudio();

    // LocalStorage — name & high score
    const storedName = localStorage.getItem(LS_NAME_KEY);
    const storedHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);
    setHighScore(storedHigh);

    if (storedName) {
      setPlayerName(storedName);
      g.current.phase = "ready";
      setUiPhase("ready");
    } else {
      g.current.phase = "register";
      setUiPhase("register");
    }

    g.current.clouds = makeClouds();
    fetchLeaderboard();
    rafRef.current = requestAnimationFrame(loop);

    // ── Unified input listeners (window-level) ──
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); handleInput(); }
    };
    const onTouch = (e: TouchEvent) => {
      // Only handle touches on the canvas, not on UI buttons/inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("a")) return;
      e.preventDefault(); // suppress synthetic click
      handleInput();
    };
    const onMouse = (e: MouseEvent) => {
      // Only handle clicks on the canvas area
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "BUTTON" || target.closest("a")) return;
      handleInput();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouch, { passive: false });
    window.addEventListener("mousedown", onMouse);

    /* ── CLEANUP — SOP Rule 2 & 7 ── */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("mousedown", onMouse);
      [sfxWing, sfxPoint, sfxDeath].forEach((r) => {
        const a = r.current; if (a) { a.pause(); a.src = ""; a.load(); r.current = null; }
      });
      if (sprite.current) { sprite.current.onload = null; sprite.current = null; }
      spriteOk.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="w-screen h-[100dvh] overflow-hidden flex flex-col bg-[#0a0a0f] selection:bg-cyan-400/30">
      {/* Back button */}
      <Link
        href="/minigame"
        className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white/90 hover:text-white rounded-full text-sm font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Fullscreen game container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative z-10">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer object-contain"
          style={{ imageRendering: "auto", touchAction: "none" }}
        />

        {/* ── REGISTER OVERLAY ── */}
        {uiPhase === "register" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
              <span className="text-cyan-400">Flappy</span> Affan
            </h2>
            <p className="text-white/50 text-sm mb-6">Enter your name to begin</p>
            <div className="w-64 space-y-3">
              <input
                type="text"
                placeholder="Your name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
                onKeyDown={(e) => { if (e.key === "Enter") handleRegister(); e.stopPropagation(); }}
              />
              <button
                onClick={handleRegister}
                disabled={!nameInput.trim()}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* ── READY OVERLAY ── */}
        {uiPhase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-20 pointer-events-none">
            <p className="text-white/50 text-xs mb-1 font-medium">Playing as <span className="text-cyan-400">{playerName}</span></p>
            <div className="animate-bounce mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <p className="text-white text-lg md:text-xl font-bold tracking-wide text-center px-6">Tap, Click, or Press Space</p>
            <p className="text-white/60 text-sm mt-1 font-medium">to Flap</p>
            {highScore > 0 && <p className="text-white/30 text-xs mt-4">Best: {highScore}</p>}

            {/* Leaderboard UI */}
            <div className="mt-8 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 w-64 pointer-events-auto">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Top Players</span>
                <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </h3>
              <div className="space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-white/60 truncate mr-2">
                        <span className="text-white/30 mr-2">{idx + 1}.</span>
                        {entry.player_name}
                      </span>
                      <span className="text-cyan-400 font-black tabular-nums">{entry.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-white/30 text-xs text-center py-2">Loading...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── GAME OVER OVERLAY ── */}
        {uiPhase === "gameover" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              <span className="text-red-400">GAME</span> OVER
            </h2>

            <div className="bg-white/10 rounded-xl px-8 py-4 mb-4 border border-white/10 min-w-[200px]">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1 text-center">Score</p>
              <p className="text-4xl font-black text-cyan-400 text-center tabular-nums">{displayScore}</p>
            </div>

            <div className="bg-white/5 rounded-lg px-6 py-2 mb-6 border border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-widest text-center">
                Best: <span className="text-amber-400 font-bold tabular-nums">{highScore}</span>
              </p>
            </div>

            {scoreSaved ? (
              <div className="flex items-center gap-2 text-emerald-400/70 text-xs font-medium mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                New Record! Saved for {playerName}
              </div>
            ) : (
              <p className="text-white/30 text-xs mb-4">
                {displayScore === 0 ? "Score too low to save" : "Not a new record"}
              </p>
            )}

            <button
              onClick={handleRestart}
              className="px-10 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 mb-6"
            >
              Play Again
            </button>

            {/* Leaderboard UI */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 w-64 pointer-events-auto">
              <h3 className="text-white/80 text-xs font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Top Players</span>
                <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </h3>
              <div className="space-y-2">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-white/60 truncate mr-2">
                        <span className="text-white/30 mr-2">{idx + 1}.</span>
                        {entry.player_name}
                      </span>
                      <span className="text-cyan-400 font-black tabular-nums">{entry.score}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-white/30 text-xs text-center py-2">Loading...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
