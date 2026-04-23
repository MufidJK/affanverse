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

function ytCommand(iframe: HTMLIFrameElement | null, func: string, args: any[] = []) {
  try {
    iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
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
  
  // 👇 FIX 1: Tambah state isEnded biar React tau videonya kelar 👇
  const [isEnded, setIsEnded] = useState(false);
  const [interactionTime, setInteractionTime] = useState(Date.now());

  const cardIframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const videoId = getYouTubeVideoId(mediaUrl);
  if (!videoId) return null;

  const cardSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&disablekb=1&fs=0&iv_load_policy=3`;
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
    const handleMessage = (e: MessageEvent) => {
      if (e.source !== cardIframeRef.current?.contentWindow) return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info) {
          const state = data.info.playerState;
          if (state === 1) { setCardPlaying(true); setIsEnded(false); } // Playing
          if (state === 2) { setCardPlaying(false); setShowUI(true); } // Paused
          if (state === 0) { // Ended
            setCardPlaying(false);
            setShowUI(true);
            setIsEnded(true); // Tandain kelar, tapi JANGAN di-reset ke 0 di sini biar gak bentrok!
          }
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (hasStarted && cardIframeRef.current) {
      cardIframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
    }
  }, [hasStarted]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showUI) {
      const delay = cardPlaying ? 3500 : 5000; 
      timeout = setTimeout(() => setShowUI(false), delay);
    }
    return () => clearTimeout(timeout);
  }, [showUI, cardPlaying, interactionTime]);

  const handleInteraction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowUI(true);
    setInteractionTime(Date.now());
  };

  const isUIActive = !cardPlaying || showUI;

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hasStarted) {
      setHasStarted(true);
      setCardPlaying(true);
    } else {
      // 👇 FIX 2: Reset ke detik 0 HANYA saat tombol Play ditekan (1x klik fiks ngacir) 👇
      if (isEnded) {
        ytCommand(cardIframeRef.current, "seekTo", [0, true]);
        setIsEnded(false);
      }
      setCardPlaying(!cardPlaying);
    }
    handleInteraction(); 
  };

  const handleExpand = (e: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setCardPlaying(false);
    setIsModalOpen(true);
    setTimeout(() => setModalPlaying(true), 100);
  };

  return (
    <>
      <div 
        className="w-full h-full relative bg-black/5 dark:bg-zinc-800/50 overflow-hidden cursor-pointer group"
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onMouseLeave={() => { /* Biarkan timer bekerja */ }}
        onClick={() => {
          if (!hasStarted) {
            togglePlay();
          } else {
            setShowUI((prev) => !prev);
            setInteractionTime(Date.now());
          }
        }}
      >
        {!hasStarted ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover pointer-events-none z-0" />
        ) : (
          <iframe 
            ref={cardIframeRef} 
            src={cardSrc} 
            title={title} 
            allow="autoplay; encrypted-media" 
            className="absolute inset-0 w-full h-full border-0 pointer-events-none object-cover scale-[1.35] z-0" 
          />
        )}
        
        <div className="absolute inset-0 z-[5] bg-transparent pointer-events-auto" />

        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none z-10 ${isUIActive ? 'bg-black/50' : 'bg-transparent'}`} />

        <div className={`absolute top-0 left-0 w-full p-3 flex justify-end gap-2 z-20 transition-opacity duration-500 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={handleExpand} className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white outline-none shadow-lg">
            <Expand className="w-5 h-5" />
          </button>
          {hasStarted && (
            <button onClick={(e) => { e.stopPropagation(); setCardMuted(!cardMuted); handleInteraction(); }} className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white outline-none shadow-lg">
              {cardMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none z-20">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isUIActive ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={togglePlay} 
              className="pointer-events-auto relative z-10 w-14 h-14 md:w-16 md:h-16 bg-[#2398f7] hover:bg-[#1a7cd4] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(35,152,247,0.4)] active:scale-95 outline-none transition-transform"
            >
              {cardPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7" /> : <Play className="w-6 h-6 md:w-7 md:h-7 ml-1" />}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setModalPlaying(false); setIsModalOpen(false); } }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none flex justify-center items-center sm:max-w-4xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
            {isModalOpen && <iframe ref={modalIframeRef} src={modalSrc} title="expanded" allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="w-full h-full border-0" />}
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
  const [interactionTime, setInteractionTime] = useState(Date.now());
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
    if (showUI) {
      const delay = isPlaying ? 3500 : 5000;
      timeout = setTimeout(() => setShowUI(false), delay);
    }
    return () => clearTimeout(timeout);
  }, [showUI, isPlaying, interactionTime]);

  const handleInteraction = (e?: React.MouseEvent | Event) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setShowUI(true);
    setInteractionTime(Date.now());
  };

  const isUIActive = !isPlaying || showUI;

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    
    // 👇 FIX 3: Reset Native MP4 ke nol HANYA saat user mencet Play 👇
    if (videoRef.current && videoRef.current.ended) {
      videoRef.current.currentTime = 0;
    }
    
    setIsPlaying(!isPlaying);
    handleInteraction();
  };

  return (
    <div 
      className="w-full h-full relative bg-black/5 dark:bg-zinc-800/50 overflow-hidden cursor-pointer"
      onMouseEnter={handleInteraction}
      onMouseMove={handleInteraction}
      onMouseLeave={() => { /* Dibiarkan kosong */ }}
      onClick={() => {
        setShowUI((prev) => !prev);
        setInteractionTime(Date.now());
      }}
    >
      <video
        ref={videoRef}
        src={url}
        muted={isMuted}
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => { setIsPlaying(false); handleInteraction(); }}
        // JANGAN RESET currentTime DI SINI BIAR STATE GAK BENTROK
        onEnded={() => {
          setIsPlaying(false);
          setShowUI(true);
        }}
        onLoadedMetadata={(e) => {
          const { videoWidth, videoHeight } = e.currentTarget;
          if (videoWidth > videoHeight) setFitClass("object-contain");
        }}
        className={`absolute inset-0 z-0 w-full h-full transition-all duration-500 pointer-events-none ${fitClass}`}
        style={{ WebkitMediaControls: "none" } as any}
      />

      <div className="absolute inset-0 z-[5] bg-transparent pointer-events-auto" />

      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none z-10 ${isUIActive ? 'bg-black/50' : 'bg-transparent'}`} />
      
      <div className={`absolute top-0 left-0 w-full p-3 flex justify-end gap-2 z-20 transition-opacity duration-500 ${isUIActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); handleInteraction(); }} className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white outline-none shadow-lg">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none z-20">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isUIActive ? 'opacity-100' : 'opacity-0'}`}>
          {isBuffering && (
            <div className="absolute w-full h-full border-4 border-white/30 border-t-[#2398f7] rounded-full animate-spin pointer-events-none" />
          )}
          <button
            onClick={togglePlay}
            className="pointer-events-auto relative z-10 w-14 h-14 md:w-16 md:h-16 bg-[#2398f7] hover:bg-[#1a7cd4] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(35,152,247,0.4)] active:scale-95 outline-none transition-transform"
          >
            {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7" /> : <Play className="w-6 h-6 md:w-7 md:h-7 ml-1" />}
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