'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Activity } from 'lucide-react'

interface SoundscapeProps {
  isOpen: boolean;
  onClose: () => void;
  songTitle?: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const phi = (1 + Math.sqrt(5)) / 2;
const vertices = [
  [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
  [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
  [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
];
const edges = [
  [0, 1], [0, 5], [0, 11], [0, 7], [0, 10], [1, 5], [1, 9], [1, 8], [1, 7],
  [2, 3], [2, 4], [2, 11], [2, 10], [2, 6], [3, 4], [3, 9], [3, 8], [3, 6],
  [4, 5], [4, 11], [4, 9], [5, 11], [5, 9], [6, 7], [6, 10], [6, 8], [7, 10],
  [7, 8], [8, 9], [10, 11]
];

export default function SoundscapeOverlay({ isOpen, onClose, songTitle = "Unknown Audio", audioRef }: SoundscapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  
  const rotationRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  
  const coreHslHueRef = useRef(0);
  const smoothedBassRef = useRef(0); // <--- KUNCI SMOOTHING FISIKA BOLA

  useEffect(() => {
    if (!isOpen || !audioRef.current || !canvasRef.current) return;

    // ── KEY FIX: aborted flag breaks the rAF loop immediately on cleanup ──
    // Without this, the draw() closure can outlive the component via stale refs
    let aborted = false;

    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimasi performa canvas
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let audioCtx = (window as any).audioCtx;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      (window as any).audioCtx = audioCtx;
    }

    // ── FIX: Guard against duplicate MediaElementSource creation ──
    // createMediaElementSource() throws if the element already has a source.
    // We cache both the analyser AND the source on the audio element.
    let analyser = (audio as any).__analyser;
    if (!analyser) {
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; 
      analyser.smoothingTimeConstant = 0.88; // <--- KUNCI SMOOTHING DATA AUDIO (0.88 is very smooth)
      try {
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        (audio as any).__analyser = analyser;
        (audio as any).__source = source;
      } catch (e) {
        // Already connected — reuse existing analyser if available
        analyser = (audio as any).__analyser || analyser;
        console.warn("Audio node already connected.", e);
      }
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    setIsAudioReady(true);

    const draw = () => {
      if (aborted) return; // ── KEY FIX: stop loop on cleanup ──
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Hitung Bass Mentah
      let bassSum = 0;
      for (let i = 0; i < 8; i++) bassSum += dataArray[i];
      const rawBassAvg = bassSum / 8;

      // Lerp (Linear Interpolation) biar pergerakan bola membesar/mengecil licin banget
      smoothedBassRef.current += (rawBassAvg - smoothedBassRef.current) * 0.15;
      const coreBaseScale = 120 + (smoothedBassRef.current * 0.7); 

      // Puteran Warna RGB
      coreHslHueRef.current = (coreHslHueRef.current + 0.5 + (smoothedBassRef.current * 0.01)) % 360; 
      const bgHue = (coreHslHueRef.current + 180) % 360; 
      const polyColor = `hsl(${coreHslHueRef.current}, 100%, 65%)`; // Warna bola RGB terang

      // 1. FRAME CLEARING (Motion Blur) - GAK ADA LAGI TIMPAAN HITAM SOLID!
      ctx.fillStyle = 'rgba(5, 5, 8, 0.25)'; // Alpha 0.25 bikin ekor motion blur yang pas
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. BACKGROUND RGB GAMING (Nge-blast ngikutin beat)
      // Intensitas nyala background berdasarkan seberapa nendang bass-nya
      const bgBlastIntensity = (smoothedBassRef.current / 255) * 0.6; 
      
      const bgGradient = ctx.createRadialGradient(
        centerX, centerY, coreBaseScale * 0.5, 
        centerX, centerY, Math.max(canvas.width, canvas.height) * 0.8
      );
      
      // Tengahnya nyala terang, pinggirnya pelan-pelan pudar ke hitam
      bgGradient.addColorStop(0, `hsla(${bgHue}, 100%, 50%, ${0.1 + bgBlastIntensity})`); 
      bgGradient.addColorStop(0.5, `hsla(${bgHue}, 100%, 20%, ${bgBlastIntensity * 0.5})`);
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); 

      // Gabungin layer blend mode biar warna background nyala neon (Additive blending)
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over'; // Balikin blend mode ke normal buat gambar bola

      // 3. OBJEK 3D INTERAKTIF
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.003;
        rotationRef.current.x += 0.002;
        rotationRef.current.y += rotationVelocityRef.current.y;
        rotationRef.current.x += rotationVelocityRef.current.x;
        rotationVelocityRef.current.y *= 0.95; // Gesekan momentum mulus
        rotationVelocityRef.current.x *= 0.95;
      }

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      const projectedVertices = vertices.map(vertex => {
        let [x, y, z] = vertex;
        let nx = x * cosY - z * sinY;
        let nz = x * sinY + z * cosY;
        let ny = y * cosX - nz * sinX;
        nz = y * sinX + nz * cosX;

        const factor = coreBaseScale / (nz + 4); 
        return [centerX + nx * factor, centerY + ny * factor];
      });

      // Render Garis Bola dengan efek Glow ekstrim
      ctx.shadowBlur = 30 + (smoothedBassRef.current * 0.2); // Glow juga ikut berdenyut
      ctx.shadowColor = polyColor;
      ctx.lineWidth = 3 + (smoothedBassRef.current * 0.01);
      ctx.lineCap = 'round';
      ctx.strokeStyle = polyColor;

      ctx.beginPath();
      edges.forEach(edge => {
        const [startIdx, endIdx] = edge;
        const [xStart, yStart] = projectedVertices[startIdx];
        const [xEnd, yEnd] = projectedVertices[endIdx];
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
      });
      ctx.stroke();

      ctx.shadowBlur = 0; // Reset glow
    };

    // --- INTERAKSI MOUSE ---
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      rotationVelocityRef.current = { x: 0, y: 0 }; 
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      rotationVelocityRef.current = { x: dy * 0.003, y: dx * 0.003 };
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDraggingRef.current = false; };

    // --- INTERAKSI TOUCH (MOBILE) ---
    const handleTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      rotationVelocityRef.current = { x: 0, y: 0 };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      rotationVelocityRef.current = { x: dy * 0.003, y: dx * 0.003 };
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = () => { isDraggingRef.current = false; };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    draw(); 

    return () => {
      aborted = true; // ── KEY FIX: signal the rAF loop to stop immediately ──
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      // ── FIX: Release the full pixel buffer by zeroing canvas dimensions ──
      // clearRect alone doesn't free the bitmap; setting width/height to 0 does.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;

      // ── FIX: Reset audio ready state so loading UI shows on re-open ──
      setIsAudioReady(false);
    };
  }, [isOpen, audioRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500 overflow-hidden">
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      <div className="absolute top-8 left-8 right-24 z-10 flex flex-col pointer-events-none">
        <div className="flex items-center gap-2 text-white/50 font-mono text-xs md:text-sm tracking-[0.2em] uppercase mb-1">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Reactive System Active</span>
        </div>
        <h2 className="text-2xl md:text-4xl text-white font-black tracking-tight line-clamp-1 capitalize drop-shadow-lg">
          {songTitle}
        </h2>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-20 p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 hover:border-white/50 text-white transition-all backdrop-blur-md group"
      >
        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {!isAudioReady && (
        <div className="absolute bottom-12 text-white/50 text-sm font-mono animate-pulse">
          Memuat koneksi frekuensi audio...
        </div>
      )}
    </div>
  )
}