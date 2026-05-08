/* ═══════════════════════════════════════════════
   AFFAN STRIKE — Types & Constants
   ═══════════════════════════════════════════════ */

export interface Cloud { x: number; y: number; w: number; h: number; speed: number; opacity: number }
export interface Fireball { x: number; y: number; dir: 1 | -1 }
export interface Obstacle { x: number; y: number; type: "cactus" | "air"; w: number; h: number; hit?: boolean; variant: number }
export interface BossProjectile { x: number; y: number; vx: number }
export interface RoadRoller { x: number; y: number; vx: number; vy: number; landed: boolean; timer: number }
export interface ScoreEntry { player_name: string; score: number }

export type GamePhase = "register" | "ready" | "runner" | "boss_intro" | "boss_fight" | "gameover" | "victory";

export const LH = 600;
export let LW = 900;
export function setLW(v: number) { LW = v; }

export const GRAVITY = 1400;
export const JUMP_VEL = -580;
export const MAX_FALL = 600;
export const GROUND_H = 60;

export const PW = 90;
export const PH = 140;
export const PLAYER_START_X = 80;
export const MOVE_SPEED = 350;
export const P_MAX_HP = 150;

export const SCROLL_SPEED = 250;
export const OBS_MIN_T = 1.2;
export const OBS_MAX_T = 2.5;
export const CACTUS_W = 35;
export const CACTUS_H = 55;
export const AIR_W = 120;
export const AIR_H = 100;
export const AIR_DMG = 10;
export const SCORE_RATE = 2;

export const FB_SPEED = 600;
export const FB_W = 32;
export const FB_H = 20;
export const FB_DMG = 10;
export const FB_CD = 0.3;

export const ULTI_FRAMES = 8;
export const ULTI_FD = 0.08;
export const ULTI_DMG = 50;
export const ULTI_CD = 8;

export const BOSS_HP = 5000;
export const BOSS_THRESHOLD = 100;
export const DIO_COLS = 11;
export const DIO_ROWS = 8;
export const DIO_TOTAL = 88;
export const DIO_FPS = 15;
export const BOSS_ATK_INT = 3;
export const BOSS_PUNCH_DMG = 15;
export const RR_DMG = 30;

export const CLOUD_COUNT = 8;
export const LS_NAME = "flappy_affan_player_name";
export const LS_HIGH = "affan_strike_high_score";

export const ASSET_PATH = "/minigame/affan-strike/";