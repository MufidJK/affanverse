import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { DynamicChapterList } from "./catalog-client"

type Chapter = {
  id: string;
  volume: number;
  chapter_number: number;
  slug: string;
  title: string;
};

type Props = {
  params: Promise<{ volume: string }>;
};

export default async function AmbasukeVolumeDetail({ params }: Props) {
  const resolvedParams = await params;
  
  const volNumber = resolvedParams.volume.replace('vol-', '');

  const { data: chapters, error } = await supabase
    .from('ambasuke_chapters')
    .select('id, volume, chapter_number, slug, title')
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
          src="/ambasuke.jpg" 
          alt="Ambasuke Cover" 
          fill 
          className="object-cover object-center opacity-30 scale-105 blur-md" 
          priority 
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
        
        <div className="container relative z-10 px-4 flex flex-col items-center text-center mt-10">
          <div className="px-4 py-1.5 mb-6 border border-[#2398f7]/50 bg-[#2398f7]/20 text-[#2398f7] text-xs font-bold tracking-widest font-mono rounded backdrop-blur-sm shadow-[0_0_10px_rgba(35,152,247,0.2)]">
            VOLUME {volNumber} // LIGHT NOVEL
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight mb-6 uppercase drop-shadow-xl">
            AMBASUKE
          </h1>
          <p className="max-w-2xl text-foreground/80 text-sm md:text-base leading-relaxed italic border-l-4 border-[#2398f7] pl-4 text-left drop-shadow-md">
            "Shattered remnants of what could have been."
          </p>
        </div>
      </div>

      {/* CONTENT AREA: Centered List */}
      <div className="w-full max-w-3xl px-4 py-10 pb-24 flex flex-col mt-8">
        <DynamicChapterList chapters={chapters || []} volume={volNumber} />
      </div>
    </div>
  )
}
