// app/blog/page.tsx
import { supabase } from '@/lib/supabase' 
import BlogCard from '@/components/blog-card' // Sesuaikan sama nama file
import { FloatingBackButton } from "@/components/floating-back-button"
import { Guestbook } from "@/components/guestbook";

// Biar datanya fresh terus (revalidate tiap 1 menit)
export const revalidate = 60;

export default async function BlogPage() {
  
  // Langsung narik data dari tabel 'articles'
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching articles:', error)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-destructive font-semibold">Gagal narik data dari database, Jek. Cek koneksi atau tabel lu.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section - Tetap konsisten warna biru #2398f7 */}
        <div className="mb-12 sm:mb-16 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-[#2398f7]">Affan</span> Chronicle
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg border-l-4 border-[#2398f7] pl-4 italic">
            Kumpulan catatan, kejadian aneh, dan dokumentasi perjalanan di Affanverse.
          </p>
        </div>

        {/* Grid System - Responsive 1, 2, atau 3 kolom */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Nah, tambahin ": any" di dalem kurung article ini Jek */}
            {articles.map((article: any) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-border rounded-3xl opacity-60">
            <p className="text-muted-foreground font-mono italic">
              // Belum ada data di tabel articles, silakan input dulu di Supabase.
            </p>
          </div>
        )}
        
      </div>
      <FloatingBackButton />
      <Guestbook 
        variant="section" 
        pageId="chronicle" 
        title="Chronicle Logs" 
        description="Apa tanggapan lu soal artikel-artikel diatas?" 
      />
    </main>
  )
}