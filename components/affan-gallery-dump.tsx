"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Gallery } from "@/types/database";

export function AffanGalleryDump() {
  const [photos, setPhotos] = useState<Gallery[] | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 1. Inject React State
  const [activeCard, setActiveCard] = useState<string | number | null>(null);
  
  // Ref to handle the timeout cleanup (SOP Rule 2 Compliance)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert to client-side data fetch due to "use client" directive
  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .contains("sections", ["gallery_dump"]) as unknown as { data: Gallery[] | null, error: any };
        
      if (error) {
        console.error("Error fetching gallery photos:", error);
      }
      setPhotos(data);
      setLoading(false);
    }
    
    fetchPhotos();

    // SOP RULE 2: strict cleanup for timeouts
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section className="w-full py-24 bg-gray-100 dark:bg-gray-900 px-4">
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-rainbow {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
          Unsorted <span className="text-[#2398f7]">Dump's:</span>{" "}
          <span className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-rainbow">
            Evidence of His Existence
          </span>
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base max-w-2xl mx-auto mb-12 text-center">
          Foto-foto random Affan yang entah kenapa ada. Dikumpulin gitu aja, dipajang tanpa izin, 
          tanpa rasa bersalah.
          Nggak ada yang minta, nggak ada yang nanya — tapi, ini dia buktinya.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          Memuat momen...
        </div>
      ) : !photos || photos.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          Belum ada momen yang terekam.
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6 max-w-7xl mx-auto px-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              // 2. Click handler directly on the wrapper with cleanup check
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                setActiveCard(photo.id);
                timeoutRef.current = setTimeout(() => setActiveCard(null), 3000);
              }}
              className="break-inside-avoid relative rounded-2xl overflow-hidden bg-card border border-black/5 dark:border-white/5 shadow-sm group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/5 hover:-translate-y-1"
            >
              {photo.media_url ? (
                <>
                  <img
                    src={photo.media_url}
                    alt={photo.title || "Gallery Image"}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[103%]"
                    loading="lazy"
                  />
                  {/* 3. Fixed Overlay: Separated Background and Text layers for flawless animation */}
                  <div 
                    className={`absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300 ${
                      activeCard === photo.id 
                        ? 'opacity-100 bg-black/80' 
                        : 'opacity-0 md:group-hover:opacity-100 bg-black/80'
                    }`}
                  >
                    <div 
                      className={`flex flex-col justify-end h-full w-full p-4 md:p-6 transition-transform duration-300 ${
                        activeCard === photo.id 
                          ? 'translate-y-0' 
                          : 'translate-y-4 md:group-hover:translate-y-0'
                      }`}
                    >
                      {photo.title && (
                        <h3 className="font-semibold text-base md:text-lg text-white line-clamp-1">
                          {photo.title}
                        </h3>
                      )}
                      {photo.description && (
                        <p className="text-xs md:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-48 bg-muted/20" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}