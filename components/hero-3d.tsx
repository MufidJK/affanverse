"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import { useState, MouseEvent } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero3DEffect() {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring animations for smooth follow
  const springConfig = { damping: 20, stiffness: 200 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Map mouse position to rotation values
  const rotateX = useTransform(springY, [-1, 1], [15, -15])
  const rotateY = useTransform(springX, [-1, 1], [-15, 15])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Normalize coordinates from -1 to 1 based on center of the div
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 py-12 md:py-24">
      <div className="flex-1 space-y-8 text-center md:text-left">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
          Hi, I'm <span className="text-primary">Affan</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px] mx-auto md:mx-0 font-light leading-relaxed">
          A Full Stack Engineer crafting minimalist web apps and leading elegant digital experiences.
        </p>
        <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
          <Button asChild size="lg" className="px-8 text-md shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <Link href="/projects">View Projects</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 text-md border-primary/20 hover:bg-primary/5 transition-transform active:scale-95">
            <Link href="/contact">Contact Me</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex justify-center perspective-[1200px]" style={{ perspective: "1200px" }}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: "preserve-3d",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-[280px] h-[380px] md:w-[350px] md:h-[450px] rounded-3xl overflow-visible touch-none cursor-pointer"
        >
          {/* Background card with glass effect */}
          <div 
            className="absolute inset-0 rounded-3xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-2xl transition-all duration-300"
            style={{ transform: "translateZ(-20px)" }}
          />
          
          {/* Image Floating */}
          <div 
            className="absolute inset-0 z-10 p-4 transition-transform duration-300 ease-out flex items-end justify-center"
            style={{ 
              transform: isHovered ? "translateZ(80px) scale(1.05)" : "translateZ(0px) scale(1)",
            }}
          >
            <Image
              src="/affan-cutout.png"
              alt="Affan Portrait"
              width={400}
              height={500}
              className="object-contain h-full w-full pointer-events-none drop-shadow-2xl"
              priority
            />
          </div>
          
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-3xl transition-opacity duration-500 pointer-events-none"
            style={{ opacity: isHovered ? 0.8 : 0.2 }}
          />
        </motion.div>
      </div>
    </div>
  )
}
