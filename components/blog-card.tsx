import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string
  published_at: string
}

export default function BlogCard({ article }: { article: Article }) {
  const date = article.published_at ? new Date(article.published_at) : new Date()

  return (
    <Card className="flex flex-col h-full overflow-hidden border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-[#2398f7]/50 transition-colors duration-300 group">
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            unoptimized={true} 
            className="object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col flex-grow p-5 sm:p-6">
        <div className="flex items-center text-xs text-muted-foreground mb-3 font-medium">
          <CalendarDays className="w-4 h-4 mr-2 text-[#2398f7]" />
          {format(date, 'd MMMM yyyy', { locale: id })}
        </div>

        <Link href={`/blog/${article.slug}`} className="group-hover:text-[#2398f7] transition-colors">
          <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
            {article.title}
          </h2>
        </Link>

        <p className="text-sm text-muted-foreground mb-6 flex-grow">
          {article.excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-border">
        {/* Tambahin 'group' di Link-nya juga boleh biar hover area-nya pas di teksnya */}
        <Link 
            href={`/blog/${article.slug}`} 
            className="inline-flex items-center text-sm font-semibold text-[#2398f7] hover:text-[#2398f7]/80 transition-colors group"
        >
            Read more 
            {/* Ikon panah dikasih animasi gila */}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 ease-in-out group-hover:translate-x-1.5" />
        </Link>
        </div>
      </CardContent>
    </Card>
  )
}