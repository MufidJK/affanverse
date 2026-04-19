"use client";

import React from "react";
import Image from "next/image";

const DUMP_IMAGES = [
  {
    src: "/images/pfps/jeka-pfp.png",
    caption: "Trying to look busy while doing absolutely nothing.",
    rotation: "rotate-2",
    offset: "translate-x-2",
    aspect: "aspect-square",
  },
  {
    src: "/images/pfps/gilang-pfp.png",
    caption: "Observing my own failure in 4K resolution.",
    rotation: "-rotate-3",
    offset: "-translate-y-4",
    aspect: "aspect-[3/4]",
  },
  {
    src: "/images/pfps/noval-pfp.png",
    caption: "The survivor of the Great Bug War of 2024.",
    rotation: "rotate-1",
    offset: "translate-y-2",
    aspect: "aspect-video",
  },
  {
    src: "/images/pfps/febry-pfp.png",
    caption: "Sempoyongan mode: Engaged.",
    rotation: "-rotate-2",
    offset: "-translate-x-4",
    aspect: "aspect-square",
  },
  {
    src: "/images/pfps/faiz-pfp.png",
    caption: "Judging your choice of font in silence.",
    rotation: "rotate-6",
    offset: "translate-x-4",
    aspect: "aspect-[4/5]",
  },
  {
    src: "/images/pfps/fadhil-pfp.png",
    caption: "Contemplating the void, and the void stared back.",
    rotation: "-rotate-1",
    offset: "translate-y-6",
    aspect: "aspect-video",
  },
];

export function AffanGalleryDump() {
  return (
    <section className="w-full py-24 bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Multiversal Echoes: <span className="text-[#2398f7]">A Daily Dump</span>
          </h2>
          <p className="text-muted-foreground text-lg">Random snippets of digital decay.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 pt-12">
          {DUMP_IMAGES.map((img, i) => (
            <div 
              key={i} 
              className={`group relative ${img.rotation} ${img.offset} transition-transform duration-500 hover:rotate-0 hover:translate-x-0 hover:translate-y-0 z-10 hover:z-20`}
            >
              <div className="p-3 bg-white dark:bg-zinc-900 border border-border/40 rounded-2xl shadow-xl shadow-black/5 flex flex-col gap-3">
                <div className={`relative w-full ${img.aspect} rounded-xl overflow-hidden bg-muted`}>
                   <img 
                    src={img.src} 
                    alt="Gallery item"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-${1550000000000 + i}?auto=format&fit=crop&q=80&w=400&h=400`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <p className="text-sm font-medium text-muted-foreground italic px-2">"{img.caption}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
