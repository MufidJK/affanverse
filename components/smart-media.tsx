"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Expand, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Helper buat deteksi tipe link
function getMediaType(url: string, typeHint?: string | null): "video" | "youtube" | "image" {
  if (typeHint === "video" || typeHint === "youtube") {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    return "video";
  }
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.match(/\.(mp4|webm|mov|ogg)$/i)) return "video";
  return "image";
}

function getYouTubeVideoId(url: string): string | null {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

function ytCommand(iframe: HTMLIFrameElement | null, func: string) {
  try {
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");
  } catch {}
}

// ─── 1. YOUTUBE CARD ────────────────────────────────────────────────
function ClientVideoCard({ mediaUrl, title }: { mediaUrl: string; title: string }) {
  const [hasStarted, setHasStarted] = useState(false); 
  const [cardPlaying, setCardPlaying] = useState(false);
  const [cardMuted, setCardMuted] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(false);
  const [showUI, setShowUI] = useState(false);

  const cardIframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const videoId = getYouTubeVideoId(mediaUrl);
  if (!videoId) return null;

  const cardSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&disablekb=1&playlist=${videoId}`;
  const modalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  useEffect(() => {
    if (hasStarted && cardIframeRef.current) {
      ytCommand(cardIframeRef.current, cardPlaying ? "playVideo" : "pauseVideo");
    }
  }, [cardPlaying, hasStarted]);

  useEffect(() => {
    if (hasStarted && cardIframeRef.current) {
      ytCommand(cardIframeRef.current, cardMuted ? "mute" : "unMute");
    }
  }, [cardMuted, hasStarted]);

  useEffect(() => {
    if (modalPlaying) {
      ytCommand(modalIframeRef.current, "playVideo");
      ytCommand(modalIframeRef.current, "unMute");
    } else {
      ytCommand(modalIframeRef.current, "pauseVideo");
    }
  }, [modalPlaying]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showUI && cardPlaying) {
      timeout = setTimeout(() => setShowUI(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [showUI, cardPlaying]);

  const handleInteraction = () => setShowUI(true);
  const isUIActive = !cardPlaying || showUI;

  // 👇 FIX: Logika Play/Pause langsung instan ilang/muncul
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Biar gak "bocor" ke background

    const willPlay = !cardPlaying;
    
    if (!hasStarted) {
      setHasStarted(true);
      setCardPlaying(true);
      setShowUI(false); // Play pertama kali -> instan hilang
    } else {
      setCardPlaying(willPlay);
      setShowUI(!willPlay); // Play -> hilang (false), Pause -> muncul (true)
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCardPlaying(false);
    setIsModalOpen(true);
    setTimeout(() => setModalPlaying(true), 100);
  };

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) {
      setModalPlaying(false);
      setIsModalOpen(false);
    }
  }, []);

  return (
    <>
      <div 
        className="w-full h-full relative bg-black/5 dark:bg-zinc-800/50 overflow-hidden cursor-pointer"
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onMouseLeave={() => setShowUI(false)}
        onClick={() => {
          // Klik dimana aja di background = toggle UI
          if (!hasStarted) {
            setHasStarted(true);
            setCardPlaying(true);
            setShowUI(false);
          } else {
            setShowUI(!showUI);
          }
        }}
      >
        {!hasStarted ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <iframe ref={cardIframeRef} src={cardSrc} title={title} allow="autoplay; encrypted-media" className="absolute inset-0 w-full h-full border-0 pointer-events-none object-cover scale-[1.5]" />
        )}
        
        {/* Overlay Gelap */}
        <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none z-10 ${isUIActive ? 'bg-black/40' : 'bg-transparent'}`} />

        {/* Top Menu */}
        <div className={`absolute top-0 left-0 w-full p-2 flex justify-end gap-2 z-20 transition-opacity duration-300 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={handleExpand} className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white outline-none">
            <Expand className="w-4 h-4" />
          </button>
          {hasStarted && (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCardMuted(!cardMuted); setShowUI(true); }} className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white outline-none">
              {cardMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Center UI GRID Anti-Geser */}
        <div className="absolute inset-0 grid place-items-center z-20 pointer-events-none">
          <div className={`relative grid place-items-center w-16 h-16 transition-opacity duration-300 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <button 
              onClick={handleTogglePlay} 
              className="relative z-10 w-12 h-12 bg-[#2398f7]/90 hover:bg-[#2398f7] text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 shadow-lg outline-none"
            >
              {cardPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none flex justify-center items-center sm:max-w-4xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">Expanded view of {title}</DialogDescription>
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
            {isModalOpen && <iframe ref={modalIframeRef} src={modalSrc} title={`${title} — expanded`} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="w-full h-full border-0" />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── 2. NATIVE VIDEO CARD (MP4/WebM) ────────────────────────────────
function NativeVideoCard({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false); 
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [fitClass, setFitClass] = useState("object-cover"); 
  const [showUI, setShowUI] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) playPromise.catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showUI && isPlaying) {
      timeout = setTimeout(() => setShowUI(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [showUI, isPlaying]);

  const handleInteraction = () => setShowUI(true);
  const isUIActive = !isPlaying || showUI; // UI selalu ada kalo lagi pause

  // 👇 FIX: Tombol Play Native juga sama logic-nya
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Kunci rapat biar gak tembus ke wrapper

    const willPlay = !isPlaying;
    setIsPlaying(willPlay);
    setShowUI(!willPlay); // Kalo play -> ilang instan. Kalo pause -> muncul lagi.
  };

  return (
    <div 
      className="w-full h-full relative bg-black/5 dark:bg-zinc-800/50 overflow-hidden cursor-pointer"
      onMouseEnter={handleInteraction}
      onMouseMove={handleInteraction}
      onMouseLeave={() => setShowUI(false)}
      onClick={() => {
        // Klik area kosong (background) buat mancing menu
        setShowUI(!showUI);
      }}
    >
      <video
        ref={videoRef}
        src={url}
        loop 
        muted={isMuted}
        playsInline
        preload="metadata"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onLoadedMetadata={(e) => {
          const { videoWidth, videoHeight } = e.currentTarget;
          if (videoWidth > videoHeight) {
            setFitClass("object-contain");
          }
        }}
        className={`w-full h-full transition-all duration-500 pointer-events-none ${fitClass}`}
      />

      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none z-10 ${isUIActive ? 'bg-black/40' : 'bg-transparent'}`} />
      
      <div className={`absolute top-0 left-0 w-full p-2 flex justify-end gap-2 z-20 transition-opacity duration-300 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); setShowUI(true); }} className="p-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white outline-none">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="absolute inset-0 grid place-items-center z-20 pointer-events-none">
        <div className={`relative grid place-items-center w-16 h-16 transition-opacity duration-300 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          
          {isBuffering && (
            <div className="absolute w-full h-full border-4 border-white/30 border-t-[#2398f7] rounded-full animate-spin pointer-events-none" />
          )}
          
          <button
            onClick={handleTogglePlay}
            className="relative z-10 w-12 h-12 bg-[#2398f7]/90 hover:bg-[#2398f7] text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 shadow-lg outline-none"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 3. MAIN EXPORT ROUTER ──────────────────────────────────────────
export default function SmartMedia({ src, type, alt }: { src: string, type?: string | null, alt: string }) {
  const mediaType = getMediaType(src, type);
  const [fitClass, setFitClass] = useState("object-cover");

  if (mediaType === "youtube") {
    return <ClientVideoCard mediaUrl={src} title={alt} />;
  }
  
  if (mediaType === "video") {
    return <NativeVideoCard url={src} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={(e) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth > naturalHeight) {
          setFitClass("object-contain");
        }
      }}
      className={`w-full h-full transition-all duration-500 ${fitClass}`}
    />
  );
}