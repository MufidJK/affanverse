"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { submitAmbasukeScore } from "./actions";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  hp: number;
  /** Glitch offset seed for visual effect */
  glitchSeed: number;
  /** Flash timer (seconds) when hit */
  flashTimer: number;
}

interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  timer: number; // seconds remaining
  radius: number;
}

interface ScoreEntry {
  player_name: string;
  score: number;
}

type GamePhase = "register" | "tutorial" | "playing" | "gameover";

interface JoystickVisual {
  /** Center of the base ring in screen-space (px relative to container) */
  baseX: number;
  baseY: number;
  /** Current nub offset from center */
  nubDx: number;
  nubDy: number;
  active: boolean;
}

/* ═══════════════════════════════════════════════
   CONSTANTS — delta-time based (units per SECOND)
   ═══════════════════════════════════════════════ */

const LOGICAL_H = 720;
const LOGICAL_W = 1280;

const PLAYER_SIZE = 56; // Collision/logic hitbox size
const PLAYER_DRAW_SIZE = 80; // Visual sprite size (~40% larger)
const PLAYER_DRAW_OFFSET = (PLAYER_DRAW_SIZE - PLAYER_SIZE) / 2; // Center the bigger sprite
const PLAYER_SPEED = 260; // px/s
const ATTACK_RADIUS = 90; // px — auto-attack range (unchanged)
const ATTACK_COOLDOWN = 0.35; // seconds between slash hits

const ENEMY_BASE_SPEED = 80; // px/s
const ENEMY_SIZE_MIN = 28;
const ENEMY_SIZE_MAX = 44;
const ENEMY_SPAWN_INTERVAL_INITIAL = 1.6; // seconds
const ENEMY_SPAWN_INTERVAL_MIN = 0.4;
const ENEMY_SPAWN_RAMP = 0.015; // interval decrease per kill

const KILLS_PER_WAVE = 32;
const WAVE_SPEED_BONUS = 0.12; // +12% enemy speed per wave
const WAVE_SPAWN_REDUCTION = 0.15; // -15% spawn interval per wave

const SLASH_DURATION = 0.25; // seconds

const GRID_SPACING = 60;
const SCANLINE_ALPHA = 0.04;

const LS_NAME_KEY = "ambasuke_protocol_player_name";
const LS_HIGH_KEY = "ambasuke_protocol_high_score";

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function AmbasukeEngine() {
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

  /* ── Mutable game state (never triggers re-render) ── */
  const g = useRef({
    phase: "register" as GamePhase,
    playerX: LOGICAL_W / 2 - PLAYER_SIZE / 2,
    playerY: LOGICAL_H / 2 - PLAYER_SIZE / 2,
    enemies: [] as Enemy[],
    slashes: [] as SlashEffect[],
    score: 0,
    spawnTimer: 0,
    attackCooldown: 0,
    lastTime: 0,
    /** Keys currently held */
    keys: new Set<string>(),
    /** Virtual joystick state */
    joystickActive: false,
    joystickDx: 0,
    joystickDy: 0,
    /** Total game time for difficulty ramp */
    elapsed: 0,
    /** Grid scroll offset */
    gridOffset: 0,
    /** Wave system */
    wave: 1,
  });

  /* ── Visible joystick visual state (mutable, not React state) ── */
  const joystickVisual = useRef<JoystickVisual>({
    baseX: 0,
    baseY: 0,
    nubDx: 0,
    nubDy: 0,
    active: false,
  });

  /* ── Audio refs ── */
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxSlash = useRef<HTMLAudioElement | null>(null);
  const sfxDeath = useRef<HTMLAudioElement | null>(null);
  const audioReady = useRef(false);

  /* ── Player sprite ── */
  const sprite = useRef<HTMLImageElement | null>(null);
  const spriteOk = useRef(false);

  /* ── Touch device detection ── */
  const isTouchDevice = useRef(false);

  /* ── Joystick geometry ── */
  const joystickCenter = useRef({ x: 0, y: 0 });
  const joystickTouchId = useRef<number | null>(null);
  const JOYSTICK_RADIUS = 60;
  const JOYSTICK_DEAD_ZONE = 10;
  const JOYSTICK_VISUAL_RADIUS = 50; // Base circle radius on canvas
  const JOYSTICK_NUB_RADIUS = 22; // Thumbstick nub radius

  /* ── React state (UI overlays only) ── */
  const [uiPhase, setUiPhase] = useState<GamePhase>("register");
  const [displayScore, setDisplayScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  /* ═══════════════════════════════════════════
     LEADERBOARD
     ═══════════════════════════════════════════ */

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("minigame_scores")
        .select("player_name, score")
        .eq("game_slug", "ambasuke-protocol")
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
    if (!bgmRef.current) {
      bgmRef.current = new Audio("/minigame/ambasuke-protocol/dark-Synthwave-Music.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.5;
    }
    if (!sfxSlash.current) {
      sfxSlash.current = new Audio("/minigame/ambasuke-protocol/sword_slash.mp3");
      sfxSlash.current.volume = 0.7;
    }
    if (!sfxDeath.current) {
      sfxDeath.current = new Audio("/minigame/ambasuke-protocol/ambatukam.mp3");
      sfxDeath.current.volume = 1.0;
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioReady.current) return;
    audioReady.current = true;
    // Only unlock SFX here to prevent race conditions with BGM
    [sfxSlash, sfxDeath].forEach((r) => {
      const a = r.current;
      if (a) {
        a.play().then(() => a.pause()).catch(() => {});
        a.currentTime = 0;
      }
    });
  }, []);

  const playSfx = useCallback((r: React.RefObject<HTMLAudioElement | null>) => {
    const a = r.current;
    if (!a || !audioReady.current) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);

  const stopBgm = useCallback(() => {
    const a = bgmRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  }, []);

  /* ═══════════════════════════════════════════
     ENEMY SPAWNING
     ═══════════════════════════════════════════ */

  const spawnEnemy = useCallback(() => {
    const s = g.current;
    // Spawn from a random edge
    const edge = Math.floor(Math.random() * 4);
    let ex = 0;
    let ey = 0;
    const ew = ENEMY_SIZE_MIN + Math.random() * (ENEMY_SIZE_MAX - ENEMY_SIZE_MIN);
    const eh = ew;

    switch (edge) {
      case 0: // top
        ex = Math.random() * LOGICAL_W;
        ey = -eh;
        break;
      case 1: // right
        ex = LOGICAL_W + ew;
        ey = Math.random() * LOGICAL_H;
        break;
      case 2: // bottom
        ex = Math.random() * LOGICAL_W;
        ey = LOGICAL_H + eh;
        break;
      case 3: // left
        ex = -ew;
        ey = Math.random() * LOGICAL_H;
        break;
    }

    // Speed ramps with elapsed time AND wave
    const waveBonus = 1 + (s.wave - 1) * WAVE_SPEED_BONUS;
    const speedMultiplier = (1 + s.elapsed * 0.008) * waveBonus;
    const speed = ENEMY_BASE_SPEED * speedMultiplier * (0.8 + Math.random() * 0.4);

    s.enemies.push({
      x: ex,
      y: ey,
      w: ew,
      h: eh,
      speed,
      hp: 1,
      glitchSeed: Math.random() * 999,
      flashTimer: 0,
    });
  }, []);

  /* ═══════════════════════════════════════════
     DRAWING HELPERS
     ═══════════════════════════════════════════ */

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const s = g.current;
    ctx.strokeStyle = "rgba(35, 152, 247, 0.08)";
    ctx.lineWidth = 1;
    const offset = s.gridOffset % GRID_SPACING;
    for (let x = -offset; x < w; x += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = -offset; y < h; y += GRID_SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, []);

  const drawScanlines = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = `rgba(0, 0, 0, ${SCANLINE_ALPHA})`;
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }
  }, []);

  const drawEnemy = useCallback((ctx: CanvasRenderingContext2D, e: Enemy, time: number) => {
    ctx.save();
    const glitch = Math.sin(time * 10 + e.glitchSeed) * 3;

    // Flash white when recently hit
    if (e.flashTimer > 0) {
      ctx.fillStyle = "#fff";
    } else {
      // Red glitch rectangles — RGB split effect
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "rgba(255, 0, 60, 0.6)";
      ctx.fillRect(e.x + glitch + 2, e.y - 1, e.w, e.h);
      ctx.fillStyle = "rgba(0, 255, 200, 0.3)";
      ctx.fillRect(e.x - glitch - 2, e.y + 1, e.w, e.h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(220, 30, 60, 0.9)";
    }

    ctx.fillRect(e.x + glitch * 0.5, e.y, e.w, e.h);

    // Scanline overlay on enemy
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let sy = e.y; sy < e.y + e.h; sy += 3) {
      ctx.fillRect(e.x, sy, e.w, 1);
    }

    // Neon red border
    ctx.strokeStyle = "rgba(255, 50, 70, 0.7)";
    ctx.lineWidth = 1;
    ctx.strokeRect(e.x + glitch * 0.5, e.y, e.w, e.h);

    ctx.restore();
  }, []);

  const drawSlash = useCallback((ctx: CanvasRenderingContext2D, sl: SlashEffect) => {
    ctx.save();
    const progress = 1 - sl.timer / SLASH_DURATION;
    const alpha = 1 - progress;

    ctx.translate(sl.x, sl.y);
    ctx.rotate(sl.angle);

    // Arc slash trail
    ctx.strokeStyle = `rgba(35, 152, 247, ${alpha})`;
    ctx.lineWidth = 3 + (1 - progress) * 4;
    ctx.shadowColor = "#2398f7";
    ctx.shadowBlur = 15 * alpha;
    ctx.beginPath();
    ctx.arc(0, 0, sl.radius * (0.5 + progress * 0.5), -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Inner bright slash
    ctx.strokeStyle = `rgba(180, 220, 255, ${alpha * 0.8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, sl.radius * (0.3 + progress * 0.7), -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }, []);

  /* ═══════════════════════════════════════════
     GAME ACTIONS
     ═══════════════════════════════════════════ */

  const resetGame = useCallback(() => {
    const s = g.current;
    s.playerX = LOGICAL_W / 2 - PLAYER_SIZE / 2;
    s.playerY = LOGICAL_H / 2 - PLAYER_SIZE / 2;
    s.enemies = [];
    s.slashes = [];
    s.score = 0;
    s.spawnTimer = 0;
    s.attackCooldown = 0;
    s.lastTime = 0;
    s.elapsed = 0;
    s.gridOffset = 0;
    s.keys.clear();
    s.joystickActive = false;
    s.joystickDx = 0;
    s.joystickDy = 0;
    s.wave = 1;
  }, []);

  const startTutorial = useCallback(() => {
    const s = g.current;
    s.phase = "tutorial";
    setUiPhase("tutorial");
  }, []);

  const startPlaying = useCallback(() => {
    const s = g.current;
    s.phase = "playing";
    s.lastTime = 0;
    setUiPhase("playing");
  }, []);

  const doDeath = useCallback(() => {
    const s = g.current;
    if (s.phase !== "playing") return;
    s.phase = "gameover";
    stopBgm();
    playSfx(sfxDeath);
    setDisplayScore(s.score);
    setUiPhase("gameover");

    const prevHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);

    if (s.score > 0 && s.score > prevHigh) {
      localStorage.setItem(LS_HIGH_KEY, String(s.score));
      setHighScore(s.score);

      const name = localStorage.getItem(LS_NAME_KEY) || "Anon";
      const finalScore = s.score;

      // Server Action — fire and forget
      submitAmbasukeScore({
        player_name: name,
        game_slug: "ambasuke-protocol",
        score: finalScore,
      })
        .then(() => fetchLeaderboard())
        .catch(() => {});

      setScoreSaved(true);
    } else {
      setScoreSaved(false);
    }
  }, [stopBgm, playSfx, fetchLeaderboard]);

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
        s.gridOffset += 20 * dt;

        // ── Player movement ──
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (s.keys.has("ArrowLeft") || s.keys.has("KeyA")) dx -= 1;
        if (s.keys.has("ArrowRight") || s.keys.has("KeyD")) dx += 1;
        if (s.keys.has("ArrowUp") || s.keys.has("KeyW")) dy -= 1;
        if (s.keys.has("ArrowDown") || s.keys.has("KeyS")) dy += 1;

        // Virtual joystick override
        if (s.joystickActive) {
          dx = s.joystickDx;
          dy = s.joystickDy;
        }

        // Normalize diagonal
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > 0) {
          dx /= mag;
          dy /= mag;
        }

        s.playerX += dx * PLAYER_SPEED * dt;
        s.playerY += dy * PLAYER_SPEED * dt;

        // Clamp to canvas bounds
        s.playerX = Math.max(0, Math.min(LOGICAL_W - PLAYER_SIZE, s.playerX));
        s.playerY = Math.max(0, Math.min(LOGICAL_H - PLAYER_SIZE, s.playerY));

        // ── Wave calculation ──
        const newWave = Math.floor(s.score / KILLS_PER_WAVE) + 1;
        if (newWave !== s.wave) s.wave = newWave;

        // ── Enemy spawning (scales with wave) ──
        s.spawnTimer += dt;
        const waveSpawnMult = Math.pow(1 - WAVE_SPAWN_REDUCTION, s.wave - 1);
        const spawnInterval = Math.max(
          ENEMY_SPAWN_INTERVAL_MIN,
          (ENEMY_SPAWN_INTERVAL_INITIAL - s.score * ENEMY_SPAWN_RAMP) * waveSpawnMult
        );
        if (s.spawnTimer >= spawnInterval) {
          s.spawnTimer -= spawnInterval;
          spawnEnemy();
        }

        // ── Enemy movement (chase player) ──
        const pcx = s.playerX + PLAYER_SIZE / 2;
        const pcy = s.playerY + PLAYER_SIZE / 2;

        for (const e of s.enemies) {
          const ecx = e.x + e.w / 2;
          const ecy = e.y + e.h / 2;
          const edx = pcx - ecx;
          const edy = pcy - ecy;
          const dist = Math.sqrt(edx * edx + edy * edy);
          if (dist > 0) {
            e.x += (edx / dist) * e.speed * dt;
            e.y += (edy / dist) * e.speed * dt;
          }
          if (e.flashTimer > 0) e.flashTimer -= dt;
        }

        // ── Auto-attack ──
        s.attackCooldown -= dt;
        if (s.attackCooldown <= 0) {
          let attacked = false;
          for (let i = s.enemies.length - 1; i >= 0; i--) {
            const e = s.enemies[i];
            const ecx = e.x + e.w / 2;
            const ecy = e.y + e.h / 2;
            const edx = pcx - ecx;
            const edy = pcy - ecy;
            const dist = Math.sqrt(edx * edx + edy * edy);

            if (dist < ATTACK_RADIUS) {
              // Slash this enemy
              const angle = Math.atan2(ecy - pcy, ecx - pcx);
              s.slashes.push({
                x: pcx,
                y: pcy,
                angle,
                timer: SLASH_DURATION,
                radius: ATTACK_RADIUS,
              });

              s.enemies.splice(i, 1);
              s.score++;
              attacked = true;
              playSfx(sfxSlash);
              break; // one kill per cooldown
            }
          }
          if (attacked) {
            s.attackCooldown = ATTACK_COOLDOWN;
          }
        }

        // ── Update slash effects ──
        for (let i = s.slashes.length - 1; i >= 0; i--) {
          s.slashes[i].timer -= dt;
          if (s.slashes[i].timer <= 0) s.slashes.splice(i, 1);
        }

        // ── Collision detection (enemy touching player = death) ──
        const inset = 8;
        for (const e of s.enemies) {
          if (
            s.playerX + PLAYER_SIZE - inset > e.x &&
            s.playerX + inset < e.x + e.w &&
            s.playerY + PLAYER_SIZE - inset > e.y &&
            s.playerY + inset < e.y + e.h
          ) {
            doDeath();
            break;
          }
        }
      }

      /* ── DRAW ── */
      // Background
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Grid
      drawGrid(ctx, LOGICAL_W, LOGICAL_H);

      // Enemies
      for (const e of s.enemies) {
        drawEnemy(ctx, e, s.elapsed);
      }

      // Slash effects
      for (const sl of s.slashes) {
        drawSlash(ctx, sl);
      }

      // Player
      ctx.save();
      const px = s.playerX;
      const py = s.playerY;
      // Center of the logical hitbox
      const pcxDraw = px + PLAYER_SIZE / 2;
      const pcyDraw = py + PLAYER_SIZE / 2;

      // Neon glow
      ctx.shadowColor = "#2398f7";
      ctx.shadowBlur = 20;

      if (spriteOk.current && sprite.current) {
        // Draw sprite LARGER than hitbox, centered on the same point
        ctx.drawImage(
          sprite.current,
          px - PLAYER_DRAW_OFFSET,
          py - PLAYER_DRAW_OFFSET,
          PLAYER_DRAW_SIZE,
          PLAYER_DRAW_SIZE
        );
        // Draw glow ring — ATTACK_RADIUS unchanged
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(35, 152, 247, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pcxDraw, pcyDraw, ATTACK_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Fallback circle
        ctx.fillStyle = "#2398f7";
        ctx.beginPath();
        ctx.arc(pcxDraw, pcyDraw, PLAYER_DRAW_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // HUD on canvas
      if (s.phase === "playing") {
        // ── WAVE indicator (top-center) ──
        ctx.save();
        ctx.font = "bold 42px 'Courier New', monospace";
        ctx.textAlign = "center";
        // Shadow
        ctx.fillStyle = "rgba(35, 152, 247, 0.12)";
        ctx.fillText(`WAVE ${s.wave}`, LOGICAL_W / 2 + 2, 58);
        // Main text
        ctx.fillStyle = "rgba(35, 152, 247, 0.8)";
        ctx.fillText(`WAVE ${s.wave}`, LOGICAL_W / 2, 56);
        ctx.restore();

        // ── KILLS counter (top-right) ──
        ctx.save();
        ctx.font = "bold 36px 'Inter', monospace";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(35, 152, 247, 0.15)";
        ctx.fillText(`KILLS: ${s.score}`, LOGICAL_W - 18, 52);
        ctx.fillStyle = "rgba(35, 152, 247, 0.7)";
        ctx.fillText(`KILLS: ${s.score}`, LOGICAL_W - 20, 50);
        ctx.restore();
      }

      // ── Visible virtual joystick (drawn on canvas for touch devices) ──
      if (isTouchDevice.current && s.phase === "playing") {
        const jv = joystickVisual.current;
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect && containerRect.width > 0) {
          // Convert screen-space joystick coords to logical canvas coords
          const scaleX = LOGICAL_W / containerRect.width;
          const scaleY = LOGICAL_H / containerRect.height;

          if (jv.active) {
            const jbx = jv.baseX * scaleX;
            const jby = jv.baseY * scaleY;
            const jnx = jv.nubDx * scaleX;
            const jny = jv.nubDy * scaleY;
            const vr = JOYSTICK_VISUAL_RADIUS * scaleX;
            const nr = JOYSTICK_NUB_RADIUS * scaleX;

            // Base ring
            ctx.save();
            ctx.strokeStyle = "rgba(35, 152, 247, 0.35)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(jbx, jby, vr, 0, Math.PI * 2);
            ctx.stroke();

            // Inner fill
            ctx.fillStyle = "rgba(35, 152, 247, 0.06)";
            ctx.fill();

            // Nub (thumbstick)
            ctx.beginPath();
            ctx.arc(jbx + jnx, jby + jny, nr, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(35, 152, 247, 0.5)";
            ctx.fill();
            ctx.strokeStyle = "rgba(35, 152, 247, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
          } else {
            // Idle hint: show a faint joystick placeholder in bottom-left
            const hintX = 120 * scaleX;
            const hintY = (LOGICAL_H - 120) * (1); // already in logical space
            const vr = JOYSTICK_VISUAL_RADIUS * scaleX;

            ctx.save();
            ctx.strokeStyle = "rgba(35, 152, 247, 0.15)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.arc(hintX, hintY, vr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Center dot
            ctx.beginPath();
            ctx.arc(hintX, hintY, 6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(35, 152, 247, 0.2)";
            ctx.fill();

            ctx.restore();
          }
        }
      }

      // Scanlines (always on top)
      drawScanlines(ctx, LOGICAL_W, LOGICAL_H);

      // Idle state — bobbing player
      if (s.phase === "tutorial") {
        s.playerY = LOGICAL_H / 2 - PLAYER_SIZE / 2 + Math.sin(Date.now() / 400) * 6;
      }

      // Continue loop unless gameover
      if (s.phase !== "gameover") {
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [doDeath, drawGrid, drawScanlines, drawEnemy, drawSlash, spawnEnemy, playSfx]
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
    startTutorial();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
    
    // Direct invocation inside onClick to satisfy Autoplay policies
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.currentTime = 0;
      bgm.play().catch(error => console.error(error));
    }
  }, [nameInput, resetGame, startTutorial, loop]);

  const handleRestart = useCallback(() => {
    resetGame();
    startTutorial();
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [resetGame, startTutorial, loop]);

  const handleTutorialDismiss = useCallback(() => {
    unlockAudio();
    startPlaying();
    
    // Direct invocation inside onClick to satisfy Autoplay policies
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.play().catch(error => console.error(error));
    }
  }, [unlockAudio, startPlaying]);

  /* ═══════════════════════════════════════════
     MOUNT / UNMOUNT — SOP Rule 2 & 7
     ═══════════════════════════════════════════ */

  useEffect(() => {
    // Touch detection
    isTouchDevice.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Sprite
    const img = new Image();
    img.src = "/minigame/ambasuke-protocol/ambasuke.png";
    img.onload = () => {
      spriteOk.current = true;
    };
    sprite.current = img;

    // Audio
    initAudio();

    // LocalStorage
    const storedName = localStorage.getItem(LS_NAME_KEY);
    const storedHigh = parseInt(localStorage.getItem(LS_HIGH_KEY) || "0", 10);
    setHighScore(storedHigh);

    if (storedName) {
      setPlayerName(storedName);
      g.current.phase = "tutorial";
      setUiPhase("tutorial");
    } else {
      g.current.phase = "register";
      setUiPhase("register");
    }

    fetchLeaderboard();
    rafRef.current = requestAnimationFrame(loop);

    // ── Keyboard listeners ──
    const onKeyDown = (e: KeyboardEvent) => {
      g.current.keys.add(e.code);

      // Dismiss tutorial on any key
      if (g.current.phase === "tutorial") {
        e.preventDefault();
        // Defer to avoid triggering in same frame
        requestAnimationFrame(() => {
          if (g.current.phase === "tutorial") {
            unlockAudio();
            g.current.phase = "playing";
            g.current.lastTime = 0;
            setUiPhase("playing");
            const bgm = bgmRef.current;
            if (bgm) {
              bgm.play().catch(error => console.error(error));
            }
          }
        });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      g.current.keys.delete(e.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ── Touch listeners for virtual joystick ──
    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("[data-ui-overlay]")
      )
        return;

      // Dismiss tutorial on touch
      if (g.current.phase === "tutorial") {
        e.preventDefault();
        unlockAudio();
        g.current.phase = "playing";
        g.current.lastTime = 0;
        setUiPhase("playing");
        const bgm = bgmRef.current;
        if (bgm) {
          bgm.play().catch(error => console.error(error));
        }
        return;
      }

      if (g.current.phase !== "playing") return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // Only activate joystick on the left half of the screen
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const tx = touch.clientX - rect.left;
        const ty = touch.clientY - rect.top;
        if (tx < rect.width * 0.5 && joystickTouchId.current === null) {
          joystickTouchId.current = touch.identifier;
          joystickCenter.current = { x: tx, y: ty };
          g.current.joystickActive = true;
          g.current.joystickDx = 0;
          g.current.joystickDy = 0;
          // Update visual state
          joystickVisual.current.baseX = tx;
          joystickVisual.current.baseY = ty;
          joystickVisual.current.nubDx = 0;
          joystickVisual.current.nubDy = 0;
          joystickVisual.current.active = true;
          e.preventDefault();
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (joystickTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId.current) {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const tx = touch.clientX - rect.left;
          const ty = touch.clientY - rect.top;
          const ddx = tx - joystickCenter.current.x;
          const ddy = ty - joystickCenter.current.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          if (dist < JOYSTICK_DEAD_ZONE) {
            g.current.joystickDx = 0;
            g.current.joystickDy = 0;
            joystickVisual.current.nubDx = 0;
            joystickVisual.current.nubDy = 0;
          } else {
            const clamped = Math.min(dist, JOYSTICK_RADIUS);
            g.current.joystickDx = (ddx / dist) * (clamped / JOYSTICK_RADIUS);
            g.current.joystickDy = (ddy / dist) * (clamped / JOYSTICK_RADIUS);
            // Update visual nub position (screen px offset from center)
            joystickVisual.current.nubDx = (ddx / dist) * clamped;
            joystickVisual.current.nubDy = (ddy / dist) * clamped;
          }
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          g.current.joystickActive = false;
          g.current.joystickDx = 0;
          g.current.joystickDy = 0;
          joystickVisual.current.active = false;
          joystickVisual.current.nubDx = 0;
          joystickVisual.current.nubDy = 0;
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    /* ── CLEANUP — SOP Rule 2 & 7 ── */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      // Audio cleanup — Rule 7
      [bgmRef, sfxSlash, sfxDeath].forEach((r) => {
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
    <div className="fixed inset-0 z-[100] w-[100dvw] h-[100dvh] max-w-none overflow-hidden flex flex-col bg-[#0a0a0f] selection:bg-[#2398f7]/30">
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
            <path d="M21 8l-5.5-5.5" />
            <path d="M3 22v-6h6" />
            <path d="M3 16l5.5 5.5" />
          </svg>
        </div>
        <p className="text-center font-mono text-sm md:text-base leading-relaxed max-w-xs">
          {">"} [SYS.ERR] UPLINK REQUIRES LANDSCAPE MODE. ROTATE DEVICE TO
          INITIALIZE PROTOCOL.
        </p>
      </div>

      {/* Back button */}
      <Link
        href="/minigame"
        className="fixed top-3 left-3 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
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

      {/* Canvas container */}
      <div ref={containerRef} className="flex-1 w-full h-full relative z-10">
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-none"
          style={{ imageRendering: "auto", touchAction: "none" }}
        />

        {/* ── REGISTER OVERLAY ── */}
        {uiPhase === "register" && (
          <div
            data-ui-overlay
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20"
          >
            <h2 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight font-mono">
              <span className="text-[#2398f7]">THE AMBASUKE</span> PROTOCOL
            </h2>
            <p className="text-white/40 text-xs mb-6 font-mono">
              {">"} SURVIVAL // HACK & SLASH // ANOMALY
            </p>
            <div className="w-64 space-y-3">
              <input
                type="text"
                placeholder="ENTER_CALLSIGN..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
                className="w-full px-4 py-2.5 bg-white/10 border border-[#2398f7]/30 rounded-lg text-white text-sm font-mono placeholder:text-white/30 focus:outline-none focus:border-[#2398f7]/60 focus:ring-1 focus:ring-[#2398f7]/30 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRegister();
                  e.stopPropagation();
                }}
              />
              <button
                onClick={handleRegister}
                disabled={!nameInput.trim()}
                className="w-full py-2.5 bg-[#2398f7] hover:bg-[#1e82d4] disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 font-mono"
              >
                INITIALIZE PROTOCOL
              </button>
            </div>
          </div>
        )}

        {/* ── TUTORIAL OVERLAY ── */}
        {uiPhase === "tutorial" && (
          <div
            data-ui-overlay
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20"
          >
            <div className="max-w-md w-full mx-4 border border-[#2398f7]/30 rounded-xl bg-black/80 p-6 md:p-8 font-mono">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#2398f7] rounded-full animate-pulse" />
                <h3 className="text-[#2398f7] text-xs font-bold uppercase tracking-widest">
                  SYSTEM BRIEFING
                </h3>
              </div>

              <p className="text-white/50 text-xs mb-1">
                {">"} Playing as{" "}
                <span className="text-[#2398f7]">{playerName}</span>
              </p>

              <div className="space-y-3 mt-4">
                <div className="text-white/70 text-xs leading-relaxed">
                  <p className="text-white/40 mb-2">
                    {">"} OBJECTIVE: Survive the corrupted data stream. Slash
                    entities that enter your proximity.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                      <span className="text-[#2398f7] font-bold">WASD</span>
                      <span className="text-white/40"> / Arrows — Move</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                      <span className="text-[#2398f7] font-bold">AUTO</span>
                      <span className="text-white/40">
                        {" "}
                        — Slash on proximity
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded px-3 py-2 col-span-2">
                      <span className="text-[#2398f7] font-bold">MOBILE</span>
                      <span className="text-white/40">
                        {" "}
                        — Touch & drag left half to move
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleTutorialDismiss}
                  className="px-8 py-2.5 bg-[#2398f7] hover:bg-[#1e82d4] text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 font-mono animate-pulse"
                >
                  {">"} PRESS ANY KEY TO BEGIN
                </button>
              </div>

              {highScore > 0 && (
                <p className="text-white/20 text-[10px] mt-3 text-center font-mono">
                  BEST: {highScore} KILLS
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── GAME OVER OVERLAY ── */}
        {uiPhase === "gameover" && (
          <div
            data-ui-overlay
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight font-mono">
              <span className="text-red-500">PROTOCOL</span> TERMINATED
            </h2>

            <div className="bg-white/10 rounded-xl px-8 py-4 mb-3 border border-white/10 min-w-[200px]">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1 text-center font-mono">
                Entities Eliminated
              </p>
              <p className="text-4xl font-black text-[#2398f7] text-center tabular-nums font-mono">
                {displayScore}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg px-6 py-2 mb-4 border border-white/5">
              <p className="text-white/40 text-xs uppercase text-center font-mono">
                Best:{" "}
                <span className="text-amber-400 font-bold tabular-nums">
                  {highScore}
                </span>
              </p>
            </div>

            {scoreSaved ? (
              <div className="flex items-center gap-2 text-emerald-400/70 text-xs font-medium mb-4 font-mono">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                New Record! Saved for {playerName}
              </div>
            ) : (
              <p className="text-white/30 text-xs mb-4 font-mono">
                {displayScore === 0
                  ? "> Score too low to upload"
                  : "> Not a new record"}
              </p>
            )}

            <button
              onClick={handleRestart}
              className="px-10 py-3 bg-[#2398f7] hover:bg-[#1e82d4] text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95 mb-4 font-mono"
            >
              REINITIALIZE PROTOCOL
            </button>

            {/* Leaderboard */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 w-56">
              <h3 className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-between font-mono">
                <span>Top Operatives</span>
                <svg
                  className="w-3 h-3 text-[#2398f7]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </h3>
              <div className="space-y-1.5">
                {leaderboard.length > 0 ? (
                  leaderboard.map((en, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-xs font-mono"
                    >
                      <span className="text-white/60 truncate mr-2">
                        <span className="text-white/30 mr-1.5">
                          {i + 1}.
                        </span>
                        {en.player_name}
                      </span>
                      <span className="text-[#2398f7] font-black tabular-nums">
                        {en.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-white/30 text-xs text-center py-1 font-mono">
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
