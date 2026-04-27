"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// --- Mock Data ---
const LIGHT_NOVELS = [
  { id: "vol-1", title: "Volume 1", description: "The Beginning", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+1" },
  { id: "vol-2", title: "Volume 2", description: "Awakening", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+2" },
  { id: "vol-3", title: "Volume 3", description: "Shadows", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+3" },
  { id: "vol-4", title: "Volume 4", description: "The Apex", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+4" },
  { id: "vol-5", title: "Volume 5", description: "Rebirth", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+5" },
  { id: "vol-6", title: "Volume 6", description: "Ascension", cover: "https://placehold.co/600x800/e2e8f0/1e293b?text=Volume+6" },
];

const MANHWA = [
  { id: "ch-1-10", title: "Chapters 1-10", description: "Dawn", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+1-10" },
  { id: "ch-11-20", title: "Chapters 11-20", description: "Rise", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+11-20" },
  { id: "ch-21-30", title: "Chapters 21-30", description: "Clash", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+21-30" },
];

// --- Components ---

const Card = ({ item, index, hrefBase }: { item: any; index: number; hrefBase: string }) => {
  return (
    <Link href={`/${hrefBase}/${item.id}`} className="group block">
      {/* 
        SOP RULE 5: Hardware Acceleration.
        Using transform-gpu, will-change-transform for smooth animation. 
        NO box-shadow or blur used on hover. 
      */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 will-change-transform transform-gpu transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
        <Image
          src={item.cover}
          alt={item.title}
          fill
          className="object-cover"
          // SOP RULE 9: Image Optimization. Priority only for above-the-fold (first 4 items).
          priority={index < 4}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        />
        {/* Subtle opacity overlay instead of blur/shadow */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-opacity duration-300" />
      </div>
      <div className="mt-4 flex flex-col gap-1 px-1">
        <h3 className="font-semibold text-black dark:text-white group-hover:text-[#2398f7] dark:group-hover:text-[#2398f7] transition-colors line-clamp-1">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
      </div>
    </Link>
  );
};

const LightNovelGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
    {LIGHT_NOVELS.map((novel, idx) => (
      <Card key={novel.id} item={novel} index={idx} hrefBase="novel" />
    ))}
  </div>
);

const ManhwaGrid = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
    {MANHWA.map((comic, idx) => (
      <Card key={comic.id} item={comic} index={idx} hrefBase="manhwa" />
    ))}
  </div>
);

// --- Main Page ---

export default function NovelLandingPage() {
  const [activeTab, setActiveTab] = useState<"light-novel" | "manhwa">("light-novel");

  const TABS = [
    { id: "light-novel", label: "Light Novel" },
    { id: "manhwa", label: "Manhwa" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 pt-24 pb-32 px-4 sm:px-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white mb-6">
            AFFAN: THE APEX PREDATOR
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            In a world where power dictates survival, Affan rises from the depths of oblivion to claim his rightful place at the summit. Witness the journey of an anomaly that defies reality itself.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-12">
          <div className="relative flex bg-black/5 dark:bg-zinc-900 p-1.5 rounded-full border border-black/5 dark:border-white/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-2.5 text-sm md:text-base font-semibold rounded-full transition-colors z-10 ${
                  activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-[#2398f7] rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 
          SOP RULE 9: DOM Rendering & Asset Pipeline.
          Strict React conditional rendering used here to ensure inactive tab 
          is completely unmounted and garbage-collected. No CSS display:none! 
        */}
        <div className="mt-8 min-h-[500px]">
          {activeTab === "light-novel" ? <LightNovelGrid /> : <ManhwaGrid />}
        </div>
        
      </div>
    </main>
  );
}
