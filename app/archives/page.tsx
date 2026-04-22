"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"
import { FloatingBackButton } from "@/components/floating-back-button"
import { FolderX, Loader2, Search, Filter, ArrowDownWideNarrow, ChevronDown, SearchX } from "lucide-react"
import Link from "next/link"
import SmartMedia from "@/components/smart-media"

// Kasih "KTP" buat TypeScript
interface ArchiveItem {
  id: string | number;
  media_url: string;
  type?: string;
  media_type?: string;
  title?: string;
  description?: string;
}

const LIMIT = 20;

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [filterType, setFilterType] = useState("all"); 

  // Debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fungsi Tarik Data Supabase
  const fetchArchives = async (
    pageIndex: number, 
    search: string, 
    sort: string, 
    type: string, 
    isReset = false
  ) => {
    try {
      if (isReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = pageIndex * LIMIT;
      const to = from + LIMIT - 1;

      // Base query
      let query = supabase
        .from("gallery")
        .select("*")
        .contains("sections", ["main_archive"]);

      // Filter Search (Judul)
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      // Filter Tipe
      if (type === "image") {
        query = query.eq("type", "image");
      } else if (type === "video") {
        query = query.in("type", ["video", "youtube"]);
      }

      // Sorting & Pagination
      query = query.order("created_at", { ascending: sort === "asc" });
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        if (isReset || pageIndex === 0) {
          setArchives(data); 
        } else {
          setArchives((prev) => [...prev, ...data]); 
        }
        
        if (data.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Error fetching archives:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchArchives(0, debouncedSearch, sortOrder, filterType, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, sortOrder, filterType]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArchives(nextPage, debouncedSearch, sortOrder, filterType, false);
  };

  const hasData = archives && archives.length > 0;
  const isFiltering = debouncedSearch !== "" || filterType !== "all";

  return (
    <div className="min-h-screen pb-32 relative">
      <div className="container mx-auto px-4 sm:px-8 pt-12 md:pt-20">
        
        {/* Header & Filter Section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
          
          <div className="text-left max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Arsip Multiversal Affan<span className="text-[#2398f7]">.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Seluruh jejak, momen, dan anomali Affan yang terekam dalam ruang dan waktu.
            </p>
          </div>

          {/* UI Pill Menu Minimalist */}
          <div className="flex flex-col sm:flex-row items-center w-full xl:w-auto bg-white dark:bg-zinc-900/80 backdrop-blur-xl p-1.5 rounded-3xl sm:rounded-full border border-black/5 dark:border-white/10 shadow-sm transition-all duration-300">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-56 lg:w-64 flex-shrink-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-[#2398f7] transition-colors" />
              <input 
                type="text" 
                placeholder="Cari anomali..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground/60 transition-all"
              />
            </div>

            {/* Garis Pemisah */}
            <div className="hidden sm:block w-px h-6 bg-black/10 dark:bg-white/10 mx-2" />
            <div className="sm:hidden w-full h-px bg-black/5 dark:bg-white/5 my-1" />

            {/* Container Dropdown */}
            <div className="flex flex-row w-full sm:w-auto gap-1">
              
              {/* Kategori Filter */}
              <div className="relative w-1/2 sm:w-auto flex-shrink-0 flex items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-2xl sm:rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <Filter className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-36 pl-9 pr-8 py-2 bg-transparent focus:outline-none text-sm appearance-none cursor-pointer font-medium text-muted-foreground focus:text-foreground transition-all"
                >
                  {/* 👇 FIX: Opsi Dropdown dipaksa punya warna background spesifik 👇 */}
                  <option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="all">Semua Format</option>
                  <option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="image">Gambar / Foto</option>
                  <option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="video">Hanya Video</option>
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Sortir */}
              <div className="relative w-1/2 sm:w-auto flex-shrink-0 flex items-center bg-gray-50/50 dark:bg-zinc-800/50 rounded-2xl sm:rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <ArrowDownWideNarrow className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full sm:w-44 pl-9 pr-8 py-2 bg-transparent focus:outline-none text-sm appearance-none cursor-pointer font-medium text-muted-foreground focus:text-foreground transition-all"
                >
                  {/* 👇 FIX: Opsi Dropdown dipaksa punya warna background spesifik 👇 */}
                  <option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="asc">Terlama - Terbaru</option>
                  <option className="bg-white dark:bg-zinc-900 text-black dark:text-white" value="desc">Terbaru - Terlama</option>
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-[#2398f7] animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Memindai Arsip Multiversal...</p>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <div className="bg-muted/50 p-6 rounded-full mb-6">
              {isFiltering ? (
                <SearchX className="h-16 w-16 text-muted-foreground opacity-50" />
              ) : (
                <FolderX className="h-16 w-16 text-muted-foreground opacity-50" />
              )}
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {isFiltering ? "Anomali Tidak Ditemukan" : "Arsip Multiversal Kosong"}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {isFiltering 
                ? "Gak ada arsip yang cocok sama filter pencarian lu. Coba kata kunci lain atau reset filternya." 
                : "Sepertinya arsip ini belum terisi oleh anomali apapun. Silakan tunggu pembaruan sistem."}
            </p>
            {isFiltering ? (
              <button 
                onClick={() => { setSearchQuery(""); setFilterType("all"); setSortOrder("asc"); }}
                className="px-6 py-2 bg-[#2398f7] hover:bg-[#1a80d4] text-white font-medium rounded-full transition-colors duration-300"
              >
                Reset Filter
              </button>
            ) : (
              <Link href="/" className="px-6 py-2 bg-[#2398f7] hover:bg-[#1a80d4] text-white font-medium rounded-full transition-colors duration-300">
                Return to Home
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
              {archives.map((item: ArchiveItem) => (
                <div 
                  key={item.id} 
                  className="flex flex-col bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden hover:border-[#2398f7]/30 transition-colors duration-300 group"
                >
                  <figure className="aspect-[3/4] relative w-full overflow-hidden bg-black/5 dark:bg-zinc-800/50">
                    <SmartMedia src={item.media_url} type={item.type || item.media_type} alt={item.title || 'Archive Media'} />
                  </figure>
                  
                  <div className="p-4 flex flex-col gap-2">
                    <span className="w-fit px-2.5 py-0.5 mb-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2398f7] text-[10px] font-semibold uppercase tracking-wider">
                      {item.type || item.media_type || 'Image'}
                    </span>
                    <h3 className="font-semibold text-sm md:text-base group-hover:text-[#2398f7] transition-colors line-clamp-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Tombol */}
            {hasMore && (
              <div className="w-full flex justify-center mt-16">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white dark:bg-zinc-900 border-2 border-[#2398f7] text-[#2398f7] hover:bg-[#2398f7] hover:text-white font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Archives"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <FloatingBackButton />
    </div>
  )
}