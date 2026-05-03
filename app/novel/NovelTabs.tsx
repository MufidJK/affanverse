"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export type NovelItem = {
  id: string;
  title: string;
  description: string;
  cover: string;
};

const MANHWA = [
  { id: "ch-1-10", title: "Chapters 1-10", description: "Dawn", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+1-10" },
  { id: "ch-11-20", title: "Chapters 11-20", description: "Rise", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+11-20" },
  { id: "ch-21-30", title: "Chapters 21-30", description: "Clash", cover: "https://placehold.co/600x800/f8fafc/0f172a?text=Ch+21-30" },
];

const Card = ({ item, index, hrefBase }: { item: NovelItem; index: number; hrefBase: string }) => {
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
          unoptimized
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

const LightNovelGrid = ({ novels }: { novels: NovelItem[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
    {novels.map((novel, idx) => (
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

export default function NovelTabs({ lightNovels }: { lightNovels: NovelItem[] }) {
  const [activeTab, setActiveTab] = useState<"light-novel" | "manhwa">("light-novel");

  const TABS = [
    { id: "light-novel", label: "Light Novel" },
    { id: "manhwa", label: "Manhwa" },
  ] as const;

  return (
    <>
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
        {activeTab === "light-novel" ? <LightNovelGrid novels={lightNovels} /> : <ManhwaGrid />}
      </div>
    </>
  );
}
