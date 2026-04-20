import { supabase } from "@/lib/supabase"
import { FloatingBackButton } from "@/components/floating-back-button"
import { FolderX, ImageOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
                className="overflow-hidden rounded-2xl bg-card border border-black/5 dark:border-white/5 flex flex-col group transition-all duration-300 hover:shadow-md hover:border-black/10 dark:hover:border-white/10"
              >
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                  {item.media_type === "video" ? (
                    <video 
                      src={item.media_url} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <img 
                      src={item.media_url} 
                      alt={item.title || "Archive Image"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                  )}
                  {item.media_type && (
                     <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wider z-10 flex items-center gap-1">
                        {item.media_type}
                     </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm md:text-base truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
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
