"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface SystemBriefingVideoProps {
  videoId?: string;
}

export function SystemBriefingVideo({ videoId = "dQw4w9WgXcQ" }: SystemBriefingVideoProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-24 relative z-20 flex flex-col items-center">
      
      {/* Pill Badges */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex space-x-3 mb-6"
      >
        <span className="px-3 py-1 rounded-full border border-[#2398f7]/30 bg-[#2398f7]/10 text-[#2398f7] text-xs font-medium uppercase tracking-wider">
          System Demo
        </span>
        <span className="px-3 py-1 rounded-full border border-[#2398f7]/30 bg-[#2398f7]/10 text-[#2398f7] text-xs font-medium uppercase tracking-wider hidden sm:inline-block">
          Lore Overview
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          Explore The <span className="text-[#2398f7]">Affanverse</span>
        </h2>
        
        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Menyelami inti dari ekosistem anomali digital. Temukan semua rahasia di dalam Affanverse, mulai dari arsip novel 
          The Apex Predator, interaksi langsung dengan Affan AI, 
          hingga eksperimen sistem yang saling terhubung.
        </p>
      </motion.div>

      {/* Video Facade Container */}
      <motion.div
        className="relative w-full aspect-video mt-8 rounded-xl overflow-hidden shadow-2xl bg-black transform-gpu"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      >
        {!isPlaying ? (
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group" 
            onClick={() => setIsPlaying(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsPlaying(true);
              }
            }}
          >
            {/* High-quality placeholder image mimicking a YouTube thumbnail */}
            <Image 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
              alt="System Briefing Thumbnail"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
            />
            
            {/* Classic YouTube Red Play Button (SVG Replica) */}
            <div className="relative z-20 transition-transform duration-300 group-hover:scale-110 transform-gpu">
              <svg 
                height="100%" 
                version="1.1" 
                viewBox="0 0 68 48" 
                width="100%" 
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl"
              >
                <path 
                  className="fill-[#FF0000] group-hover:fill-[#f00] transition-colors duration-300" 
                  d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                ></path>
                <path 
                  className="fill-white" 
                  d="M 45,24 27,14 27,34"
                ></path>
              </svg>
            </div>
            
            {/* Subtle bottom shadow mimicking YouTube player UI overlay */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 z-20 bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="System Briefing Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}
      </motion.div>
    </section>
  );
}
