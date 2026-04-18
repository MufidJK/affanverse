import { Hero3DEffect } from "@/components/hero-3d";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-8 flex-1 flex items-center justify-center py-16 lg:py-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full max-w-6xl">
        
        {/* Left Side: Text Content */}
        <div className="flex flex-col space-y-8 text-center lg:text-left order-2 lg:order-1 relative z-10">
          <div className="space-y-4">
            <h1 className="scroll-m-20 text-5xl font-extrabold tracking-tight lg:text-7xl">
              Hi, I'm <span className="text-[#3b82f6]">Affan</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              A Full Stack Engineer crafting minimalist web apps and leading elegant digital experiences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 text-base shadow-lg shadow-sky-500/20 bg-[#3b82f6] hover:bg-sky-600 text-white">
              <Link href="/projects">
                View Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 text-base border-sky-500/20 text-[#3b82f6] hover:bg-sky-500/5">
              <Link href="/contact">
                Contact Me
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Hero Image & 3D Effect */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center">
          {/* Subtle Glowing Premium Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-sky-500/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <Hero3DEffect />
        </div>

      </div>
    </div>
  );
}
