"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export type NovelItem = {
  id: string;
  title: string;
  description: string;
  cover: string;
};

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

export default function NovelTabs({ lightNovels }: { lightNovels: NovelItem[] }) {
  return (
    <div className="mt-8 min-h-[500px]">
      <LightNovelGrid novels={lightNovels} />
    </div>
  );
}
