/**
 * Realistic skeleton loader that mimics the actual reader layout.
 * Shows header skeleton + paragraph line skeletons for perceived performance.
 */
export default function LoadingChapter() {
  return (
    <div className="min-h-screen bg-background">
      {/* Reader Navbar Skeleton */}
      <div className="fixed top-16 left-0 w-full h-16 z-50 flex justify-between items-center px-4 sm:px-8 bg-background/60 backdrop-blur-md border-b border-border/30">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-7 w-28 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Content Skeleton */}
      <article className="w-full max-w-[65ch] mx-auto flex flex-col items-center px-4 sm:px-6 mt-20 pb-24">
        
        {/* Chapter Header Skeleton */}
        <header className="mb-16 text-center w-full pt-12 flex flex-col items-center">
          {/* Badge */}
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-6" />
          {/* Title */}
          <div className="h-10 w-4/5 bg-muted rounded animate-pulse mb-3" />
          <div className="h-10 w-3/5 bg-muted rounded animate-pulse mb-8" />
          {/* System Note */}
          <div className="w-full p-6 rounded-lg bg-muted/30 border-l-2 border-muted">
            <div className="h-4 w-full bg-muted/60 rounded animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-muted/60 rounded animate-pulse" />
          </div>
        </header>

        {/* Paragraph Skeletons — mimics real content lines */}
        <div className="w-full space-y-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-full bg-muted/40 rounded animate-pulse" />
              <div className="h-5 w-full bg-muted/40 rounded animate-pulse" />
              <div 
                className="h-5 bg-muted/40 rounded animate-pulse" 
                style={{ width: `${55 + Math.sin(i * 1.7) * 30}%` }} 
              />
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}
