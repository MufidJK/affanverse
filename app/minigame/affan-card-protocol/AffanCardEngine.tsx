"use client";

import React, { useReducer, useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Shield, Zap, Skull, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

/* ═══════════════════════════════════════════════
   TYPES — Zero Red-Lines Policy (SOP Rule 10)
   ═══════════════════════════════════════════════ */

interface Card {
  id: string;
  name: string;
  type: "ATTACK" | "DEFENSE" | "SKILL";
  cost: number;
  value: number;
  image: string;
}

interface EnemyIntent {
  type: "ATTACK" | "DEFENSE";
  value: number;
}

type GamePhase =
  | "REGISTER"
  | "TUTORIAL"
  | "DRAW"
  | "PLAYER_TURN"
  | "ENEMY_TURN"
  | "GAME_OVER"
  | "RUN_CLEAR";

interface AffanCardScoreRow {
  id: string;
  created_at: string;
  player_name: string;
  floor_reached: number;
  total_turns: number;
  final_score: number;
}

interface GameState {
  phase: GamePhase;
  playerHp: number;
  playerMaxHp: number;
  playerAp: number;
  playerMaxAp: number;
  playerBlock: number;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyIntent: EnemyIntent;
  enemyImage: string;
  deck: Card[];
  hand: Card[];
  graveyard: Card[];
  floor: number;
  turnsInCurrentFloor: number;
  totalTurnsAccumulated: number;
  isBgmMuted: boolean;
  playerName: string;
  gameOverScoreSubmitted: boolean;
  animatingEnemyHit: boolean;
  animatingPlayerHit: boolean;
}

type GameAction =
  | { type: "SET_PLAYER_NAME"; name: string }
  | { type: "START_GAME" }
  | { type: "CLOSE_TUTORIAL" }
  | { type: "DRAW_PHASE" }
  | { type: "PLAY_CARD"; cardId: string }
  | { type: "END_PLAYER_TURN" }
  | { type: "ENEMY_TURN_RESOLVE" }
  | { type: "TRIGGER_DEATH" }
  | { type: "TOGGLE_BGM" }
  | { type: "MARK_SCORE_SUBMITTED" }
  | { type: "SET_ENEMY_HIT"; value: boolean }
  | { type: "SET_PLAYER_HIT"; value: boolean }
  | { type: "RESTART" };

/* ═══════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════ */

const LS_NAME_KEY = "affan_player_name";

/** All character portraits available in the roster */
const CHARACTER_ROSTER = [
  { name: "Affan", image: "/minigame/affan-card-protocol/affan.png" },
  { name: "Jeka", image: "/minigame/affan-card-protocol/jeka.png" },
  { name: "Elio Zaynezz", image: "/minigame/affan-card-protocol/elio-zaynezz.png" },
  { name: "Ambasuke", image: "/minigame/affan-card-protocol/ambasuke.png" },
  { name: "Gilang", image: "/minigame/affan-card-protocol/gilang.png" },
  { name: "Vira", image: "/minigame/affan-card-protocol/vira.png" },
  { name: "Pak Wahyu", image: "/minigame/affan-card-protocol/pak-wahyu.png" },
  { name: "Kaiden", image: "/minigame/affan-card-protocol/kaiden.png" },
  { name: "Exite", image: "/minigame/affan-card-protocol/exite.png" },
  { name: "Igis", image: "/minigame/affan-card-protocol/igis.png" },
  { name: "Glicherry", image: "/minigame/affan-card-protocol/glicherry.png" },
  { name: "Cipher", image: "/minigame/affan-card-protocol/cipher.png" },
  { name: "The Sovereign", image: "/minigame/affan-card-protocol/the-sovereign.png" },
];

/** Generates the starting deck of 10 cards */
function generateStartingDeck(): Card[] {
  const templates: Omit<Card, "id">[] = [
    { name: "Affan", type: "ATTACK", cost: 1, value: 6, image: "/minigame/affan-card-protocol/affan.png" },
    { name: "Jeka", type: "ATTACK", cost: 1, value: 7, image: "/minigame/affan-card-protocol/jeka.png" },
    { name: "Elio Zaynezz", type: "ATTACK", cost: 2, value: 14, image: "/minigame/affan-card-protocol/elio-zaynezz.png" },
    { name: "Ambasuke", type: "ATTACK", cost: 2, value: 12, image: "/minigame/affan-card-protocol/ambasuke.png" },
    { name: "Gilang", type: "DEFENSE", cost: 1, value: 8, image: "/minigame/affan-card-protocol/gilang.png" },
    { name: "Vira", type: "DEFENSE", cost: 1, value: 7, image: "/minigame/affan-card-protocol/vira.png" },
    { name: "Pak Wahyu", type: "SKILL", cost: 0, value: 5, image: "/minigame/affan-card-protocol/pak-wahyu.png" },
    { name: "Kaiden", type: "ATTACK", cost: 1, value: 8, image: "/minigame/affan-card-protocol/kaiden.png" },
    { name: "Exite", type: "DEFENSE", cost: 2, value: 14, image: "/minigame/affan-card-protocol/exite.png" },
    { name: "Igis", type: "SKILL", cost: 1, value: 4, image: "/minigame/affan-card-protocol/igis.png" },
  ];
  return templates.map((t, i) => ({ ...t, id: `card-${i}-${Date.now()}` }));
}

/** Fisher-Yates shuffle (in-place, returns new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a random enemy from the roster, excluding a given name */
function pickEnemy(excludeName?: string): { name: string; image: string } {
  const pool = excludeName
    ? CHARACTER_ROSTER.filter((c) => c.name !== excludeName)
    : CHARACTER_ROSTER;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Roll a randomized enemy intent */
function rollIntent(floor: number): EnemyIntent {
  const isAttack = Math.random() > 0.35;
  const baseValue = isAttack ? 6 + floor * 2 : 4 + floor;
  const jitter = Math.floor(Math.random() * 4) - 1;
  return {
    type: isAttack ? "ATTACK" : "DEFENSE",
    value: Math.max(1, baseValue + jitter),
  };
}

/* ═══════════════════════════════════════════════
   REDUCER — Single unified state machine
   (SOP: Prevent sprawling useState hooks)
   ═══════════════════════════════════════════════ */

function createInitialState(): GameState {
  const enemy = pickEnemy();
  return {
    phase: "REGISTER",
    playerHp: 100,
    playerMaxHp: 100,
    playerAp: 3,
    playerMaxAp: 3,
    playerBlock: 0,
    enemyName: enemy.name,
    enemyHp: 30,
    enemyMaxHp: 30,
    enemyIntent: rollIntent(1),
    enemyImage: enemy.image,
    deck: [],
    hand: [],
    graveyard: [],
    floor: 1,
    turnsInCurrentFloor: 0,
    totalTurnsAccumulated: 0,
    isBgmMuted: false,
    playerName: "",
    gameOverScoreSubmitted: false,
    animatingEnemyHit: false,
    animatingPlayerHit: false,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.name };

    case "START_GAME": {
      const deck = shuffle(generateStartingDeck());
      const enemy = pickEnemy();
      return {
        ...state,
        phase: "TUTORIAL",
        playerHp: 100,
        playerMaxHp: 100,
        playerAp: 3,
        playerMaxAp: 3,
        playerBlock: 0,
        enemyName: enemy.name,
        enemyHp: 30,
        enemyMaxHp: 30,
        enemyIntent: rollIntent(1),
        enemyImage: enemy.image,
        deck,
        hand: [],
        graveyard: [],
        floor: 1,
        turnsInCurrentFloor: 0,
        totalTurnsAccumulated: 0,
        gameOverScoreSubmitted: false,
        animatingEnemyHit: false,
        animatingPlayerHit: false,
      };
    }

    case "CLOSE_TUTORIAL":
      return { ...state, phase: "DRAW" };

    case "DRAW_PHASE": {
      let newDeck = [...state.deck];
      let newGraveyard = [...state.graveyard];
      // If deck is empty, recycle graveyard
      if (newDeck.length < 3) {
        newDeck = shuffle([...newDeck, ...newGraveyard]);
        newGraveyard = [];
      }
      // Draw 3 (or whatever remains)
      const drawCount = Math.min(3, newDeck.length);
      const drawn = newDeck.splice(0, drawCount);
      // Assign fresh IDs to prevent key collisions when cards cycle back
      const freshDrawn = drawn.map((c) => ({ ...c, id: `card-${c.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
      return {
        ...state,
        phase: "PLAYER_TURN",
        deck: newDeck,
        hand: [...state.hand, ...freshDrawn],
        graveyard: newGraveyard,
        playerAp: state.playerMaxAp,
        playerBlock: 0,
      };
    }

    case "PLAY_CARD": {
      const cardIndex = state.hand.findIndex((c) => c.id === action.cardId);
      if (cardIndex === -1) return state;
      const card = state.hand[cardIndex];
      if (card.cost > state.playerAp) return state;

      const newHand = state.hand.filter((_, i) => i !== cardIndex);
      const newGraveyard = [...state.graveyard, card];
      let newEnemyHp = state.enemyHp;
      let newPlayerBlock = state.playerBlock;
      const newPlayerHp = state.playerHp;

      switch (card.type) {
        case "ATTACK":
          newEnemyHp = Math.max(0, state.enemyHp - card.value);
          break;
        case "DEFENSE":
          newPlayerBlock += card.value;
          break;
        case "SKILL":
          // Skills: deal minor damage AND gain minor block
          newEnemyHp = Math.max(0, state.enemyHp - Math.floor(card.value * 0.6));
          newPlayerBlock += Math.floor(card.value * 0.6);
          break;
      }

      return {
        ...state,
        hand: newHand,
        graveyard: newGraveyard,
        playerAp: state.playerAp - card.cost,
        enemyHp: newEnemyHp,
        playerBlock: newPlayerBlock,
        playerHp: newPlayerHp,
      };
    }

    case "END_PLAYER_TURN": {
      // Enemy attacks
      const intent = state.enemyIntent;
      let newPlayerHp = state.playerHp;
      let newPlayerBlock = state.playerBlock;

      if (intent.type === "ATTACK") {
        let dmg = intent.value;
        if (newPlayerBlock > 0) {
          const absorbed = Math.min(newPlayerBlock, dmg);
          newPlayerBlock -= absorbed;
          dmg -= absorbed;
        }
        newPlayerHp = Math.max(0, newPlayerHp - dmg);
      }
      // DEFENSE intent: enemy gains nothing visible (lore: it's buffing itself for next turn, but mechanically we just roll new intent)

      return {
        ...state,
        phase: "ENEMY_TURN",
        playerHp: newPlayerHp,
        playerBlock: newPlayerBlock,
        turnsInCurrentFloor: state.turnsInCurrentFloor + 1,
        totalTurnsAccumulated: state.totalTurnsAccumulated + 1,
      };
    }

    case "ENEMY_TURN_RESOLVE": {
      // Check player death
      if (state.playerHp <= 0) {
        return { ...state, phase: "GAME_OVER" };
      }
      // Check enemy death
      if (state.enemyHp <= 0) {
        const newFloor = state.floor + 1;
        const enemy = pickEnemy(state.enemyName);
        const scaledHp = 25 + newFloor * 10;
        return {
          ...state,
          phase: "DRAW",
          floor: newFloor,
          enemyName: enemy.name,
          enemyImage: enemy.image,
          enemyHp: scaledHp,
          enemyMaxHp: scaledHp,
          enemyIntent: rollIntent(newFloor),
          turnsInCurrentFloor: 0,
          playerAp: state.playerMaxAp,
          playerBlock: 0,
          // Discard remaining hand
          hand: [],
          graveyard: [...state.graveyard, ...state.hand],
        };
      }
      // Enemy alive, player alive → new draw phase
      return {
        ...state,
        phase: "DRAW",
        enemyIntent: rollIntent(state.floor),
        // Discard remaining hand
        hand: [],
        graveyard: [...state.graveyard, ...state.hand],
      };
    }

    case "TRIGGER_DEATH":
      return { ...state, phase: "GAME_OVER" };

    case "TOGGLE_BGM":
      return { ...state, isBgmMuted: !state.isBgmMuted };

    case "MARK_SCORE_SUBMITTED":
      return { ...state, gameOverScoreSubmitted: true };

    case "SET_ENEMY_HIT":
      return { ...state, animatingEnemyHit: action.value };

    case "SET_PLAYER_HIT":
      return { ...state, animatingPlayerHit: action.value };

    case "RESTART": {
      const deck = shuffle(generateStartingDeck());
      const enemy = pickEnemy();
      return {
        ...state,
        phase: "TUTORIAL",
        playerHp: 100,
        playerMaxHp: 100,
        playerAp: 3,
        playerMaxAp: 3,
        playerBlock: 0,
        enemyName: enemy.name,
        enemyHp: 30,
        enemyMaxHp: 30,
        enemyIntent: rollIntent(1),
        enemyImage: enemy.image,
        deck,
        hand: [],
        graveyard: [],
        floor: 1,
        turnsInCurrentFloor: 0,
        totalTurnsAccumulated: 0,
        gameOverScoreSubmitted: false,
        animatingEnemyHit: false,
        animatingPlayerHit: false,
      };
    }

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

export default function AffanCardEngine() {
  // Lock body scroll on mount
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require("react").useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }, []);
  }
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [nameInput, setNameInput] = useState("");
  const [isPortrait, setIsPortrait] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ player_name: string; score: number }[]>([]);

  /* ── Active Play Zone: card being animated to center board ── */
  const [activePlayCard, setActivePlayCard] = useState<Card | null>(null);
  const playCardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Enemy lunge animation state ── */
  const [enemyLunging, setEnemyLunging] = useState(false);

  /* ── Audio refs — SOP Rule 7 ── */
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxCardSwap = useRef<HTMLAudioElement | null>(null);
  const sfxHit = useRef<HTMLAudioElement | null>(null);
  const sfxBamboo = useRef<HTMLAudioElement | null>(null);
  const sfxBlock = useRef<HTMLAudioElement | null>(null);
  const audioUnlocked = useRef(false);

  /* ── Timers for enemy turn animation ── */
  const enemyTurnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ═══════════════════════════════════════════
     LEADERBOARD
     ═══════════════════════════════════════════ */
  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await (supabase.from("affan_card_scores") as unknown as {
        select: (cols: string) => { order: (col: string, opts: { ascending: boolean }) => { limit: (num: number) => Promise<{ data: { player_name: string; final_score: number }[] | null; error: any }> } }
      }).select("player_name, final_score").order("final_score", { ascending: false }).limit(5);

      if (!error && data) {
        setLeaderboard((data as { player_name: string; final_score: number }[]).map((d) => ({
          player_name: d.player_name,
          score: d.final_score,
        })));
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  }, []);

  /* ═══════════════════════════════════════════
     AUDIO INIT & CLEANUP — SOP Rule 7
     ═══════════════════════════════════════════ */

  const initAudio = useCallback(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio("/minigame/affan-card-protocol/wandering-in-the-night-music.mp3");
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.25;
    }
    if (!sfxCardSwap.current) {
      sfxCardSwap.current = new Audio("/minigame/affan-card-protocol/card-swap.mp3");
      sfxCardSwap.current.volume = 0.5;
    }
    if (!sfxHit.current) {
      sfxHit.current = new Audio("/minigame/affan-card-protocol/hit.mp3");
      sfxHit.current.volume = 0.6;
    }
    if (!sfxBamboo.current) {
      sfxBamboo.current = new Audio("/minigame/affan-card-protocol/bamboo-hit-sound-effect.mp3");
      sfxBamboo.current.volume = 0.7;
    }
    if (!sfxBlock.current) {
      sfxBlock.current = new Audio("/minigame/affan-card-protocol/block-shield.mp3");
      sfxBlock.current.volume = 0.5;
    }
  }, []);

  const playSfx = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const a = ref.current;
    if (!a || !audioUnlocked.current) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioUnlocked.current) return;
    audioUnlocked.current = true;
    [sfxCardSwap, sfxHit, sfxBamboo, sfxBlock].forEach((r) => {
      const a = r.current;
      if (a) {
        a.play().then(() => a.pause()).catch(() => {});
        a.currentTime = 0;
      }
    });
  }, []);

  /* ═══════════════════════════════════════════
     ORIENTATION MONITOR — SOP Rule 5
     ═══════════════════════════════════════════ */

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth < 1024 && window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  /* ═══════════════════════════════════════════
     MOUNT / UNMOUNT — SOP Rule 2 & 7
     ═══════════════════════════════════════════ */

  useEffect(() => {
    initAudio();
    fetchLeaderboard();

    // Load stored name
    const storedName = localStorage.getItem(LS_NAME_KEY);
    if (storedName) {
      dispatch({ type: "SET_PLAYER_NAME", name: storedName });
      dispatch({ type: "START_GAME" }); // Skip directly to TUTORIAL
    }

    /* ── CLEANUP — SOP Rule 2 & 7 ── */
    return () => {
      // Clear enemy turn timer
      if (enemyTurnTimer.current) {
        clearTimeout(enemyTurnTimer.current);
        enemyTurnTimer.current = null;
      }
      // Clear play card timer
      if (playCardTimer.current) {
        clearTimeout(playCardTimer.current);
        playCardTimer.current = null;
      }
      // Audio cleanup — SOP Rule 7
      [bgmRef, sfxCardSwap, sfxHit, sfxBamboo, sfxBlock].forEach((r) => {
        const a = r.current;
        if (a) {
          a.pause();
          a.src = "";
          a.load();
          r.current = null;
        }
      });
      audioUnlocked.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════
     BGM MUTE SYNC
     ═══════════════════════════════════════════ */

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    if (state.isBgmMuted) {
      bgm.pause();
    } else if (state.phase !== "REGISTER" && state.phase !== "GAME_OVER") {
      bgm.play().catch(() => {});
    }
  }, [state.isBgmMuted, state.phase]);

  /* ═══════════════════════════════════════════
     AUTO-TRIGGER DRAW PHASE
     ═══════════════════════════════════════════ */

  useEffect(() => {
    if (state.phase === "DRAW") {
      playSfx(sfxCardSwap);
      // Small delay for card draw animation feel
      const t = setTimeout(() => dispatch({ type: "DRAW_PHASE" }), 400);
      return () => clearTimeout(t);
    }
  }, [state.phase, playSfx]);

  /* ═══════════════════════════════════════════
     AUTO-RESOLVE ENEMY TURN — Enemy Lunge Animation
     Enemy card lunges downward with red flash for 500ms,
     then after 800ms total delay, resolve HP deduction.
     ═══════════════════════════════════════════ */

  useEffect(() => {
    if (state.phase === "ENEMY_TURN") {
      // Phase 1: Enemy lunges (0–500ms)
      setEnemyLunging(true);
      dispatch({ type: "SET_PLAYER_HIT", value: true });

      // Phase 2: Enemy returns, resolve after 800ms
      enemyTurnTimer.current = setTimeout(() => {
        setEnemyLunging(false);
        dispatch({ type: "SET_PLAYER_HIT", value: false });
        dispatch({ type: "ENEMY_TURN_RESOLVE" });
        enemyTurnTimer.current = null;
      }, 800);
      return () => {
        if (enemyTurnTimer.current) {
          clearTimeout(enemyTurnTimer.current);
          enemyTurnTimer.current = null;
        }
        setEnemyLunging(false);
      };
    }
  }, [state.phase]);

  /* ═══════════════════════════════════════════
     GAME OVER → SCORE SUBMISSION (Direct Supabase Insert)
     Writes to `affan_card_scores` table with floor_reached,
     total_turns, final_score columns.
     ═══════════════════════════════════════════ */

  useEffect(() => {
    if (state.phase === "GAME_OVER" && !state.gameOverScoreSubmitted) {
      // Stop BGM
      const bgm = bgmRef.current;
      if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
      }

      const floorReached = state.floor;
      const totalTurns = state.totalTurnsAccumulated;
      const calculatedScore = Math.max(0, floorReached * 1000 - totalTurns * 10);
      const name = state.playerName || "Jeka";

      dispatch({ type: "MARK_SCORE_SUBMITTED" });

      // Direct runtime Supabase insert/update into affan_card_scores
      const submitScore = async () => {
        try {
          // 1. Check if the player already exists
          const { data: existingRecord } = await (supabase.from("affan_card_scores") as unknown as {
            select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { id: string; final_score: number } | null }> } }
          }).select("id, final_score").eq("player_name", name).single();

          if (existingRecord) {
            // 2. If exists, ONLY update if the new score is strictly HIGHER
            if (calculatedScore > existingRecord.final_score) {
              await (supabase.from("affan_card_scores") as unknown as {
                update: (payload: { floor_reached: number; total_turns: number; final_score: number }) => { eq: (col: string, val: string) => Promise<void> }
              }).update({
                floor_reached: floorReached,
                total_turns: totalTurns,
                final_score: calculatedScore,
              }).eq("id", existingRecord.id);
            }
          } else {
            // 3. If player doesn't exist, insert a fresh record
            await (supabase.from("affan_card_scores") as unknown as {
              insert: (payload: { player_name: string; floor_reached: number; total_turns: number; final_score: number }[]) => Promise<void>
            }).insert([{
              player_name: name,
              floor_reached: floorReached,
              total_turns: totalTurns,
              final_score: calculatedScore,
            }]);
          }
        } catch (error) {
          console.error("Failed to sync protocol data:", error);
        }
      };
      submitScore().then(() => fetchLeaderboard()).catch(() => {});
    }
  }, [state.phase, state.gameOverScoreSubmitted, state.floor, state.totalTurnsAccumulated, state.playerName, fetchLeaderboard]);

  /* ═══════════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════════ */

  const handleRegister = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem(LS_NAME_KEY, trimmed);
    dispatch({ type: "SET_PLAYER_NAME", name: trimmed });
    dispatch({ type: "START_GAME" });
    unlockAudio();
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    }
  }, [nameInput, unlockAudio]);

  const handleCloseTutorial = useCallback(() => {
    unlockAudio();
    dispatch({ type: "CLOSE_TUTORIAL" });
    const bgm = bgmRef.current;
    if (bgm) bgm.play().catch(() => {});
  }, [unlockAudio]);

  const handlePlayCard = useCallback(
    (cardId: string) => {
      if (state.phase !== "PLAYER_TURN" || activePlayCard) return;
      const card = state.hand.find((c) => c.id === cardId);
      if (!card || card.cost > state.playerAp) return;

      // Phase 1: Launch card into the Active Play Zone
      setActivePlayCard(card);

      if (card.type === "ATTACK") {
        // ATK: Charge right (0→400ms) then strike left (400→800ms)
        // SFX fires at strike impact (~700ms)
        const impactTimer = setTimeout(() => {
          if (card.name === "Ambasuke") {
            playSfx(sfxBamboo);
          } else {
            playSfx(sfxHit);
          }
          dispatch({ type: "SET_ENEMY_HIT", value: true });
        }, 700);

        // Cleanup after full animation (1000ms)
        playCardTimer.current = setTimeout(() => {
          dispatch({ type: "SET_ENEMY_HIT", value: false });
          dispatch({ type: "PLAY_CARD", cardId });
          setActivePlayCard(null);
          playCardTimer.current = null;
        }, 1000);

        // Store impact timer for cleanup
        const cleanup = () => {
          clearTimeout(impactTimer);
          if (playCardTimer.current) {
            clearTimeout(playCardTimer.current);
            playCardTimer.current = null;
          }
        };
        return cleanup;
      } else {
        // DEF/SKILL: Charge right only (0→500ms), SFX at arrival (~400ms)
        const impactTimer = setTimeout(() => {
          if (card.type === "DEFENSE") {
            playSfx(sfxBlock);
          } else {
            // SKILL: minor hit SFX
            playSfx(sfxHit);
            dispatch({ type: "SET_ENEMY_HIT", value: true });
          }
        }, 400);

        // Cleanup after full animation (600ms)
        playCardTimer.current = setTimeout(() => {
          dispatch({ type: "SET_ENEMY_HIT", value: false });
          dispatch({ type: "PLAY_CARD", cardId });
          setActivePlayCard(null);
          playCardTimer.current = null;
        }, 600);

        const cleanup = () => {
          clearTimeout(impactTimer);
          if (playCardTimer.current) {
            clearTimeout(playCardTimer.current);
            playCardTimer.current = null;
          }
        };
        return cleanup;
      }
    },
    [state.phase, state.hand, state.playerAp, activePlayCard, playSfx]
  );

  const handleEndTurn = useCallback(() => {
    if (state.phase !== "PLAYER_TURN") return;
    dispatch({ type: "END_PLAYER_TURN" });
  }, [state.phase]);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESTART" });
    const bgm = bgmRef.current;
    if (bgm) {
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
    }
  }, []);

  /* ═══════════════════════════════════════════
     COMPUTED VALUES
     ═══════════════════════════════════════════ */

  const finalScore = Math.max(0, state.floor * 1000 - state.totalTurnsAccumulated * 10);
  const hpPercent = (state.playerHp / state.playerMaxHp) * 100;
  const enemyHpPercent = (state.enemyHp / state.enemyMaxHp) * 100;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen flex flex-col justify-between overflow-hidden bg-[#0a0a0f] selection:bg-[#2398f7]/30 font-mono">
      {/* ══ PORTRAIT MODE BLOCKER ══ */}
      {isPortrait && (
        <div className="fixed inset-0 z-[99999] bg-black text-[#2398f7] flex flex-col items-center justify-center px-8">
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
            {">"} CRITICAL PROTOCOL REQUIREMENT: PLEASE ROTATE YOUR DEVICE TO LANDSCAPE
            MODE TO RUN SYSTEM INTERACTION.
          </p>
        </div>
      )}

      {/* ══ BACK BUTTON ══ */}
      <Link
        href="/minigame"
        className="fixed top-3 left-3 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* ══ BGM TOGGLE ══ */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_BGM" })}
        className="fixed top-3 right-3 z-[100] flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white/90 hover:text-white rounded-full text-xs font-semibold transition-colors will-change-transform transform-gpu border border-white/15"
      >
        {state.isBgmMuted ? "🔇" : "🔊"}
      </button>

      {/* ══ SCANLINE OVERLAY ══ */}
      <div
        className="fixed inset-0 z-[50] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      {/* ══ GRID BACKGROUND ══ */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(#2398f7 1px, transparent 1px), linear-gradient(90deg, #2398f7 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ════════════════════════════════════
         REGISTER OVERLAY
         ════════════════════════════════════ */}
      {state.phase === "REGISTER" && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-1 tracking-tight">
            <span className="text-[#2398f7]">AFFAN CARD</span> PROTOCOL
          </h2>
          <p className="text-white/40 text-xs mb-6">
            {">"} STRATEGY // CARD GAME // ROGUELITE
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
              className="w-full py-2.5 bg-[#2398f7] hover:bg-[#1e82d4] disabled:bg-white/10 disabled:text-white/30 text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95"
            >
              INITIALIZE PROTOCOL
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
         TUTORIAL OVERLAY
         ════════════════════════════════════ */}
      <AnimatePresence>
        {state.phase === "TUTORIAL" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full mx-4 border border-[#2398f7]/30 rounded-xl bg-[#0a0a0f]/95 p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#2398f7] rounded-full animate-pulse" />
                <h3 className="text-[#2398f7] text-xs font-bold uppercase tracking-widest">
                  NEXUS FIREWALL ARCHIVE
                </h3>
              </div>

              <p className="text-white/70 text-sm mb-4">
                WELCOME TO THE NEXUS FIREWALL ARCHIVE.
              </p>

              <div className="space-y-3 text-white/60 text-xs leading-relaxed">
                <div className="flex gap-2">
                  <Zap className="w-4 h-4 text-[#2398f7] shrink-0 mt-0.5" />
                  <p>1. Every turn, you are allocated <span className="text-[#2398f7] font-bold">3 Action Points (AP)</span>.</p>
                </div>
                <div className="flex gap-2">
                  <Sword className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p>2. Draw cards to intercept anomalies. Playing a card consumes its designated AP cost.</p>
                </div>
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>3. Read the Enemy&apos;s Intent node carefully before spending points. Balance your Attacks and Blocks.</p>
                </div>
                <div className="flex gap-2">
                  <Skull className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p>4. Surpass deep data floors to register your strategy vector to the Network High Scores.</p>
                </div>
              </div>

              <button
                onClick={handleCloseTutorial}
                className="w-full mt-6 py-3 bg-transparent border-2 border-[#2398f7] text-[#2398f7] hover:bg-[#2398f7] hover:text-white font-bold text-xs rounded-lg transition-all will-change-transform transform-gpu active:scale-95 tracking-wider"
              >
                OVERRIDE &amp; INITIALIZE CORE SIMULATION
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
         GAME OVER OVERLAY
         ════════════════════════════════════ */}
      <AnimatePresence>
        {state.phase === "GAME_OVER" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full mx-4 border border-red-500/40 rounded-xl bg-[#0a0a0f]/95 p-6 md:p-8 text-center overflow-y-auto max-h-[88dvh]"
            >
              <Skull className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-2xl font-black text-red-500 mb-1">SYSTEM FAILURE</h3>
              <p className="text-white/40 text-xs mb-6">
                {">"} Firewall breach detected. Connection terminated.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Floor</p>
                  <p className="text-[#2398f7] text-xl font-black">{state.floor}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Turns</p>
                  <p className="text-white text-xl font-black">{state.totalTurnsAccumulated}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Score</p>
                  <p className="text-emerald-400 text-xl font-black">{finalScore}</p>
                </div>
              </div>

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="mb-6 text-left">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">
                    {">"} NETWORK HIGH SCORES
                  </p>
                  <div className="space-y-1">
                    {leaderboard.map((entry, i) => (
                      <div key={`${entry.player_name}-${i}`} className="flex justify-between text-xs py-1 px-2 bg-white/5 rounded">
                        <span className="text-white/60">
                          <span className="text-[#2398f7] mr-2">{i + 1}.</span>
                          {entry.player_name}
                        </span>
                        <span className="text-emerald-400 font-bold">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleRestart}
                className="w-full py-3 bg-[#2398f7] hover:bg-[#1e82d4] text-white font-bold text-sm rounded-lg transition-colors will-change-transform transform-gpu active:scale-95"
              >
                REINITIALIZE PROTOCOL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
         MAIN GAME BOARD
         ════════════════════════════════════ */}
      {state.phase !== "REGISTER" && state.phase !== "GAME_OVER" && (
        <div className="fixed inset-0 z-[10] flex flex-col">
          {/* ── FLOOR BADGE (absolute, centered top) ── */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 lg:top-6">
            <div className="bg-zinc-950/90 border border-[#2398f7]/50 px-4 py-1 lg:px-8 lg:py-2 rounded-full shadow-[0_0_15px_rgba(35,152,247,0.2)]">
              <p className="text-sm lg:text-xl font-bold tracking-widest text-[#2398f7] uppercase">
                FLOOR {state.floor}
              </p>
            </div>
          </div>
          {/* ── TOP BAR ── */}
          <div className="flex items-center justify-between px-4 pt-8 pb-1 lg:pt-14 lg:pb-2">
            {/* Player Stats - Left */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: hpPercent > 50 ? "#22c55e" : hpPercent > 25 ? "#eab308" : "#ef4444" }}
                    animate={{ width: `${hpPercent}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                </div>
                <span className="text-white/60 text-xs">{state.playerHp}/{state.playerMaxHp}</span>
              </div>
              {state.playerBlock > 0 && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#2398f7]" />
                  <span className="text-[#2398f7] text-xs font-bold">{state.playerBlock}</span>
                </div>
              )}
            </div>

            {/* Floor indicator - Center (absolute positioned for max visibility) */}
            <div />

            {/* AP - Right */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div className="flex gap-1">
                {Array.from({ length: state.playerMaxAp }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < state.playerAp ? "bg-yellow-400" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/60 text-xs ml-1">{state.playerAp}/{state.playerMaxAp}</span>
            </div>
          </div>

          {/* ── CENTER ARENA ── */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-4">
            <div className="flex items-center gap-4 lg:gap-16 relative">
              {/* Enemy Card — with lunge animation during ENEMY_TURN */}
              <motion.div
                animate={
                  enemyLunging
                    ? { y: [0, 50, 0], scale: [1, 1.05, 1] }
                    : state.animatingEnemyHit
                    ? { x: [0, 8, -8, 4, 0], scale: [1, 0.95, 1] }
                    : { y: 0, scale: 1 }
                }
                transition={enemyLunging ? { duration: 0.5, ease: "easeInOut" } : { duration: 0.3 }}
                className="relative"
              >
                <div className={`relative w-24 h-32 lg:w-56 lg:h-80 aspect-[2/3] flex justify-center items-center rounded-xl overflow-hidden border-2 bg-[#0a0a0f] transition-colors duration-200 ${
                  enemyLunging ? "border-red-500" : "border-red-500/40"
                }`}>
                  <img
                    src={state.enemyImage}
                    alt={state.enemyName}
                    className="h-full w-full object-cover"
                  />
                  {/* Red flash overlay during lunge */}
                  <AnimatePresence>
                    {enemyLunging && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-600 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                  {/* Enemy name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                    <p className="text-white text-xs font-bold truncate">{state.enemyName}</p>
                  </div>
                  {/* HP bar */}
                  <div className="absolute top-0 left-0 right-0 p-2">
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-red-500 rounded-full"
                        animate={{ width: `${enemyHpPercent}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      />
                    </div>
                    <p className="text-white/70 text-[10px] mt-0.5 text-center">{state.enemyHp}/{state.enemyMaxHp}</p>
                  </div>
                </div>

                {/* Intent display */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold will-change-transform transform-gpu ${
                  state.enemyIntent.type === "ATTACK"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-[#2398f7]/20 text-[#2398f7] border border-[#2398f7]/30"
                }`}>
                  {state.enemyIntent.type === "ATTACK" ? (
                    <Sword className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  {state.enemyIntent.value}
                </div>
              </motion.div>

              {/* ── ACTIVE PLAY ZONE: Multi-step keyframe card animation ── */}
              <div className="relative w-20 flex items-center justify-center">
                <AnimatePresence>
                  {activePlayCard && (
                    <motion.div
                      key={`active-${activePlayCard.id}`}
                      initial={{ x: 0, y: 120, opacity: 0, scale: 0.6 }}
                      animate={
                        activePlayCard.type === "ATTACK"
                          ? {
                              x: [0, 250, -200],
                              y: [0, -150, -150],
                              scale: [1, 1.2, 1.5],
                              opacity: 1,
                            }
                          : {
                              x: [0, 250],
                              y: [0, -150],
                              scale: [1, 1.2],
                              opacity: 1,
                            }
                      }
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={
                        activePlayCard.type === "ATTACK"
                          ? { duration: 0.8, times: [0, 0.4, 0.9], ease: "easeInOut" }
                          : { duration: 0.5, ease: "easeOut" }
                      }
                      className="absolute w-20 md:w-24 rounded-lg overflow-hidden border-2 will-change-transform transform-gpu z-[30]"
                      style={{
                        borderColor:
                          activePlayCard.type === "ATTACK" ? "rgba(239,68,68,0.8)"
                          : activePlayCard.type === "DEFENSE" ? "rgba(35,152,247,0.8)"
                          : "rgba(168,85,247,0.8)",
                      }}
                    >
                      <div className="relative w-full aspect-[3/4]">
                        <Image
                          src={activePlayCard.image}
                          alt={activePlayCard.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/80">
                        <p className="text-white text-[9px] font-bold truncate text-center">{activePlayCard.name}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* VS Divider — always visible */}
                <div className="text-white/20 text-2xl font-black select-none">VS</div>
              </div>

              {/* Player Card (indicator) */}
              <motion.div
                animate={
                  state.animatingPlayerHit
                    ? { x: [0, -8, 8, -4, 0], scale: [1, 0.95, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                className="relative w-24 h-32 lg:w-56 lg:h-80 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#2398f7]/40 bg-[#0a0a0f] flex flex-col items-center justify-center"
              >
                {/* Red flash overlay when player gets hit */}
                <AnimatePresence>
                  {state.animatingPlayerHit && state.enemyIntent.type === "ATTACK" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.25 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-600 pointer-events-none z-10"
                    />
                  )}
                </AnimatePresence>
                <div className="w-16 h-16 rounded-full bg-[#2398f7]/10 border-2 border-[#2398f7]/30 flex items-center justify-center mb-2">
                  <span className="text-[#2398f7] text-lg font-black">
                    {state.playerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-white/60 text-xs font-bold">{state.playerName}</p>
                <p className="text-white/30 text-[10px] mt-1">DECK OPERATOR</p>
              </motion.div>
            </div>
          </div>

          {/* ── BOTTOM: HAND + END TURN ── */}
          <div className="mt-4 lg:mt-8 pb-0 lg:pb-4 px-4 shrink-0">
            {/* Phase status */}
            <div className="flex items-center justify-center mb-2 lg:mb-3">
              {state.phase === "DRAW" && (
                <p className="text-[#2398f7]/60 text-[8px] lg:text-xs animate-pulse">{">"} DRAWING CARDS...</p>
              )}
              {state.phase === "PLAYER_TURN" && (
                <p className="text-[#2398f7] text-[8px] lg:text-xs">{">"} YOUR TURN — Select cards or END TURN</p>
              )}
              {state.phase === "ENEMY_TURN" && (
                <p className="text-red-400 text-[8px] lg:text-xs animate-pulse">{">"} ENEMY EXECUTING INTENT...</p>
              )}
            </div>

            {/* Card Hand — SOP Rule 9: Only render cards in hand, nothing hidden */}
            <div className="w-full flex justify-center items-center gap-2">
              <AnimatePresence mode="popLayout">
                {state.hand.map((card) => {
                  const canPlay = state.phase === "PLAYER_TURN" && card.cost <= state.playerAp && !activePlayCard;
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ y: 60, opacity: 0, scale: 0.8 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -40, opacity: 0, scale: 0.8 }}
                      whileHover={canPlay ? { y: -15, scale: 1.05 } : {}}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={() => canPlay && handlePlayCard(card.id)}
                      className={`relative w-20 h-28 lg:w-36 lg:h-52 aspect-[2/3] rounded-lg overflow-hidden border-2 cursor-pointer will-change-transform transform-gpu flex-shrink-0 ${
                        canPlay
                          ? card.type === "ATTACK"
                            ? "border-red-500/50 hover:border-red-400"
                            : card.type === "DEFENSE"
                            ? "border-[#2398f7]/50 hover:border-[#2398f7]"
                            : "border-purple-500/50 hover:border-purple-400"
                          : "border-white/15 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {/* Card image */}
                      <img
                        src={card.image}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Card info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/80">
                        <p className="text-white text-[10px] font-bold truncate">{card.name}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {card.type === "ATTACK" && <Sword className="w-2.5 h-2.5 text-red-400" />}
                            {card.type === "DEFENSE" && <Shield className="w-2.5 h-2.5 text-[#2398f7]" />}
                            {card.type === "SKILL" && <Zap className="w-2.5 h-2.5 text-purple-400" />}
                            <span className="text-white/60 text-[9px]">{card.value}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <span className="text-yellow-400 text-[9px] font-bold">{card.cost}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card type ribbon */}
                      <div className={`absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] font-bold ${
                        card.type === "ATTACK"
                          ? "bg-red-500/80 text-white"
                          : card.type === "DEFENSE"
                          ? "bg-[#2398f7]/80 text-white"
                          : "bg-purple-500/80 text-white"
                      }`}>
                        {card.type === "ATTACK" ? "ATK" : card.type === "DEFENSE" ? "DEF" : "SKL"}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* End Turn Button */}
            {state.phase === "PLAYER_TURN" && (
              <div className="w-full h-[10vh] flex justify-center items-center mt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndTurn}
                  className="px-6 py-2 h-[80%] bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs lg:text-sm font-bold tracking-wider transition-colors will-change-transform transform-gpu"
                >
                  END TURN
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
