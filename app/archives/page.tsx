import { supabase } from "@/lib/supabase"
import { FloatingBackButton } from "@/components/floating-back-button"
import { FolderX, ImageOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SmartMedia from "@/components/smart-media"

export default async function ArchivesPage() {
  const { data: archives, error } = await supabase
    .from("gallery")
    .select("*")
    .contains("sections", ["main_archive"])
    .order("created_at", { ascending: true })

  const hasData = archives && archives.length > 0;

  return (
    <div className="min-h-screen pb-24 relative">
      <div className="container mx-auto px-4 sm:px-8 pt-12 md:pt-20">
        
        {/* Page Header */}
        <div className="text-left max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Arsip Multiversal Affan<span className="text-[#2398f7]">.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Seluruh jejak, momen, dan anomali Affan yang terekam dalam ruang dan waktu.
          </p>
        </div>

        {/* Content Area */}
        {!hasData ? (
          <div className="flex flex-col items-center justify-center text-center mt-24">
            <div className="bg-muted/50 p-6 rounded-full mb-6">
              <FolderX className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Arsip Multiversal Affan Kosong</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Sepertinya arsip ini belum terisi oleh anomali apapun. Silakan tunggu pembaruan sistem.
            </p>
            <Link href="/" className="px-6 py-2 bg-[#2398f7] hover:bg-[#1a80d4] text-white font-medium rounded-full transition-colors duration-300">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
            {archives.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col bg-gray-50 dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden"
              >
                <figure className="aspect-[3/4] relative w-full overflow-hidden bg-black/5 dark:bg-white/5">
                  <SmartMedia src={item.media_url} type={item.type || item.media_type} alt={item.title || 'Archive Media'} />
                </figure>
                
                <div className="p-4 flex flex-col gap-2">
                  <span className="w-fit px-2.5 py-0.5 mb-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2398f7] text-[10px] font-semibold uppercase tracking-wider">{item.type || item.media_type || 'Image'}</span>
                  <h3 className="font-semibold text-sm md:text-base">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingBackButton />
    </div>
  )
}
