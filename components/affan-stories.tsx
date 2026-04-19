"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Volume2, VolumeX, Expand, Play, Pause } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─── Mock Data ───────────────────────────────────────────────────────
const MOCK_STORIES = [
  {
    id: 1,
    title: "Ngoding sampe subuh, worth it sih",
    description:
      "Kadang lo butuh jam 2 pagi buat dapetin logic yang bener. Kopi dingin, playlist lo-fi, dan keyboard mechanical — resep sempurna buat deep work session.",
    media_url: "/story-code.png",
    type: "image",
    tags: ["Dev Life", "Coding", "Night Owl"],
  },
  {
    id: 2,
    title: "Setup desk minimalis, anti ribet",
    description:
      "Less is more. Desk clean, pikiran clean. Cuma butuh laptop, notes, sama secangkir kopi buat mulai hari yang produktif.",
    media_url: "/story-desk.png",
    type: "image",
    tags: ["Workspace", "Minimal", "Productivity"],
  },
  {
    id: 3,
    title: "Golden hour di rooftop, healing dulu",
    description:
      "Setelah sprint deadline 2 minggu, butuh recharge. Naik ke rooftop, nikmatin sunset, dan biarin pikiran kosong sebentar.",
    media_url: "/story-rooftop.png",
    type: "image",
    tags: ["Healing", "Vibes", "Life"],
  },
  {
    id: 4,
    title: "Cafe hopping sambil brainstorming",
    description:
      "Ada magic tersendiri kalau brainstorm di cafe baru. Suasana beda, ide pun beda. Kali ini nemu spot kece banget buat kerja remote.",
    media_url: "/story-cafe.png",
    type: "image",
    tags: ["Design", "Idea", "Review"],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function getMediaType(
  url: string,
  typeHint?: string | null
): "video" | "youtube" | "image" {
  if (typeHint === "video" || typeHint === "youtube") {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    }
    return "video";
  }
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.match(/\.(mp4|webm|mov|ogg)$/i)) {
    return "video";
  }
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

/** Send a command to a YouTube iframe via postMessage */
function ytCommand(iframe: HTMLIFrameElement | null, func: string) {
  try {
    iframe?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: "" }),
      "*"
    );
  } catch {
    // Silently swallow — iframe may not be ready or cross-origin
  }
}

// ─── Data Fetcher ────────────────────────────────────────────────────

async function fetchStories() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!supabaseUrl || !supabaseAnonKey) return MOCK_STORIES;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    for (const table of ["stories", "gallery", "memories"]) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .contains("sections", ["stories"])
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch {
        continue;
      }
    }
    return MOCK_STORIES;
  } catch {
    return MOCK_STORIES;
  }
}

// ═════════════════════════════════════════════════════════════════════
// ISOLATED CLIENT VIDEO CARD
// Two completely independent iframes — card & modal — each with their
// own refs and states. Uses YouTube postMessage API for imperative
// play/pause/mute control. Zero react-player. Zero AbortError.
// ═════════════════════════════════════════════════════════════════════

function ClientVideoCard({ mediaUrl, title }: { mediaUrl: string; title: string }) {
  // ── Separate states for Card vs Modal ──
  const [cardPlaying, setCardPlaying] = useState(true);
  const [cardMuted, setCardMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(false);

  // ── Separate refs — never share an iframe ──
  const cardIframeRef = useRef<HTMLIFrameElement>(null);
  const modalIframeRef = useRef<HTMLIFrameElement>(null);

  const videoId = getYouTubeVideoId(mediaUrl);
  if (!videoId) return null;

  // enablejsapi=1 is REQUIRED for postMessage control
  const cardSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&playlist=${videoId}&showinfo=0`;
  const modalSrc = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;

  // ── Imperative Card Play/Pause ──
  useEffect(() => {
    ytCommand(cardIframeRef.current, cardPlaying ? "playVideo" : "pauseVideo");
  }, [cardPlaying]);

  // ── Imperative Card Mute/Unmute ──
  useEffect(() => {
    ytCommand(cardIframeRef.current, cardMuted ? "mute" : "unMute");
  }, [cardMuted]);

  // ── Imperative Modal Play/Pause ──
  useEffect(() => {
    if (modalPlaying) {
      ytCommand(modalIframeRef.current, "playVideo");
      ytCommand(modalIframeRef.current, "unMute");
    } else {
      ytCommand(modalIframeRef.current, "pauseVideo");
    }
  }, [modalPlaying]);

  // ── Click Handlers (all with stopPropagation) ──
  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCardPlaying((prev) => !prev);
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCardMuted((prev) => !prev);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Step 1: Pause card video FIRST
    setCardPlaying(false);
    // Step 2: Open modal
    setIsModalOpen(true);
    // Step 3: Start modal player after 100ms micro-delay
    setTimeout(() => setModalPlaying(true), 100);
  };

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) {
      // Pause modal video, then close and resume card
      setModalPlaying(false);
      setIsModalOpen(false);
      setTimeout(() => setCardPlaying(true), 100);
    }
  }, []);

  return (
    <>
      {/* ── CARD VIDEO ── */}
      <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-[24px] overflow-hidden bg-muted/20 group">
        {/* Raw YouTube iframe — no react-player, no AbortError */}
        <iframe
          ref={cardIframeRef}
          src={cardSrc}
          title={title}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.3]"
        />

        {/* Custom Overlay Controls */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/30 via-transparent to-black/30">
          {/* Top Row */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleExpand}
              className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-colors cursor-pointer outline-none"
              aria-label="Expand video"
            >
              <Expand className="w-5 h-5" />
            </button>
            <button
              onClick={handleMuteToggle}
              className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transition-colors cursor-pointer outline-none"
              aria-label={cardMuted ? "Unmute" : "Mute"}
            >
              {cardMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Play/Pause */}
          <div className="flex justify-center items-center flex-1">
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 bg-[#2398f7]/90 hover:bg-[#2398f7] text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform cursor-pointer shadow-lg outline-none"
              aria-label={cardPlaying ? "Pause" : "Play"}
            >
              {cardPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
          </div>

          {/* Bottom spacer */}
          <div />
        </div>
      </div>

      {/* ── EXPAND MODAL — standard Radix Dialog, separate iframe ── */}
      <Dialog open={isModalOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none flex justify-center items-center sm:max-w-4xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Expanded view of {title}
          </DialogDescription>
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black">
            {/* Completely separate iframe — own ref, own state */}
            {isModalOpen && (
              <iframe
                ref={modalIframeRef}
                src={modalSrc}
                title={`${title} — expanded`}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Native Video with Imperative Ref ────────────────────────────────

function NativeVideoCard({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Imperative play/pause with AbortError swallowing
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently ignore AbortError caused by DOM removal or rapid pause
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-[24px] overflow-hidden bg-muted/20 group">
      <video
        ref={videoRef}
        src={url}
        loop
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none"
      />
      {/* Minimal overlay for play/pause */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPlaying((prev) => !prev);
          }}
          className="w-14 h-14 bg-[#2398f7]/90 hover:bg-[#2398f7] text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition-transform cursor-pointer shadow-lg outline-none"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Static Image ────────────────────────────────────────────────────

function ImageRenderer({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-[24px] overflow-hidden bg-muted/20">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

// ─── Media Router ────────────────────────────────────────────────────

function MediaRenderer({
  url,
  type,
  alt,
}: {
  url: string;
  type: string | null | undefined;
  alt: string;
}) {
  const mediaType = getMediaType(url, type);

  if (mediaType === "youtube") {
    return <ClientVideoCard mediaUrl={url} title={alt} />;
  }
  if (mediaType === "video") {
    return <NativeVideoCard url={url} />;
  }
  return <ImageRenderer url={url} alt={alt} />;
}

// ─── Main Stories Component ──────────────────────────────────────────

export function AffanStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories().then((res) => {
      setStories(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full">
      {/* Section Heading */}
      <div className="text-center mb-12 space-y-3 px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2398f7]">
          Stories
        </p>
        <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Get started with our{" "}
          <span className="text-[#2398f7]">best Affan stories</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Behind the code, behind the screen — moments that shape the journey.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 border-4 border-[#2398f7] border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm font-medium">
                Loading stories...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story: any, index: number) => {
              const tags = Array.isArray(story.tags)
                ? story.tags
                : typeof story.tags === "string"
                  ? story.tags.split(",")
                  : story.type
                    ? [story.type.charAt(0).toUpperCase() + story.type.slice(1)]
                    : ["Story"];

              const mediaUrl = story.media_url || story.image_url || "";
              const description =
                story.description ||
                story.content ||
                story.caption ||
                story.body ||
                story.title ||
                "No description.";

              return (
                <Card
                  key={story.id || index}
                  className="shadow-sm border-none bg-white dark:bg-zinc-900 overflow-hidden rounded-[24px] p-0"
                >
                  {mediaUrl ? (
                    <MediaRenderer
                      url={mediaUrl}
                      type={story.type}
                      alt={story.title || "Story media"}
                    />
                  ) : (
                    <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-[24px] overflow-hidden bg-muted/20">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2398f7]/10 to-[#2398f7]/5" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 px-6 pt-6">
                    {tags.slice(0, 3).map((tag: string, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="font-normal text-xs bg-[#2398f7]/10 text-[#1a7cd4] dark:text-[#58b3fc] border-none"
                      >
                        {typeof tag === "string" ? tag.trim() : tag}
                      </Badge>
                    ))}
                  </div>

                  <CardHeader className="px-6 pb-2 pt-3">
                    <CardTitle className="text-xl font-bold tracking-tight leading-snug">
                      {story.title || "Untitled Story"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
