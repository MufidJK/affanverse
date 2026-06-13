import { supabase } from "@/lib/supabase";
import NovelTabs, { NovelItem } from "./NovelTabs";

// SOP RULE: Database Caching. Utilizing Next.js built-in caching via revalidate (ISR).
// Avoids blindly using cache: 'no-store' on rarely updated data.
export const revalidate = 3600;

export default async function NovelLandingPage() {
  const { data: chapters, error } = await supabase
    .from("novel_chapters")
    .select("volume, coverl_url");

  const volumesMap = new Map<number, string>();
  if (chapters && !error) {
    (chapters as any[]).forEach((ch) => {
      // Accommodate both `cover_url` and `coverl_url` just in case the DB column is renamed to match the instruction exactly
      const coverUrl = ch.cover_url || ch.coverl_url;
      if (ch.volume && coverUrl && !volumesMap.has(ch.volume)) {
        volumesMap.set(ch.volume, coverUrl);
      }
    });
  }

  const sortedVolumes = Array.from(volumesMap.keys()).sort((a, b) => a - b);
  
  const volumeTitles: Record<number, string> = {
    1: "The System Begins",
    2: "The Hunt Evolves",
    3: "The God Killer",
    4: "Reality Breaks",
    5: "The Predator Ascends",
    6: "Beyond Everything",
    7: "The End of All Authority",
  };

  const fetchedNovels: NovelItem[] = sortedVolumes.map((vol) => ({
    id: `vol-${vol}`,
    title: `Volume ${vol}`,
    description: volumeTitles[vol] || `The saga of Volume ${vol}`,
    cover: volumesMap.get(vol) as string,
  }));

  // Fallback to empty array if no volumes were found, NovelTabs can handle it
  const lightNovels = fetchedNovels.length > 0 ? fetchedNovels : [];

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

        {/* Volume Grid */}
        <NovelTabs lightNovels={lightNovels} />
        
      </div>
    </main>
  );
}
