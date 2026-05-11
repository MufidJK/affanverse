import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export const revalidate = 3600;

export default async function AmbasukeLandingPage() {
  const { data: chapters, error } = await supabase
    .from("ambasuke_chapters")
    .select("volume, cover_url");

  const volumesMap = new Map<number, string>();
  if (chapters && !error) {
    (chapters as any[]).forEach((ch) => {
      const coverUrl = ch.cover_url;
      if (ch.volume && coverUrl && !volumesMap.has(ch.volume)) {
        volumesMap.set(ch.volume, coverUrl);
      }
    });
  }

  const sortedVolumes = Array.from(volumesMap.keys()).sort((a, b) => a - b);
  
  const volumeTitles: Record<number, string> = {
    1: "Si Hitam",
    2: "Petualangan Absurd",
    3: "W Ambasuke",
    4: "Ambasuke Daisuki",
    5: "Menjelah Waktu Sama si Rusdi",
    6: "Teror Terong",
    7: "Ambasuke vs Author",
  };

  const fetchedVolumes = sortedVolumes.map((vol) => ({
    id: `vol-${vol}`,
    title: `Volume ${vol}`,
    description: volumeTitles[vol] || `Ambasuke Volume ${vol}`,
    cover: volumesMap.get(vol) as string,
  }));

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 pt-24 pb-32 px-4 sm:px-8">
      <div className="container mx-auto max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-black dark:text-white mb-6 uppercase">
            AMBASUKE
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-[#2398f7] pl-4 inline-block text-left">
            "A spin-off tale from the fragments of reality."
          </p>
        </div>

        {/* Volume Grid */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
            <BookOpen className="w-6 h-6 text-[#2398f7]" />
            <h2 className="text-2xl font-bold text-foreground">Light Novel Volumes</h2>
          </div>

          {fetchedVolumes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              No volumes available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {fetchedVolumes.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/ambasuke/${novel.id}`}
                  className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-border hover:border-[#2398f7] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(35,152,247,0.2)] hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                    {novel.cover ? (
                      <Image
                        src={novel.cover}
                        alt={novel.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <BookOpen className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                      <div className="text-xs font-mono font-bold text-[#2398f7] mb-2 tracking-wider">
                        {novel.title}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {novel.description}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
