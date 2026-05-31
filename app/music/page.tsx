"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { FloatingBackButton } from "@/components/floating-back-button";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Music2, ListMusic, Loader2, SearchX, Maximize2, Minimize2, Mic2, 
  Activity // <-- Tambahan icon buat Immersive Mode
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

// 👇 FIX: Import Komponen Overlay Lu 👇
import SoundscapeOverlay from "@/components/soundscape-overlay"; 

interface Song {
  id: number;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
  lyrics: string | null;
}

interface LyricLine {
  time: number;
  text: string;
}

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  
  // 👇 FIX: Tambahan State Buat Overlay 👇
  const [showVisualizer, setShowVisualizer] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const activeLyricRef = useRef<HTMLDivElement | null>(null); 
  const collapsedActiveLyricRef = useRef<HTMLDivElement | null>(null); 
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const collapsedLyricsContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const { data, error } = await supabase
          .from("music")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setSongs(data);
      } catch (err) {
        console.error("Gagal narik lagu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const currentSong = songs[currentIndex];

  const parsedLyrics = useMemo<LyricLine[]>(() => {
    if (!currentSong?.lyrics) return [];
    const lines = currentSong.lyrics.split('\n');
    const lyricsArray: LyricLine[] = [];
    const timeRegex = /\[(\d{2,}):(\d{2}(?:\.\d{1,3})?)\]/;

    lines.forEach(line => {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const text = line.replace(timeRegex, '').trim();
        lyricsArray.push({ time: minutes * 60 + seconds, text });
      }
    });
    return lyricsArray;
  }, [currentSong?.lyrics]);

  const activeLyricIndex = useMemo(() => {
    if (!parsedLyrics.length) return -1;
    let active = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (progress >= parsedLyrics[i].time) {
        active = i;
      } else {
        break; 
      }
    }
    return active;
  }, [progress, parsedLyrics]);

  const expandedLyricsList = useMemo(() => {
    return parsedLyrics.map((lyric, index) => (
      <div 
        key={index}
        ref={index === activeLyricIndex ? activeLyricRef : null}
        className={`origin-left transition-[opacity,transform,color] duration-300 ease-out will-change-[opacity,transform] ${
          index === activeLyricIndex 
          ? 'text-3xl md:text-5xl font-bold text-[#2398f7] opacity-100 scale-100 translate-x-2' 
          : 'text-2xl md:text-4xl font-semibold text-foreground opacity-30 scale-95 translate-x-0'
        }`}
      >
        {lyric.text || "♪"}
      </div>
    ));
  }, [parsedLyrics, activeLyricIndex]);

  const collapsedLyricsList = useMemo(() => {
    return parsedLyrics.map((lyric, index) => (
      <div 
        key={index}
        ref={index === activeLyricIndex ? collapsedActiveLyricRef : null} 
        className={`transition-[opacity,transform,color] duration-300 ease-out will-change-[opacity,transform] text-sm md:text-base font-medium leading-relaxed ${
          index === activeLyricIndex 
          ? 'text-[#2398f7] font-bold scale-105 opacity-100' 
          : 'text-foreground opacity-30 scale-100'
        }`}
      >
        {lyric.text || "♪"}
      </div>
    ));
  }, [parsedLyrics, activeLyricIndex]);

  useEffect(() => {
    if (isLyricsExpanded && activeLyricRef.current && lyricsContainerRef.current) {
      lyricsContainerRef.current.scrollTo({
        top: activeLyricRef.current.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeLyricRef.current.clientHeight / 2,
        behavior: 'smooth'
      });
    } else if (!isLyricsExpanded && collapsedActiveLyricRef.current && collapsedLyricsContainerRef.current) {
      collapsedLyricsContainerRef.current.scrollTo({
        top: collapsedActiveLyricRef.current.offsetTop - collapsedLyricsContainerRef.current.clientHeight / 2 + collapsedActiveLyricRef.current.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [activeLyricIndex, isLyricsExpanded]);

  useEffect(() => {
    setProgress(0);
    if (lyricsContainerRef.current) lyricsContainerRef.current.scrollTop = 0;
    if (collapsedLyricsContainerRef.current) collapsedLyricsContainerRef.current.scrollTop = 0;
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.warn("Auto-play ketahan browser", err));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // FIX: Replaced requestAnimationFrame loop (60 re-renders/sec) with
  // onTimeUpdate handler on <audio> element (~4 re-renders/sec).
  // The handler is defined here and passed to the <audio> element below.
  const onTimeUpdateHandler = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(songs.length - 1);
    }
    setIsPlaying(true);
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleVolume = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2398f7] animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Menyiapkan Playlist Affan...</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#eaeced] dark:bg-[#0a0a0a]">
        <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Playlist Masih Kosong</h2>
        <p className="text-muted-foreground mb-8">Belum ada lagu yang di-upload ke database musik.</p>
        <button onClick={() => window.history.back()} className="px-6 py-2 bg-[#2398f7] text-white rounded-full">Pulang Dulu</button>
      </div>
    );
  }

  const sliderStyles = `
    cursor-pointer 
    [&_[data-radix-slider-track]]:!bg-black/10 dark:[&_[data-radix-slider-track]]:!bg-white/10 
    [&_[data-radix-slider-track]]:!h-1.5 
    [&_[data-radix-slider-range]]:!bg-[#2398f7] 
    [&_[role=slider]]:!bg-[#2398f7] 
    [&_[role=slider]]:!border-white dark:[&_[role=slider]]:!border-[#0a0a0a] 
    [&_[role=slider]]:!w-4 [&_[role=slider]]:!h-4 
    hover:[&_[role=slider]]:!scale-110 [&_[role=slider]]:!transition-transform 
    [&_[role=slider]]:!shadow-[0_0_10px_rgba(35,152,247,0.5)]
  `;

  return (
    <div className="min-h-screen bg-[#eaeced] dark:bg-[#0a0a0a] text-foreground pb-0 md:pb-6 transition-colors duration-300 relative flex flex-col">
      <audio 
        ref={audioRef} 
        src={currentSong?.audio_url}
        crossOrigin="anonymous" 
        onLoadedMetadata={onLoadedMetadata}
        onEnded={handleNext}
        onTimeUpdate={onTimeUpdateHandler}
      />

      {/* MODAL LIRIK */}
      <div 
        className={`fixed inset-0 z-[70] flex items-end md:items-center justify-center md:p-4 md:pb-40 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isLyricsExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[#eaeced]/95 dark:bg-[#0a0a0a]/95 transition-opacity duration-500" onClick={() => setIsLyricsExpanded(false)} />
        
        <div className={`relative w-full h-[90vh] md:h-full max-w-4xl md:max-h-[70vh] bg-white/50 dark:bg-zinc-900/50 rounded-t-3xl md:rounded-3xl border border-black/5 dark:border-white/10 shadow-2xl flex flex-col z-10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isLyricsExpanded ? 'translate-y-0 scale-100' : 'translate-y-full md:translate-y-12 md:scale-95'
        }`}>
          <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5 dark:border-white/5 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-md rounded-t-3xl md:rounded-t-3xl">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#2398f7]">
              <Mic2 className="w-5 h-5" />
              Lyrics - {currentSong?.title}
            </h2>
            <button 
              onClick={() => setIsLyricsExpanded(false)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
            {!currentSong?.lyrics ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <p className="italic text-lg">Lirik belum tersedia untuk memori ini.</p>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 px-6 md:px-12 py-[40vh]">
                {expandedLyricsList}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 pt-20 pb-32 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex-1 ${
        isLyricsExpanded ? 'opacity-20 scale-[0.98] pointer-events-none' : 'opacity-100 scale-100'
      }`}>
        <div className="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">
          
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:text-left lg:items-start lg:sticky lg:top-28 lg:pb-40 2xl:pb-0 z-10">
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8 shadow-2xl rounded-3xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
              {currentSong?.cover_url ? (
                <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2398f7]/20 to-[#2398f7]/5">
                  <Music2 className="w-20 h-20 text-[#2398f7]" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight line-clamp-1">{currentSong?.title}</h1>
            <p className="text-xl text-[#2398f7] font-medium mb-6">{currentSong?.artist}</p>
            
            {/* 👇 FIX: Tombol Utama Immersive Mode (Aman buat Mobile & Desktop) 👇 */}
            <button 
              onClick={() => setShowVisualizer(true)}
              className="flex items-center gap-2 px-6 py-2.5 mb-8 text-sm font-bold text-[#2398f7] border-2 border-[#2398f7]/30 rounded-full hover:bg-[#2398f7]/10 hover:border-[#2398f7] transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Activity className="w-4 h-4" />
              Immersive Mode
            </button>
            
            <div 
              onClick={() => parsedLyrics.length > 0 && setIsLyricsExpanded(true)}
              className={`w-full max-w-md bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer shadow-md group relative flex flex-col h-36 hover:bg-white/60 dark:hover:bg-zinc-900/60 ${parsedLyrics.length > 0 ? 'pointer-events-auto' : 'pointer-events-none opacity-50'}`}
            >
              {parsedLyrics.length > 0 && (
                <div className="absolute top-3 right-4 z-20 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </div>
              )}
              <div ref={collapsedLyricsContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
                {!currentSong?.lyrics ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 italic text-xs text-center">
                    <p>Lirik belum tersedia untuk memori ini.</p>
                  </div>
                ) : (
                  <div className="space-y-4 px-4 py-[60px] text-center">
                    {collapsedLyricsList}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-8">
              <ListMusic className="w-6 h-6 text-[#2398f7]" />
              <h2 className="text-2xl font-bold">Up Next</h2>
            </div>
            <div className="space-y-2">
              {songs.map((song, index) => (
                <button
                  key={song.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsPlaying(true);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    index === currentIndex 
                    ? 'bg-white/80 dark:bg-zinc-900/80 shadow-md border border-[#2398f7]/30' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                    {song.cover_url ? <img src={song.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#2398f7]/10"><Music2 className="w-5 h-5 text-[#2398f7]" /></div>}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`font-semibold text-sm md:text-base ${index === currentIndex ? 'text-[#2398f7]' : 'text-foreground'}`}>{song.title}</h3>
                    <p className="text-xs text-muted-foreground">{song.artist}</p>
                  </div>
                  {index === currentIndex && isPlaying && (
                    <div className="flex gap-1 items-end h-4">
                      <div className="w-1 bg-[#2398f7] animate-[music-bar_0.6s_ease-in-out_infinite]" />
                      <div className="w-1 bg-[#2398f7] animate-[music-bar_0.8s_ease-in-out_infinite]" />
                      <div className="w-1 bg-[#2398f7] animate-[music-bar_0.5s_ease-in-out_infinite]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 md:bottom-6 z-[60] w-full md:w-[95%] max-w-4xl mx-auto">
        <div 
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border-t md:border border-black/5 dark:border-white/10 rounded-t-3xl md:rounded-[2.5rem] p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] cursor-pointer transition-transform hover:bg-white/100 dark:hover:bg-zinc-900/100"
          onClick={() => {
            if (parsedLyrics.length > 0) setIsLyricsExpanded(true);
          }}
        >
          <div className="mb-3 md:mb-4" onClick={(e) => e.stopPropagation()}>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.001}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] font-medium text-muted-foreground">{formatTime(progress)}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-[50%] md:w-1/3 overflow-hidden">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 shadow-md">
                {currentSong?.cover_url && <img src={currentSong.cover_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm md:text-base truncate text-foreground">{currentSong?.title}</span>
                <span className="text-[10px] md:text-xs text-[#2398f7] font-medium truncate">{currentSong?.artist}</span>
              </div>
            </div>

            <div 
              className="flex items-center gap-2 md:gap-8 justify-end md:justify-center w-[50%] md:w-1/3" 
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handlePrev} className="text-muted-foreground hover:text-[#2398f7] transition-colors"><SkipBack className="w-5 h-5 md:w-6 md:h-6" /></button>
              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-14 md:h-14 bg-[#2398f7] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#2398f7]/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />}
              </button>
              <button onClick={handleNext} className="text-muted-foreground hover:text-[#2398f7] transition-colors"><SkipForward className="w-5 h-5 md:w-6 md:h-6" /></button>
            </div>

            <div 
              className="hidden md:flex items-center gap-3 w-1/3 justify-end custom-slider"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 👇 FIX: Icon Immersive Mode kecil di bar bawah (khusus desktop) 👇 */}
              <button onClick={() => setShowVisualizer(true)} className="text-muted-foreground hover:text-[#2398f7] transition-colors mr-2" title="Immersive Mode">
                <Activity className="w-5 h-5" />
              </button>
              
              <button onClick={toggleMute} className="text-muted-foreground hover:text-[#2398f7] transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-24">
                <Slider 
                  value={[isMuted ? 0 : volume * 100]} 
                  max={100} 
                  step={1} 
                  onValueChange={handleVolume}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <FloatingBackButton />
      </div>

      {/* 👇 FIX: Pasang Komponen Overlay di paling bawah 👇 */}
      <SoundscapeOverlay 
        isOpen={showVisualizer} 
        onClose={() => setShowVisualizer(false)} 
        songTitle={currentSong?.title}
        audioRef={audioRef} 
      />

      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}