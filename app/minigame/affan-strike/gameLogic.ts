import * as C from "./gameConstants";

export interface GameState {
  phase: C.GamePhase;
  playerX: number; playerY: number; velY: number; hp: number;
  moveLeft: boolean; moveRight: boolean;
  jumping: boolean; crouching: boolean;
  walkFrame: number; walkTimer: number; invTimer: number;
  fireballs: C.Fireball[]; fbCd: number;
  ultiActive: boolean; ultiFrame: number; ultiTimer: number; ultiCd: number;
  scrollX: number; score: number; scoreAcc: number;
  obstacles: C.Obstacle[]; obsTimer: number; nextObsDelay: number;
  clouds: C.Cloud[];
  bossHP: number; bossFrame: number; bossFTimer: number;
  bossAtkTimer: number; bossAtking: boolean;
  bossProj: C.BossProjectile[]; rr: C.RoadRoller | null;
  bossIntroT: number; rrUsed50: boolean; rrUsed20: boolean;
  dioBgm: boolean; lastTime: number; groundY: number;
  bossX: number; bossY: number; subtitle: string; speaker: "dio" | "affan" | "none"; bossFightT: number; rrCooldown: number;
  playedKonoDio: boolean; playedHoMukatte: boolean; playedSugiwa: boolean; playedJotaroSaying: boolean; playedZaWarudo: boolean; playedWryyyy: boolean;
  welcomeTimer: number;
}

export function createState(): GameState {
  const initClouds = Array.from({ length: C.CLOUD_COUNT }).map(() => ({
    x: Math.random() * C.LW * 1.5, y: 30 + Math.random() * (C.LH * 0.35),
    w: 120 + Math.random() * 200, h: 60 + Math.random() * 80,
    speed: 12 + Math.random() * 25, opacity: 0.2 + Math.random() * 0.4,
  }));
  return {
    phase: "register", playerX: C.PLAYER_START_X, playerY: 0, velY: 0, hp: C.P_MAX_HP,
    moveLeft: false, moveRight: false, jumping: false, crouching: false,
    walkFrame: 0, walkTimer: 0, invTimer: 0, fireballs: [], fbCd: 0,
    ultiActive: false, ultiFrame: 0, ultiTimer: 0, ultiCd: 0, scrollX: 0, score: 0, scoreAcc: 0,
    obstacles: [], obsTimer: 0, nextObsDelay: 2, clouds: initClouds,
    bossHP: C.BOSS_HP, bossFrame: 0, bossFTimer: 0, bossAtkTimer: 0, bossAtking: false,
    bossProj: [], rr: null, bossIntroT: 0, rrUsed50: false, rrUsed20: false, dioBgm: false,
    lastTime: 0, groundY: C.LH - C.GROUND_H,
    bossX: C.LW - 200, bossY: C.LH - C.GROUND_H - 180, subtitle: "", speaker: "none", bossFightT: 0, rrCooldown: 20,
    playedKonoDio: false, playedHoMukatte: false, playedSugiwa: false, playedJotaroSaying: false, playedZaWarudo: false, playedWryyyy: false,
    welcomeTimer: 0,
  };
}

export function resetState(s: GameState) {
  const newS = createState();
  Object.assign(s, newS, { phase: "ready", clouds: s.clouds && s.clouds.length > 0 ? s.clouds : newS.clouds });
  s.playerY = s.groundY - C.PH;
}

function rnd(min: number, max: number) { return min + Math.random() * (max - min); }
function aabb(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function updateBossIntro(s: GameState, dt: number): void {
  s.bossIntroT += dt;
  const t = s.bossIntroT;

  if (t < 3.0) {
    const progress = t / 3.0;
    s.bossX = C.LW - 200;
    s.bossY = -100 + (s.groundY - 180 - (-100)) * progress;
  } else {
    s.bossX = C.LW - 200;
    s.bossY = s.groundY - 180;
  }

  s.speaker = "dio";
  if (t < 2.5) s.subtitle = "Kono Dio Da!";
  else if (t < 4.0) s.subtitle = "I Will Fight With You Affan";
  else if (t < 5.5) s.subtitle = "I Will Beat You";
  else if (t < 7.0) s.subtitle = "So Now, I Will Use My Stand to kill you";
  else if (t < 9.5) s.subtitle = "Get Ready, Affan The Apex Predator";
  else if (t < 11.5) { s.subtitle = "Let's fight, Dio"; s.speaker = "affan"; }
  else if (t < 13.0) s.subtitle = "ZA WARUDO!";
  else if (t < 14.5) s.subtitle = "WRYYYYYY!!";
  else { s.subtitle = ""; s.speaker = "none"; }
}

export function updateRunner(s: GameState, dt: number): "hit_cactus" | "hit_air" | "boss" | null {
  s.scrollX += C.SCROLL_SPEED * dt; s.scoreAcc += C.SCORE_RATE * dt;
  if (s.scoreAcc >= 1) { s.score += Math.floor(s.scoreAcc); s.scoreAcc %= 1; }
  if (s.score >= C.BOSS_THRESHOLD) return "boss";

  s.walkTimer += dt; if (s.walkTimer > 0.25) { s.walkTimer = 0; s.walkFrame = 1 - s.walkFrame; }

  if (s.jumping) {
    s.velY = Math.min(s.velY + C.GRAVITY * dt, C.MAX_FALL); s.playerY += s.velY * dt;
    if (s.playerY >= s.groundY - C.PH) { s.playerY = s.groundY - C.PH; s.velY = 0; s.jumping = false; }
  }

  s.obsTimer += dt;
  if (s.obsTimer >= s.nextObsDelay) {
    s.obsTimer = 0; s.nextObsDelay = rnd(C.OBS_MIN_T, C.OBS_MAX_T);
    if (Math.random() < 0.55) {
      s.obstacles.push({ x: C.LW + 10, y: s.groundY - C.CACTUS_H, type: "cactus", w: C.CACTUS_W, h: C.CACTUS_H, variant: Math.floor(Math.random() * 4) });
    } else {
      s.obstacles.push({ x: C.LW + 10, y: rnd(s.groundY - C.PH - 30, s.groundY - C.PH + 20), type: "air", w: C.AIR_W, h: C.AIR_H, variant: 0 });
    }
  }

  const ph = s.crouching ? C.PH * 0.5 : C.PH;
  const py = s.crouching ? s.groundY - ph : s.playerY;
  s.invTimer = Math.max(0, s.invTimer - dt);
  let result: "hit_cactus" | "hit_air" | null = null;

  for (const o of s.obstacles) {
    o.x -= C.SCROLL_SPEED * dt;
    if (!o.hit && aabb(s.playerX + 5, py + 5, C.PW - 10, ph - 10, o.x, o.y, o.w, o.h)) {
      if (o.type === "cactus") { result = "hit_cactus"; break; }
      if (s.invTimer <= 0) { o.hit = true; result = "hit_air"; s.hp -= C.AIR_DMG; s.invTimer = 0.5; }
    }
  }
  s.obstacles = s.obstacles.filter(o => o.x + o.w > -20 && (!o.hit || o.type !== "air"));

  for (const fb of s.fireballs) {
    fb.x += C.FB_SPEED * dt * fb.dir;
    for (const o of s.obstacles) {
      if (o.type === "air" && !o.hit && aabb(fb.x, fb.y, C.FB_W, C.FB_H, o.x, o.y, o.w, o.h)) {
        o.hit = true; fb.x = C.LW + 100;
      }
    }
  }
  s.fireballs = s.fireballs.filter(f => f.x < C.LW + 50 && f.x > -50);
  s.fbCd = Math.max(0, s.fbCd - dt); s.ultiCd = Math.max(0, s.ultiCd - dt);

  if (s.ultiActive) {
    s.ultiTimer += dt;
    if (s.ultiTimer >= C.ULTI_FD) {
      s.ultiTimer = 0; s.ultiFrame++;
      if (s.ultiFrame >= C.ULTI_FRAMES) { s.ultiActive = false; s.ultiFrame = 0; }
    }
    s.obstacles = [];
  }
  return result;
}

export function updateBoss(s: GameState, dt: number): string[] {
  const events: string[] = [];
  s.fbCd = Math.max(0, s.fbCd - dt); s.ultiCd = Math.max(0, s.ultiCd - dt); s.invTimer = Math.max(0, s.invTimer - dt);

  s.bossFightT += dt;

  if (s.moveLeft || s.moveRight) {
    s.walkTimer += dt;
    if (s.walkTimer > 0.15) { s.walkTimer = 0; s.walkFrame = 1 - s.walkFrame; }
  } else {
    s.walkFrame = 0;
  }

  // JUMP SPEED BOOST
  const speedMult = s.jumping ? 1.7 : 1.0;
  if (s.moveLeft) s.playerX -= C.MOVE_SPEED * speedMult * dt;
  if (s.moveRight) s.playerX += C.MOVE_SPEED * speedMult * dt;
  
  // FIX BOUNDARY: Affan mentok sampe ujung kanan layar (C.LW - C.PW)
  s.playerX = Math.max(10, Math.min(s.playerX, C.LW - C.PW));

  if (s.jumping) {
    s.velY = Math.min(s.velY + C.GRAVITY * dt, C.MAX_FALL); s.playerY += s.velY * dt;
    if (s.playerY >= s.groundY - C.PH) { s.playerY = s.groundY - C.PH; s.velY = 0; s.jumping = false; }
  }

  s.bossY = s.groundY - 180;
  
  // FIX: Dio ngejar Affan pas lagi animasi nyerang
  if (s.bossAtking) {
    const dist = s.bossX - s.playerX;
    if (dist > 0) s.bossX -= 150 * dt;
    else s.bossX += 150 * dt;
    s.bossX = Math.max(10, Math.min(s.bossX, C.LW - 100));
  }

  const ph = s.crouching ? C.PH * 0.5 : C.PH;
  const py = s.crouching ? s.groundY - ph : s.playerY;

  // Knockback & Collision (Affan vs Dio)
  const hitBoss = (s.playerX < s.bossX + 120 && s.playerX + C.PW > s.bossX &&
                   py < s.bossY + 180 && py + ph > s.bossY);
  
  if (hitBoss && s.invTimer <= 0 && (py + ph > s.bossY + 40)) {
    s.hp -= 10;
    s.invTimer = 1.0;
    s.playerX += (s.playerX < s.bossX ? -150 : 150);
    s.playerX = Math.max(10, Math.min(s.playerX, C.LW - C.PW));
    if (s.hp <= 0) {
      events.push("player_dead");
    }
  }

  s.bossFTimer += dt;
  if (s.bossFTimer >= 1 / C.DIO_FPS) {
    s.bossFTimer = 0;
    if (s.bossAtking) {
      s.bossFrame++;
      if (s.bossFrame >= C.DIO_TOTAL) { s.bossFrame = 0; s.bossAtking = false; events.push("boss_atk_end"); }
    }
  }

  // FIX: Gak ada delay 4 detik. Dio langsung spam serangan.
  s.bossAtkTimer += dt;
  if (s.bossAtkTimer >= C.BOSS_ATK_INT && !s.bossAtking) {
    s.bossAtkTimer = 0; s.bossAtking = true; s.bossFrame = 0;
    events.push("boss_atk_start");
    s.bossProj.push({ x: s.bossX, y: rnd(s.groundY - C.PH - 20, s.groundY - 30), vx: s.bossX > s.playerX ? -400 : 400 });
  }

  // Ultimate Dio (Road Roller) - Tiap 20 Detik
  s.rrCooldown -= dt;
  if (s.rrCooldown <= 0 && !s.rr) {
    s.rrCooldown = 20;
    const vy = -400;
    const vx = s.bossX > s.playerX ? -700 : 700;
    s.rr = { x: s.bossX, y: s.bossY, vx, vy, landed: false, timer: 0 };
    events.push("road_roller_throw");
  }

  if (s.rr && !s.rr.landed) {
    s.rr.vy += C.GRAVITY * dt; s.rr.x += s.rr.vx * dt; s.rr.y += s.rr.vy * dt;
    if (s.rr.y >= s.groundY - 120) { s.rr.y = s.groundY - 120; s.rr.landed = true; s.rr.timer = 0; events.push("road_roller_land"); }
    if (aabb(s.playerX, py, C.PW, ph, s.rr.x, s.rr.y, 240, 120) && s.invTimer <= 0) {
      s.hp -= C.RR_DMG; s.invTimer = 1; if (s.hp <= 0) events.push("rr_hit");
    }
  }
  if (s.rr?.landed) { s.rr.timer += dt; if (s.rr.timer > 2) s.rr = null; }

  let punchHit = false;
  for (const p of s.bossProj) {
    p.x += p.vx * dt;
    if (aabb(s.playerX + 5, py + 5, C.PW - 10, ph - 10, p.x, p.y, 25, 25) && s.invTimer <= 0) {
      s.hp -= C.BOSS_PUNCH_DMG; s.invTimer = 0.5; p.x = -100; punchHit = true;
    }
  }
  // FIX: Proyektil nyasar langsung dihapus biar memory gak jebol
  s.bossProj = s.bossProj.filter(p => p.x > -50 && p.x < C.LW + 50);
  
  for (const fb of s.fireballs) {
    fb.x += C.FB_SPEED * dt * fb.dir;
    if (aabb(fb.x, fb.y, C.FB_W, C.FB_H, s.bossX, s.bossY, 120, 180)) { s.bossHP -= C.FB_DMG; fb.x = C.LW + 100; }
  }
  s.fireballs = s.fireballs.filter(f => f.x < C.LW + 50 && f.x > -50);

  if (s.ultiActive) {
    s.ultiTimer += dt;
    if (s.ultiTimer >= C.ULTI_FD) {
      s.ultiTimer = 0; s.ultiFrame++;
      if (s.ultiFrame >= C.ULTI_FRAMES) { s.ultiActive = false; s.ultiFrame = 0; }
    }
    if (s.ultiFrame === 1) s.bossHP -= C.ULTI_DMG;
  }

  if (s.hp <= 0) events.push("player_dead");
  if (s.bossHP <= 0) events.push("boss_dead");
  if (punchHit) events.push("punch_hit");
  return events;
}