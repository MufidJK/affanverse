"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SmartMedia from "@/components/smart-media";

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

// ─── Data Fetcher (uses shared singleton — no more zombie clients) ──
async function fetchStories() {
  try {
    for (const table of ["stories", "gallery", "memories"] as const) {
      try {
        const { data, error } = await (supabase
          .from(table as any)
          .select("*")
          .contains("sections", ["stories"])
          .order("created_at", { ascending: false }) as any);
        if (!error && data && (data as any[]).length > 0) return data as any[];
      } catch {
        continue;
      }
    }
    return MOCK_STORIES;
  } catch {
    return MOCK_STORIES;
  }
}

// ─── Main Stories Component ──────────────────────────────────────────
export function AffanStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchStories().then((res) => {
      if (mounted) {
        setStories(res);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
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
          "Every photo has a story. Every video has a reason. Some of those reasons are still unclear."
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
                  className="shadow-sm border border-black/5 dark:border-white/10 bg-gray-100/80 dark:bg-zinc-900/50 overflow-hidden rounded-[24px] p-0"
                >
                  {/* Bagian Media */}
                  {mediaUrl ? (
                    <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-t-[24px] overflow-hidden bg-black/5 dark:bg-zinc-800/50">
                      <SmartMedia
                        src={mediaUrl}
                        type={story.type}
                        alt={story.title || "Story media"}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[3/4] mt-0 pt-0 rounded-t-[24px] overflow-hidden bg-muted/20">
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
                  
                  {/* 👇 BAGIAN TEXT YANG UDAH DI-FIX 👇 */}
                  <CardContent className="px-6 pb-6 pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
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