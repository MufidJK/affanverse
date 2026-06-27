"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import * as C from "./gameConstants";
import { GameState, createState, resetState, updateRunner, updateBoss, updateBossIntro } from "./gameLogic";
import { drawCloud, drawCactus, drawSky, drawGround, makeClouds } from "./gameDrawing";

const A = C.ASSET_PATH;

export interface EngineAPI {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  hpBarRef: React.RefObject<HTMLDivElement | null>; bossHpBarRef: React.RefObject<HTMLDivElement | null>;
  hpTextRef: React.RefObject<HTMLDivElement | null>; bossHpTextRef: React.RefObject<HTMLDivElement | null>;
  dioBubbleRef: React.RefObject<HTMLDivElement | null>; affanBubbleRef: React.RefObject<HTMLDivElement | null>;
  dioBubbleTextRef: React.RefObject<HTMLDivElement | null>; affanBubbleTextRef: React.RefObject<HTMLDivElement | null>;
  scoreTextRef: React.RefObject<HTMLSpanElement | null>; subtitleRef: React.RefObject<HTMLDivElement | null>;
  dioApproachesRef: React.RefObject<HTMLDivElement | null>;
  welcomeMsgRef: React.RefObject<HTMLDivElement | null>;
  skillCdRef: React.RefObject<HTMLDivElement | null>; ultiCdRef: React.RefObject<HTMLDivElement | null>;
  skillBtnRef: React.RefObject<any>; ultiBtnRef: React.RefObject<any>;
  uiPhase: C.GamePhase; displayScore: number; highScore: number;
  playerName: string; nameInput: string; setNameInput: (v: string) => void;
  handleRegister: () => void; handleRestart: () => void;
  leaderboard: C.ScoreEntry[]; isTouchDevice: boolean; ultiReady: boolean;
  doJump: () => void; doCrouch: (down: boolean) => void;
  doAttack: () => void; doUlti: () => void; doMove: (dir: "left" | "right" | "none") => void;
}

export function useGameEngine(): EngineAPI {
  const canvasRef = useRef<HTMLCanvasElement>(null); const containerRef = useRef<HTMLDivElement>(null);
  const hpBarRef = useRef<HTMLDivElement>(null); const bossHpBarRef = useRef<HTMLDivElement>(null);
  const hpTextRef = useRef<HTMLDivElement>(null); const bossHpTextRef = useRef<HTMLDivElement>(null);
  const dioBubbleRef = useRef<HTMLDivElement>(null); const affanBubbleRef = useRef<HTMLDivElement>(null);
  const dioBubbleTextRef = useRef<HTMLDivElement>(null); const affanBubbleTextRef = useRef<HTMLDivElement>(null);
  const scoreTextRef = useRef<HTMLSpanElement>(null); const subtitleRef = useRef<HTMLDivElement>(null); 
  const dioApproachesRef = useRef<HTMLDivElement>(null); 
  const welcomeMsgRef = useRef<HTMLDivElement>(null);
  const skillCdRef = useRef<HTMLDivElement>(null); const ultiCdRef = useRef<HTMLDivElement>(null);
  const skillBtnRef = useRef<any>(null); const ultiBtnRef = useRef<any>(null);
  const rafRef = useRef(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cloudCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const g = useRef<GameState>(createState());
  const imgs = useRef<Record<string, HTMLImageElement>>({}); const imgsOk = useRef<Record<string, boolean>>({});
  const audios = useRef<HTMLAudioElement[]>([]); const sfx = useRef<Record<string, HTMLAudioElement>>({});
  const audioReady = useRef(false);

  const [uiPhase, setUiPhase] = useState<C.GamePhase>("register");
  const [displayScore, setDisplayScore] = useState(0); const [highScore, setHighScore] = useState(0);
  const [playerName, setPlayerName] = useState(""); const [nameInput, setNameInput] = useState("");
  const [leaderboard, setLeaderboard] = useState<C.ScoreEntry[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false); const [ultiReady, setUltiReady] = useState(true);

  const loadImg = useCallback((key: string, src: string) => {
    const im = new Image(); im.src = A + src; im.onload = () => { imgsOk.current[key] = true; }; imgs.current[key] = im;
  }, []);
  const loadSfx = useCallback((key: string, src: string, vol = 0.5) => {
    const a = new Audio(A + src); a.volume = vol; sfx.current[key] = a; audios.current.push(a);
  }, []);
  const play = useCallback((key: string, loop = false) => {
    const a = sfx.current[key]; if (!a || !audioReady.current) return;
    a.currentTime = 0; a.loop = loop; a.play().catch(() => {});
  }, []);
  const stopAll = useCallback(() => {
    Object.values(sfx.current).forEach(a => { a.pause(); a.currentTime = 0; a.loop = false; });
  }, []);
  const stopSpecificAudio = useCallback((key: string) => {
    const a = sfx.current[key]; if (a) { a.pause(); a.currentTime = 0; }
  }, []);

  const fetchLB = useCallback(async () => {
    try {
      const { data } = await supabase.from("minigame_scores").select("player_name,score").eq("game_slug", "affan-strike").order("score", { ascending: false }).limit(5);
      if (data) setLeaderboard(data as C.ScoreEntry[]);
    } catch {}
  }, []);

  const doJump = useCallback(() => {
    const s = g.current;
    if (s.phase === "ready") { 
      audioReady.current = true; 
      s.phase = "runner"; 
      s.lastTime = 0; 
      s.playerY = s.groundY - C.PH; 
      s.welcomeTimer = 5;
      setUiPhase("runner"); 
      play("jump");
      return; 
    }
    if ((s.phase === "runner" || s.phase === "boss_fight") && !s.jumping) { 
      s.jumping = true; 
      play("jump");
      s.velY = s.phase === "boss_fight" ? C.JUMP_VEL * 1.35 : C.JUMP_VEL; 
      s.crouching = false; 
    }
  }, [play]);
  const doCrouch = useCallback((d: boolean) => { const s = g.current; if (s.phase === "runner" || s.phase === "boss_fight") s.crouching = d; }, []);
  const doMove = useCallback((dir: "left"|"right"|"none") => {
    const s = g.current;
    s.moveLeft = dir === "left"; s.moveRight = dir === "right";
  }, []);
  const doAttack = useCallback(() => {
    const s = g.current; 
    if (s.phase !== "runner" && s.phase !== "boss_fight") return;
    if (s.fbCd > 0) return;
    s.fbCd = C.FB_CD; const py = s.crouching ? s.groundY - C.PH * 0.5 : s.playerY;
    const dir = s.phase === "boss_fight" && s.playerX > s.bossX ? -1 : 1;
    s.fireballs.push({ x: s.playerX + (dir === 1 ? C.PW : -C.FB_W), y: py + (s.crouching ? C.PH * 0.15 : C.PH * 0.35), dir }); 
    play("fireball");
  }, [play]);
  const doUlti = useCallback(() => {
    const s = g.current; 
    if (s.phase !== "runner" && s.phase !== "boss_fight") return;
    if (s.ultiCd > 0 || s.ultiActive) return;
    s.ultiActive = true; s.ultiFrame = 0; s.ultiTimer = 0; s.ultiCd = C.ULTI_CD; setUltiReady(false); play("ulti");
    setTimeout(() => setUltiReady(true), C.ULTI_CD * 1000);
  }, [play]);

  const doDeath = useCallback(() => {
    const s = g.current; s.phase = "gameover"; stopAll(); play("gameover"); setTimeout(() => play("death"), 300);
    setDisplayScore(s.score); setUiPhase("gameover");
    const prev = parseInt(localStorage.getItem(C.LS_HIGH) || "0", 10);
    if (s.score > prev) { localStorage.setItem(C.LS_HIGH, String(s.score)); setHighScore(s.score); }
  }, [play, stopAll]);

  const doVictory = useCallback(() => {
    const s = g.current; s.phase = "victory"; stopAll(); play("victory"); setDisplayScore(s.score); setUiPhase("victory");
    const prev = parseInt(localStorage.getItem(C.LS_HIGH) || "0", 10);
    if (s.score > prev) { localStorage.setItem(C.LS_HIGH, String(s.score)); setHighScore(s.score); }
    (async () => {
      try { await fetch("/api/submit-score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ player_name: localStorage.getItem(C.LS_NAME) || "Anon", game_slug: "affan-strike", score: s.score }) }); fetchLB(); } catch {}
    })();
  }, [play, stopAll, fetchLB]);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, s: GameState) => {
    const isBoss = s.phase === "boss_fight" || s.phase === "boss_intro";
    drawSky(ctx, C.LW, isBoss);
    for (const c of s.clouds) {
      const key = `${Math.round(c.w)}_${Math.round(c.h)}_${c.opacity.toFixed(2)}`;
      if (!cloudCache.current.has(key)) {
        const offW = Math.ceil(c.w + c.h) + 20;
        const offH = Math.ceil(c.h * 1.8) + 20;
        const off = document.createElement("canvas");
        off.width = offW; off.height = offH;
        const offCtx = off.getContext("2d");
        if (offCtx) {
          offCtx.translate(offW / 2, offH * 0.7);
          drawCloud(offCtx, { ...c, x: 0, y: 0 });
        }
        cloudCache.current.set(key, off);
      }
      const cached = cloudCache.current.get(key)!;
      ctx.drawImage(cached, c.x - cached.width / 2, c.y - cached.height * 0.7);
    }
    drawGround(ctx, C.LW, s.scrollX);
    if (s.phase === "runner") for (const o of s.obstacles) { o.type === "cactus" ? drawCactus(ctx, o.x, o.variant) : (imgsOk.current["airEnemy"] && ctx.drawImage(imgs.current["airEnemy"], o.x, o.y, o.w, o.h)); }
    
    const ph = s.crouching ? C.PH * 0.5 : C.PH; const py = s.crouching ? s.groundY - ph : s.playerY;
    const pKey = s.walkFrame === 0 ? "walkR" : "walkL";
    const playerFacesLeft = s.playerX > s.bossX;

    if (!(s.invTimer > 0 && Math.floor(s.invTimer * 10) % 2 === 0)) {
      if (imgsOk.current[pKey]) {
        if (playerFacesLeft) {
          ctx.save(); ctx.scale(-1, 1);
          ctx.drawImage(imgs.current[pKey], -s.playerX - C.PW, py + 28, C.PW, ph);
          ctx.restore();
        } else {
          ctx.drawImage(imgs.current[pKey], s.playerX, py + 28, C.PW, ph);
        }
      } else {
        ctx.fillStyle = "#FF6B35"; ctx.fillRect(s.playerX, py + 28, C.PW, ph);
      }
    }
    for (const fb of s.fireballs) { imgsOk.current["fireball"] ? ctx.drawImage(imgs.current["fireball"], fb.x, fb.y, C.FB_W, C.FB_H) : ctx.fillRect(fb.x, fb.y, C.FB_W, C.FB_H); }
    if (s.ultiActive && imgsOk.current["ulti"]) {
      const sheet = imgs.current["ulti"]; const fw = sheet.naturalWidth / C.ULTI_FRAMES;
      if (playerFacesLeft) {
        ctx.save(); ctx.scale(-1, 1);
        ctx.drawImage(sheet, s.ultiFrame * fw, 0, fw, sheet.naturalHeight, -s.playerX + 50, py - 20, s.playerX + 50, ph + 40);
        ctx.restore();
      } else {
        ctx.drawImage(sheet, s.ultiFrame * fw, 0, fw, sheet.naturalHeight, s.playerX + C.PW, py - 20, C.LW - s.playerX - C.PW + 50, ph + 40);
      }
    }
    if (s.phase === "boss_intro" && imgsOk.current["dioIntro"]) {
      ctx.drawImage(imgs.current["dioIntro"], s.bossX, s.bossY + 30, 120, 180);
    }
    if (s.phase === "boss_fight") {
      const sheet = imgs.current["dioAtk"];
      if (imgsOk.current["dioAtk"] && s.bossAtking) {
        const fw = sheet.naturalWidth / C.DIO_COLS; const fh = sheet.naturalHeight / C.DIO_ROWS;
        if (playerFacesLeft) {
          ctx.save(); ctx.scale(-1, 1);
          ctx.drawImage(sheet, (s.bossFrame % C.DIO_COLS) * fw, Math.floor(s.bossFrame / C.DIO_COLS) * fh, fw, fh, -s.bossX - 120, s.bossY + 30, 120, 180);
          ctx.restore();
        } else {
          ctx.drawImage(sheet, (s.bossFrame % C.DIO_COLS) * fw, Math.floor(s.bossFrame / C.DIO_COLS) * fh, fw, fh, s.bossX, s.bossY + 30, 120, 180);
        }
      } else if (imgsOk.current["dioIntro"]) {
        if (playerFacesLeft) {
          ctx.save(); ctx.scale(-1, 1);
          ctx.drawImage(imgs.current["dioIntro"], -s.bossX - 120, s.bossY + 30, 120, 180);
          ctx.restore();
        } else {
          ctx.drawImage(imgs.current["dioIntro"], s.bossX, s.bossY + 30, 120, 180);
        }
      }
      for (const p of s.bossProj) { ctx.fillStyle = "#FFD700"; ctx.beginPath(); ctx.arc(p.x + 12, p.y + 12, 12, 0, Math.PI * 2); ctx.fill(); }
      if (s.rr && imgsOk.current["roadRoller"]) ctx.drawImage(imgs.current["roadRoller"], s.rr.x, s.rr.y, 240, 120);
    }
    if (hpBarRef.current) hpBarRef.current.style.width = `${Math.max(0, s.hp / C.P_MAX_HP * 100)}%`;
    if (bossHpBarRef.current) bossHpBarRef.current.style.width = `${Math.max(0, s.bossHP / C.BOSS_HP * 100)}%`;
    if (hpTextRef.current) hpTextRef.current.textContent = `${Math.max(0, Math.floor(s.hp))} / ${C.P_MAX_HP}`;
    if (bossHpTextRef.current) bossHpTextRef.current.textContent = `${Math.max(0, Math.floor(s.bossHP))} / ${C.BOSS_HP}`;
    if (scoreTextRef.current) scoreTextRef.current.textContent = String(s.score);
    if (subtitleRef.current) subtitleRef.current.textContent = (s as any).subtitle || "";

    if (dioBubbleRef.current) {
      if ((s as any).speaker === "dio") {
        dioBubbleRef.current.style.display = "block";
        dioBubbleRef.current.style.left = `${((s.bossX + 60) / C.LW) * 100}%`;
        dioBubbleRef.current.style.top = `${(s.bossY / C.LH) * 100}%`;
        if (dioBubbleTextRef.current) dioBubbleTextRef.current.textContent = (s as any).subtitle;
      } else {
        dioBubbleRef.current.style.display = "none";
      }
    }
    if (affanBubbleRef.current) {
      if ((s as any).speaker === "affan") {
        affanBubbleRef.current.style.display = "block";
        affanBubbleRef.current.style.left = `${((s.playerX + C.PW/2) / C.LW) * 100}%`;
        affanBubbleRef.current.style.top = `${(py / C.LH) * 100}%`;
        if (affanBubbleTextRef.current) affanBubbleTextRef.current.textContent = (s as any).subtitle;
      } else {
        affanBubbleRef.current.style.display = "none";
      }
    }
    if (dioApproachesRef.current) {
      dioApproachesRef.current.style.display = (s.phase === "boss_intro" && s.bossIntroT < 5.0) ? "block" : "none";
    }

    // Genshin Skill UI Decimal Updates
    if (skillCdRef.current) skillCdRef.current.textContent = s.fbCd > 0 ? s.fbCd.toFixed(1) : "";
    if (ultiCdRef.current) ultiCdRef.current.textContent = s.ultiCd > 0 ? s.ultiCd.toFixed(1) : "";
    
    if (skillBtnRef.current) {
      if (s.fbCd > 0) skillBtnRef.current.classList.add("grayscale", "opacity-60");
      else skillBtnRef.current.classList.remove("grayscale", "opacity-60");
    }
    if (ultiBtnRef.current) {
      if (s.ultiCd > 0) ultiBtnRef.current.classList.add("grayscale", "opacity-60");
      else ultiBtnRef.current.classList.remove("grayscale", "opacity-60");
    }
  }, []);

  const loop = useCallback((ts: number) => {
    const cv = canvasRef.current, ct = containerRef.current; if (!cv || !ct) return;
    if (!ctxRef.current) {
      ctxRef.current = cv.getContext("2d", { alpha: false }) ?? null;
    }
    const ctx = ctxRef.current; if (!ctx) return;
    const s = g.current; if (s.lastTime === 0) s.lastTime = ts;
    const dt = Math.min((ts - s.lastTime) / 1000, 0.05); s.lastTime = ts;
    const rect = ct.getBoundingClientRect(); if (rect.width > 0 && rect.height > 0) C.setLW(Math.round(C.LH * (rect.width / rect.height)));
    if (cv.width !== C.LW || cv.height !== C.LH) {
      cv.width = C.LW;
      cv.height = C.LH;
    }

    for (const c of s.clouds) { c.x -= c.speed * dt; if (c.x + c.w < 0) { c.x = C.LW + c.w; c.y = 30 + Math.random() * C.LH * 0.35; } }
    if (s.phase === "ready") s.playerY = s.groundY - C.PH + Math.sin(Date.now() / 300) * 6;
    
    if (welcomeMsgRef.current) {
      if (s.phase === "runner" && s.welcomeTimer > 0) {
        s.welcomeTimer = Math.max(0, s.welcomeTimer - dt);
        welcomeMsgRef.current.style.opacity = Math.min(1, s.welcomeTimer).toString();
      } else if (welcomeMsgRef.current.style.opacity !== "0") {
        welcomeMsgRef.current.style.opacity = "0";
      }
    }

    if (s.phase === "runner") {
      const res = updateRunner(s, dt);
      if (res === "hit_cactus") doDeath(); else if (res === "hit_air") { play("death"); setDisplayScore(s.score); }
      else if (res === "boss") { 
        s.phase = "boss_intro"; s.bossIntroT = 0; 
        s.fireballs = [];
        setUiPhase("boss_intro");
        play("dioBgm", true);
      }
    }
    
    if (s.phase === "boss_intro") {
      updateBossIntro(s, dt);
      const st = s as any;

      if (s.bossIntroT > 0.0 && !st.playedKonoDio) { play("konoDio"); st.playedKonoDio = true; setUiPhase("boss_intro_1" as any); }
      if (s.bossIntroT > 2.5 && !st.playedHoMukatte) { play("hoMukatteKurunokaDio"); st.playedHoMukatte = true; setUiPhase("boss_intro_2" as any); }
      if (s.bossIntroT > 7.0 && !st.playedSugiwa) { play("sugiwaJotaroDio"); st.playedSugiwa = true; setUiPhase("boss_intro_3" as any); }
      if (s.bossIntroT > 9.5 && !st.playedJotaroSaying) { play("jotaroSayingDio"); st.playedJotaroSaying = true; setUiPhase("boss_intro_4" as any); }
      if (s.bossIntroT > 11.5 && !st.playedZaWarudo) { play("zaWarudo"); st.playedZaWarudo = true; setUiPhase("boss_intro_5" as any); }
      
      // THE WRYYY TRIGGER
      if (s.bossIntroT > 13.0 && !st.playedWryyyy) { 
        play("wryyyyDio"); 
        st.playedWryyyy = true; 
        setUiPhase("boss_intro_6" as any); 
      }
      
      // STRICTLY +1.5 SECONDS AFTER WRYYY
      if (s.bossIntroT >= 14.5) {
        (s as any).subtitle = "";
        (s as any).speaker = "none";
        s.phase = "boss_fight";
        s.bossY = s.groundY - 180;
        setUiPhase("boss_fight");
        s.bossAtking = false; 
        st.bossAtkTimer = 999;
      }
    }
    
    if (s.phase === "boss_fight") {
      const events = updateBoss(s, dt);
      events.forEach(res => {
        if (res === "zaWarudo") play("zaWarudo");
        if (res === "wryyyyDio") play("wryyyyDio");
        if (res === "boss_atk_start") play("mudaMuda", true);
        if (res === "boss_atk_end") stopSpecificAudio("mudaMuda");
        if (res === "road_roller_throw") play("roadRollerDa");
        if (res === "road_roller_land") play("explosionMeme");
        if (res === "player_dead" || res === "rr_hit") doDeath();
        else if (res === "boss_dead") doVictory();
      });
    }
    drawFrame(ctx, s);
    if (s.phase !== "gameover" && s.phase !== "victory") rafRef.current = requestAnimationFrame(loop);
  }, [doDeath, doVictory, drawFrame, play, stopSpecificAudio]);

  const handleRegister = useCallback(() => {
    const t = nameInput.trim(); if (!t) return;
    localStorage.setItem(C.LS_NAME, t); setPlayerName(t); resetState(g.current); setUiPhase("ready");
    cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(loop);
  }, [nameInput, loop]);
  
  const handleRestart = useCallback(() => { 
    resetState(g.current); stopAll(); setUiPhase("ready"); setUltiReady(true); 
    cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(loop); 
  }, [stopAll, loop]);

  useEffect(() => {
    setIsTouchDevice(navigator.maxTouchPoints > 0);
    loadImg("walkR", "affanKakiKanan.png"); loadImg("walkL", "affanKakiKiri.png"); loadImg("fireball", "fireball.png"); loadImg("airEnemy", "cursedAffanUdara.png");
    loadImg("dioIntro", "eoh_DIO.png"); loadImg("dioAtk", "dioAttackFrame.png"); loadImg("roadRoller", "roadRollerDio.png"); loadImg("ulti", "ultiAffan.png");
    loadSfx("fireball", "ghast-fireball.mp3", 0.4); loadSfx("ulti", "ultimate-affan.mp3", 0.6); loadSfx("gameover", "gameover_1.mp3", 0.6); loadSfx("death", "robloxDeathSound.mp3", 0.5);
    loadSfx("jump", "cartoon-jump.mp3", 0.5);
    loadSfx("victory", "booyah-free-fire.mp3", 0.7); loadSfx("dioBgm", "dioTheme-DarkRebirth.mp3", 0.3); loadSfx("konoDio", "kono-dio-da.mp3", 0.6); loadSfx("mudaMuda", "muda-muda-mudaDio.mp3", 0.5);
    loadSfx("hoMukatteKurunokaDio", "hoMukatteKurunokaDio.mp3", 0.6); loadSfx("sugiwaJotaroDio", "sugiwaJotaroDio.mp3", 0.6); loadSfx("jotaroSayingDio", "jotaroSayingDio.mp3", 0.6);
    loadSfx("zaWarudo", "zaWarudo-dio.mp3", 0.6); loadSfx("wryyyyDio", "wryyyyDio.mp3", 0.6); loadSfx("roadRollerDa", "roadRollerDa.mp3", 0.6); loadSfx("explosionMeme", "explosion-meme.mp3", 0.6);
    const stored = localStorage.getItem(C.LS_NAME); setHighScore(parseInt(localStorage.getItem(C.LS_HIGH) || "0", 10));
    if (stored) { setPlayerName(stored); g.current.phase = "ready"; setUiPhase("ready"); }
    fetchLB(); rafRef.current = requestAnimationFrame(loop);

    const onKD = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); doJump(); }
      if (e.code === "ArrowDown") { e.preventDefault(); doCrouch(true); }
      if (e.code === "KeyA" || e.code === "ArrowLeft") doMove("left");
      if (e.code === "KeyD" || e.code === "ArrowRight") doMove("right");
      if (e.code === "KeyE") doAttack(); if (e.code === "KeyQ") doUlti();
    };
    const onKU = (e: KeyboardEvent) => { 
      if (e.code === "ArrowDown") doCrouch(false); 
      if (e.code === "KeyA" || e.code === "ArrowLeft") doMove("none");
      if (e.code === "KeyD" || e.code === "ArrowRight") doMove("none");
    };
    window.addEventListener("keydown", onKD); window.addEventListener("keyup", onKU);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("keydown", onKD); window.removeEventListener("keyup", onKU); audios.current.forEach(a => { a.pause(); a.currentTime = 0; }); Object.values(imgs.current).forEach(im => { im.onload = null; }); };
  }, [loop]);

  return { canvasRef, containerRef, hpBarRef, bossHpBarRef, hpTextRef, bossHpTextRef, dioBubbleRef, affanBubbleRef, dioBubbleTextRef, affanBubbleTextRef, scoreTextRef, subtitleRef, dioApproachesRef, welcomeMsgRef, skillCdRef, ultiCdRef, skillBtnRef, ultiBtnRef, uiPhase, displayScore, highScore, playerName, nameInput, setNameInput, handleRegister, handleRestart, leaderboard, isTouchDevice, doJump, doCrouch, doAttack, doUlti, doMove, ultiReady };
}