import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, BookText, ImageIcon, Lock } from "lucide-react"
import { DynamicChapterList } from "./catalog-client"
import { VolumeTabs } from "@/components/volume-tabs"

type Chapter = {
  id: string;
  volume: number;
  chapter_number: number;
  log_code: string;
  title: string;
  system_note: string | null;
};

type Props = {
  params: Promise<{ volume: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NovelVolumeDetail({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const volNumber = resolvedParams.volume.replace('vol-', '');
  const tabParam = resolvedSearch.tab;
  const activeTab = typeof tabParam === 'string' ? tabParam : 'ln'; 

  const { data: chapters, error } = await supabase
    .from('novel_chapters')
    .select('id, volume, chapter_number, log_code, title, system_note')
    .eq('volume', volNumber)
    .order('chapter_number', { ascending: true }) as { data: Chapter[] | null, error: any };

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="flex items-start gap-3 p-4 rounded-md border border-destructive bg-destructive/10 text-destructive font-mono text-sm max-w-md">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><p className="font-bold mb-1">[SYSTEM_ERROR]</p><p>Gagal menarik data dari database.</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      
      {/* HERO SECTION: Centered & High Contrast */}
      <div className="relative w-full h-[45vh] min-h-[350px] flex flex-col items-center justify-center overflow-hidden">
        <Image 
          src="/apexPredator.jpeg" 
          alt="Apex Predator Cover" 
          fill 
          className="object-cover object-center opacity-30 scale-105 blur-md" 
          priority 
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
        
        <div className="container relative z-10 px-4 flex flex-col items-center text-center mt-10">
          <div className="px-4 py-1.5 mb-6 border border-[#2398f7]/50 bg-[#2398f7]/20 text-[#2398f7] text-xs font-bold tracking-widest font-mono rounded backdrop-blur-sm shadow-[0_0_10px_rgba(35,152,247,0.2)]">
            VOLUME {volNumber} // STATUS: ONGOING
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6 uppercase drop-shadow-xl">
            Affan: The Apex Predator
          </h1>
          <p className="max-w-2xl text-foreground/80 text-sm md:text-base leading-relaxed italic border-l-4 border-[#2398f7] pl-4 text-left drop-shadow-md">
            "Setiap dunia yang pernah ada hanyalah baris kode. Dan aku adalah fungsi penghapus."
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION: Centered */}
      <VolumeTabs activeTab={activeTab} />
      {/* CONTENT AREA: Centered List */}
      <div className="w-full max-w-3xl px-4 py-10 pb-24 flex flex-col">
        
        {activeTab === 'ln' && (
          <DynamicChapterList chapters={chapters || []} volume={volNumber} />
        )}

        {activeTab === 'manhwa' && (
          <div className="p-16 border-2 border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <style>{`
              @keyframes glitch-anim {
                0% { transform: translate(0) }
                20% { transform: translate(-2px, 2px); text-shadow: -2px 0 red, 2px 0 #2398f7; }
                40% { transform: translate(-2px, -2px); text-shadow: 2px 0 red, -2px 0 #2398f7; }
                60% { transform: translate(2px, 2px); text-shadow: -2px 0 red, 2px 0 #2398f7; }
                80% { transform: translate(2px, -2px); text-shadow: 2px 0 red, -2px 0 #2398f7; }
                100% { transform: translate(0); text-shadow: none; }
              }
              .glitch-text { animation: glitch-anim 0.5s cubic-bezier(.25, .46, .45, .94) both; }
            `}</style>
            <Lock className="w-12 h-12 text-muted-foreground mb-4 group-hover:text-[#2398f7] transition-colors" />
            <h3 className="glitch-text text-2xl font-bold mb-2 font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500 animate-pulse">
              Data Corrupted
            </h3>
            <p className="text-muted-foreground max-w-md">Visualisasi dimensi ini sedang dalam proses rekonstruksi sistem.</p>
          </div>
        )}
      </div>
    </div>
  )
}