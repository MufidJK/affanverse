import { createClient } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

// Mock data fallback - casual Indonesian copywriting style
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

/**
 * Determine the media type from a URL string.
 * - Checks the `type` column first (from DB)
 * - Falls back to URL pattern matching
 */
function getMediaType(
  url: string,
  typeHint?: string | null
): "video" | "youtube" | "image" {
  if (typeHint === "video" || typeHint === "youtube") {
    // YouTube links need special handling — can't use <video> tag
    if (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("youtube.com/shorts")
    ) {
      return "youtube";
    }
    return "video";
  }

  // Pattern match the URL itself
  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("youtube.com/shorts")
  ) {
    return "youtube";
  }

  if (url.match(/\.(mp4|webm|mov|ogg)$/i)) {
    return "video";
  }

  return "image";
}

/**
 * Extract a YouTube embed URL from various YouTube link formats.
 * Supports: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID
 */
function getYouTubeEmbedUrl(url: string): string | null {
  // youtube.com/shorts/ID
  const shortsMatch = url.match(
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  );
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

  // youtube.com/watch?v=ID
  const watchMatch = url.match(
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return null;
}

// Fetch stories from Supabase — gracefully degrades to mock data
async function getStories() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) return MOCK_STORIES;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try multiple possible table names
    for (const table of ["stories", "gallery", "memories"]) {
      try {
        const { data, error } = await supabase.from(table).select("*");
        if (!error && data && data.length > 0) return data;
      } catch {
        continue;
      }
    }

    return MOCK_STORIES;
  } catch {
    return MOCK_STORIES;
  }
}

/**
 * Renders the appropriate media element based on URL type.
 */
function MediaRenderer({
  url,
  type,
  alt,
  heightClass,
}: {
  url: string;
  type: string | null | undefined;
  alt: string;
  heightClass: string;
}) {
  const mediaType = getMediaType(url, type);

  if (mediaType === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) {
      return (
        <div className={`relative w-full ${heightClass} overflow-hidden`}>
          <iframe
            src={`${embedUrl}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&showinfo=0&playlist=${embedUrl.split("/").pop()}`}
            title={alt}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      );
    }
  }

  if (mediaType === "video") {
    return (
      <div className={`relative w-full ${heightClass} overflow-hidden`}>
        <video
          src={url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Default: image (Next.js <Image> component)
  return (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}

export async function AffanStories() {
  const stories = await getStories();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-20 lg:py-28">
      {/* Section Heading */}
      <div className="text-center mb-12 space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-[#3b82f6]">
          Stories
        </p>
        <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Get started with our{" "}
          <span className="text-[#3b82f6]">best Affan stories</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Behind the code, behind the screen — moments that shape the journey.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {stories.map((story: any, index: number) => {
          const tags = Array.isArray(story.tags)
            ? story.tags
            : typeof story.tags === "string"
              ? story.tags.split(",")
              : story.type
                ? [story.type.charAt(0).toUpperCase() + story.type.slice(1)]
                : ["Story"];

          // Alternate image aspect ratios for visual variety
          const heightClass =
            index % 3 === 0
              ? "h-64"
              : index % 3 === 1
                ? "h-48"
                : "h-56";

          // Resolve the media URL — support both `media_url` and `image_url` field names
          const mediaUrl = story.media_url || story.image_url || "";

          // Resolve description — DB has no description column, so use title as context
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
              className="break-inside-avoid mb-6 overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 group bg-white dark:bg-zinc-900"
            >
              {/* Media */}
              {mediaUrl ? (
                <MediaRenderer
                  url={mediaUrl}
                  type={story.type}
                  alt={story.title || "Story media"}
                  heightClass={heightClass}
                />
              ) : (
                <div
                  className={`relative w-full ${heightClass} overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/20 dark:to-sky-800/20" />
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 px-5 pt-4">
                {tags.slice(0, 3).map((tag: string, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="font-normal text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors border-none"
                  >
                    {typeof tag === "string" ? tag.trim() : tag}
                  </Badge>
                ))}
              </div>

              {/* Title & Description */}
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-lg font-bold tracking-tight leading-snug group-hover:text-[#3b82f6] transition-colors">
                  {story.title || "Untitled Story"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
