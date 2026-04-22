"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { FloatingBackButton } from "@/components/floating-back-button";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  Music2, ListMusic, Loader2, SearchX 
} from "lucide-react";
import { Slider } from "@/components/ui/slider"; // Pastikan lu udah install shadcn slider

interface Song {
  id: number;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string | null;
}

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Fetch data dari table 'music' lu
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

  // 2. Control Logic
  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop ke awal
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(songs.length - 1); // Ke lagu terakhir
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
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

  const formatTime = (time: number) => {
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
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">Playlist Masih Kosong</h2>
        <p className="text-muted-foreground mb-8">Belum ada lagu yang di-upload ke database musik.</p>
        <Link href="/" className="px-6 py-2 bg-[#2398f7] text-white rounded-full">Pulang Dulu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground pb-40">
      <audio 
        ref={audioRef} 
        src={currentSong?.audio_url} 
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={handleNext}
      />

      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* BAGIAN KIRI: Artwork & Info Lagu Aktif */}
          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:text-left lg:items-start lg:sticky lg:top-24">
            <div className="relative group w-64 h-64 md:w-80 md:h-80 mb-8 shadow-2xl rounded-3xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              {currentSong?.cover_url ? (
                <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2398f7]/20 to-[#2398f7]/5">
                  <Music2 className="w-20 h-20 text-[#2398f7]" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight line-clamp-1">{currentSong?.title}</h1>
            <p className="text-xl text-[#2398f7] font-medium mb-6">{currentSong?.artist}</p>
            
            <div className="hidden lg:block w-full max-w-md bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 p-6 rounded-3xl">
              <p className="text-sm text-muted-foreground italic">"Lagu ini punya memori tersendiri di ruang waktu Affan."</p>
            </div>
          </div>

          {/* BAGIAN KANAN: Playlist Queue */}
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
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                    index === currentIndex 
                    ? 'bg-white dark:bg-zinc-900 shadow-md border border-[#2398f7]/20' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex-shrink-0">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#2398f7]/10">
                        <Music2 className="w-5 h-5 text-[#2398f7]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`font-semibold text-sm md:text-base ${index === currentIndex ? 'text-[#2398f7]' : ''}`}>{song.title}</h3>
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

      {/* FIXED PLAYER BAR (ALA SPOTIFY PREMIUM) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[2.5rem] p-4 md:p-6 shadow-2xl">
          
          {/* Progress Bar Atas */}
          <div className="mb-4 group">
            <Slider
              value={[progress]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] font-medium text-muted-foreground">{formatTime(progress)}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Info Mobile (Hide on desktop info) */}
            <div className="flex items-center gap-3 w-1/3 overflow-hidden">
              <div className="hidden sm:block w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img src={currentSong?.cover_url || ''} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm truncate">{currentSong?.title}</span>
                <span className="text-[10px] text-[#2398f7] font-medium truncate">{currentSong?.artist}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-4 md:gap-8 justify-center">
              <button onClick={handlePrev} className="text-muted-foreground hover:text-[#2398f7] transition-colors"><SkipBack /></button>
              <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-[#2398f7] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#2398f7]/30 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button onClick={handleNext} className="text-muted-foreground hover:text-[#2398f7] transition-colors"><SkipForward /></button>
            </div>

            {/* Volume (Desktop Only) */}
            <div className="hidden md:flex items-center gap-3 w-1/3 justify-end">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24">
                <Slider defaultValue={[80]} max={100} step={1} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingBackButton />

      <style jsx global>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </div>
  );
}