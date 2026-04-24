// app/blog/[slug]/page.tsx
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'
import { FloatingBackButton } from "@/components/floating-back-button-blog"

// Definisikan interface Article
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null; 
  published_at: string | null; 
}

// PERUBAHAN PENTING: Di Next.js 15, params itu wujudnya Promise
interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Bawaan Next.js 15: props-nya kita terima dulu
export default async function ArticleDetail(props: PageProps) {
  // 1. KITA AWAIT DULU PARAMS-NYA (Ini obat buat penyakit lu!)
  const params = await props.params;
  const currentSlug = params.slug;

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', currentSlug)
    .single()

  // Kalau slug ngasal atau data beneran gak ada, balikin halaman 404
  if (error || !data) {
    return notFound()
  }

  const article = data as Article;
  const date = article.published_at ? new Date(article.published_at) : new Date()

  return (
    <main className="min-h-screen bg-background py-16 sm:py-24">
      <article className="container mx-auto px-4 max-w-3xl">
        
        <header className="mb-8 sm:mb-12">
          <div className="flex items-center text-sm text-muted-foreground mb-4 font-medium">
            <CalendarDays className="w-4 h-4 mr-2 text-[#2398f7]" />
            {format(date, 'EEEE, d MMMM yyyy', { locale: id })}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {article.title}
          </h1>
        </header>

        {article.image_url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 shadow-lg border border-border">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              unoptimized={true} 
              className="object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
          {article.content}
        </div>

      </article>
      <FloatingBackButton />
    </main>
  )
}