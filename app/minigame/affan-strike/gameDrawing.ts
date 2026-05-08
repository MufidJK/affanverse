import * as C from "./gameConstants";

export function drawCloud(ctx: CanvasRenderingContext2D, c: C.Cloud) {
  ctx.save(); 
  ctx.globalAlpha = c.opacity; 
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.beginPath(); 
  ctx.moveTo(c.x - c.w * 0.5, c.y);
  // Base fluffy bottom using bezier
  ctx.bezierCurveTo(c.x - c.w * 0.5, c.y + c.h * 0.3, c.x + c.w * 0.5, c.y + c.h * 0.3, c.x + c.w * 0.5, c.y);
  // Fluffy tops using bezier
  ctx.bezierCurveTo(c.x + c.w * 0.5, c.y - c.h * 0.8, c.x + c.w * 0.2, c.y - c.h * 1.2, c.x, c.y - c.h * 0.8);
  ctx.bezierCurveTo(c.x - c.w * 0.2, c.y - c.h * 1.3, c.x - c.w * 0.5, c.y - c.h * 0.6, c.x - c.w * 0.5, c.y);
  ctx.fill();
  
  // Layered overlapping circles
  ctx.beginPath();
  const rad = c.h * 0.4;
  ctx.arc(c.x, c.y - rad * 0.5, rad, 0, Math.PI * 2);
  ctx.arc(c.x - c.w * 0.25, c.y - rad * 0.2, rad * 0.8, 0, Math.PI * 2);
  ctx.arc(c.x + c.w * 0.25, c.y - rad * 0.3, rad * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCactus(ctx: CanvasRenderingContext2D, x: number, variant: number) {
  const y = C.LH - C.GROUND_H - C.CACTUS_H;
  ctx.save(); ctx.fillStyle = "#2d6a1e";
  ctx.fillRect(x + 12, y, 11, C.CACTUS_H); // Main trunk
  if (variant === 0) {
    ctx.fillRect(x, y + 14, 14, 8); ctx.fillRect(x + 1, y + 6, 7, 16);
    ctx.fillRect(x + 21, y + 20, 14, 8); ctx.fillRect(x + 27, y + 12, 7, 16);
  } else if (variant === 1) {
    ctx.fillRect(x, y + 20, 14, 8); ctx.fillRect(x + 1, y + 12, 7, 20);
  } else if (variant === 2) {
    ctx.fillRect(x + 21, y + 15, 14, 8); ctx.fillRect(x + 27, y + 5, 7, 20);
  } else {
    ctx.fillRect(x, y + 10, 14, 8); ctx.fillRect(x + 1, y + 2, 7, 16);
    ctx.fillRect(x + 21, y + 30, 14, 8); ctx.fillRect(x + 27, y + 22, 7, 16);
  }
  ctx.fillStyle = "#3d8a2e"; ctx.fillRect(x + 13, y + 1, 9, C.CACTUS_H - 2);
  ctx.restore();
}

export function drawSky(ctx: CanvasRenderingContext2D, w: number, boss: boolean) {
  const g = ctx.createLinearGradient(0, 0, 0, C.LH - C.GROUND_H);
  if (boss) {
    g.addColorStop(0, "#1a0a2e"); g.addColorStop(0.5, "#2d1045"); g.addColorStop(1, "#4a1a2e");
  } else {
    g.addColorStop(0, "#87CEEB"); g.addColorStop(0.5, "#a8d8f0"); g.addColorStop(1, "#c8e8f8");
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, C.LH - C.GROUND_H);
}

export function drawGround(ctx: CanvasRenderingContext2D, w: number, scrollX: number) {
  const gy = C.LH - C.GROUND_H;
  ctx.fillStyle = "#5a7a3a"; ctx.fillRect(0, gy, w, 4);
  ctx.fillStyle = "#8B7355"; ctx.fillRect(0, gy + 4, w, C.GROUND_H - 4);
  ctx.fillStyle = "#7a6345";
  const off = scrollX % 40;
  for (let gx = -off; gx < w + 40; gx += 40) {
    ctx.fillRect(gx, gy + 10, 20, 3); ctx.fillRect(gx + 15, gy + 22, 18, 3);
  }
}

export function makeClouds(w: number): C.Cloud[] {
  return Array.from({ length: C.CLOUD_COUNT }).map(() => ({
    x: Math.random() * w * 1.5, y: 30 + Math.random() * (C.LH * 0.35),
    w: 120 + Math.random() * 200, h: 60 + Math.random() * 80,
    speed: 12 + Math.random() * 25, opacity: 0.2 + Math.random() * 0.4,
  }));
}