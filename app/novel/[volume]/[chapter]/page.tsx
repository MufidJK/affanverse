import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Suspense } from "react"
import { Terminal, ChevronLeft, ChevronRight } from "lucide-react"
import { SmartReaderNavbar, AdvancedProgressTracker } from "./reader-client"

type Props = {
  params: Promise<{ volume: string; chapter: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type Chapter = {
  id: string;
  volume: number;
  chapter_number: number;
  log_code: string;
  title: string;
  system_note: string | null;
  content: string;
};

export default async function ChapterReader({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const currentLog = resolvedParams.chapter; 
  const volNumber = resolvedParams.volume.replace('vol-', '');
  const isFocusMode = resolvedSearch.mode === 'focus'; 

  // FIX: Use cache: 'no-store' to prevent Next.js from indefinitely caching
  // large chapter text blobs in the Node.js memory heap during dev.
  const noCache = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) },
    }
  );

  // 1. Fetch Current Chapter (no-cache to prevent heap bloat)
  const { data: chapterData, error } = await noCache
    .from('novel_chapters')
    .select('*')
    .eq('volume', volNumber)
    .ilike('log_code', currentLog)
    .maybeSingle() as { data: Chapter | null, error: any };

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Terminal className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-2xl font-mono font-bold mb-2 text-foreground">ERROR 404: FRAGMENT NOT FOUND</h1>
        <Link href={`/novel/vol-${volNumber}`} className="text-[#2398f7] font-mono hover:underline mt-4">
          RETURN_TO_ARCHIVE
        </Link>
      </div>
    );
  }

  // 2. Fetch Next/Prev Chapters in PARALLEL (eliminates waterfall)
  const prevQuery = noCache
    .from('novel_chapters')
    .select('log_code')
    .eq('volume', volNumber)
    .eq('chapter_number', chapterData.chapter_number - 1)
    .maybeSingle() as unknown as Promise<{ data: { log_code: string } | null, error: any }>;

  const nextQuery = noCache
    .from('novel_chapters')
    .select('log_code')
    .eq('volume', volNumber)
    .eq('chapter_number', chapterData.chapter_number + 1)
    .maybeSingle() as unknown as Promise<{ data: { log_code: string } | null, error: any }>;

  const [{ data: prevChapter }, { data: nextChapter }] = await Promise.all([prevQuery, nextQuery]);

  // Pre-compute focus toggle URL at the server level
  const currentPath = `/novel/vol-${volNumber}/${currentLog}`;
  const focusToggleUrl = isFocusMode ? currentPath : `${currentPath}?mode=focus`;

  // Pre-process content paragraphs at server level (avoid inline split in JSX)
  const paragraphs = chapterData.content.split('\n');

  return (
    <div className={`min-h-screen transition-colors duration-700 selection:bg-[#2398f7] selection:text-white ${
      isFocusMode ? 'bg-[#FDF6E3] text-[#3D2B1F]' : 'bg-background text-zinc-700 dark:text-zinc-300'
    }`}>
      
      <Suspense fallback={null}>
        <SmartReaderNavbar 
          volNumber={volNumber} 
          isFocusMode={isFocusMode}
          focusToggleUrl={focusToggleUrl}
        />
      </Suspense>
      <AdvancedProgressTracker logCode={chapterData.log_code} volume={volNumber} />

      {/* CONTENT AREA: The Golden Ratio Centering */}
      <article id="novel-article-content" className="w-full max-w-[65ch] mx-auto flex flex-col items-center px-4 sm:px-6 mt-20 pb-24">
        
        {/* Header Chapter */}
        <header className={`mb-16 text-center transition-opacity duration-700 w-full pt-12 ${isFocusMode ? 'opacity-80' : 'opacity-100'}`}>
          <div className={`inline-block px-3 py-1 mb-6 border text-xs font-bold font-mono rounded ${
            isFocusMode ? 'border-[#2398f7]/40 text-[#2398f7] bg-[#2398f7]/5' : 'border-[#2398f7]/30 text-[#2398f7] bg-[#2398f7]/10'
          }`}>
            CHAPTER {chapterData.chapter_number} // {chapterData.log_code}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-8 leading-tight">
            {chapterData.title}
          </h1>
          
          {chapterData.system_note && (
            <div className={`p-6 rounded-lg border-l-2 border-[#2398f7] text-left w-full ${
              isFocusMode ? 'bg-[#3D2B1F]/5' : 'bg-muted/30'
            }`}>
              <p className={`text-sm md:text-base font-mono italic ${isFocusMode ? 'text-[#3D2B1F]/80' : 'text-muted-foreground'}`}>
                {chapterData.system_note}
              </p>
            </div>
          )}
        </header>

        {/* Isi Novel — pre-processed at server level */}
        <div className="w-full font-serif text-lg md:text-xl leading-loose whitespace-pre-wrap transition-colors">
          {paragraphs.map((para: string, i: number) => {
            if (!para.trim()) return <br key={i} />;
            return <p key={i} id={`frag-${i}`} className="mb-6 indent-8">{para}</p>;
          })}
        </div>

        {/* BOTTOM NAVIGATION (NEXT / PREV) */}
        <div className={`w-full mt-24 pt-8 flex items-center justify-between transition-colors duration-700 ${
          isFocusMode ? 'border-t border-[#3D2B1F]/10' : 'border-t border-border'
        }`}>
          {/* Tombol Previous */}
          {prevChapter ? (
            <Link 
              href={`/novel/vol-${volNumber}/${prevChapter.log_code.toLowerCase()}${isFocusMode ? '?mode=focus' : ''}`}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-lg transition-all hover:-translate-x-1 ${
                isFocusMode ? 'bg-[#3D2B1F]/5 text-[#3D2B1F] hover:bg-[#2398f7] hover:text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              <ChevronLeft size={18} /> PREV
            </Link>
          ) : (
            <div className={`px-4 py-2 font-bold text-sm cursor-not-allowed ${isFocusMode ? 'text-[#3D2B1F]/30' : 'text-muted-foreground/30'}`}>
              START OF LOG
            </div>
          )}

          <div className={`text-xs font-mono font-bold ${isFocusMode ? 'text-[#3D2B1F]/20' : 'text-muted-foreground/30'}`}>
            ///
          </div>

          {/* Tombol Next */}
          {nextChapter ? (
            <Link 
              href={`/novel/vol-${volNumber}/${nextChapter.log_code.toLowerCase()}${isFocusMode ? '?mode=focus' : ''}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#2398f7]/10 hover:bg-[#2398f7]/20 border border-[#2398f7]/30 text-[#2398f7] font-bold text-sm rounded-lg transition-all hover:translate-x-1 shadow-sm"
            >
              NEXT <ChevronRight size={18} />
            </Link>
          ) : (
            <div className={`px-4 py-2 font-bold text-sm cursor-not-allowed ${isFocusMode ? 'text-[#3D2B1F]/30' : 'text-muted-foreground/30'}`}>
              END OF ARCHIVE
            </div>
          )}
        </div>

      </article>
    </div>
  )
}