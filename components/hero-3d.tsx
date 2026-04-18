"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import { useState, MouseEvent } from "react"

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
    <div className="flex justify-center perspective-[1200px] w-full" style={{ perspective: "1200px" }}>
      {/* Outer Wrapper: Continuous Idle Floating Animation */}
      <motion.div
        animate={isHovered ? { y: 0 } : { y: [-10, 10, -10] }}
        transition={{ repeat: isHovered ? 0 : Infinity, duration: 4, ease: "easeInOut" }}
      >
        {/* Inner Wrapper: Interactive Tilt Tracking */}
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
          className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-3xl overflow-visible touch-none cursor-pointer"
        >
          {/* Background card with glass effect */}
          <div 
            className="absolute inset-0 rounded-3xl bg-secondary/30 dark:bg-[#2398f7]/5 border border-[#2398f7]/20 backdrop-blur-lg shadow-2xl transition-all duration-300"
            style={{ transform: "translateZ(-20px)" }}
          />
          
          {/* Elegant Image Floating Layout */}
          <div 
            className="absolute inset-0 z-10 transition-transform duration-300 ease-out flex items-center justify-center overflow-visible"
            style={{ 
              transform: isHovered ? "translateZ(80px) scale(1.05)" : "translateZ(30px) scale(1)",
            }}
          >
            {/* Added extra scale and negative Y translation to push the character upwards to true visual center */}
            <div className="relative w-full h-full scale-[1.3] -translate-y-[12%] flex items-center justify-center pointer-events-none">
              <Image
                src="/affannobg.png"
                alt="Affan portrait"
                fill
                className="object-contain object-center drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 300px, 400px"
              />
            </div>
          </div>
          
          {/* Glow effect on hover */}
          <div 
            className="absolute inset-0 -z-10 rounded-3xl bg-[#2398f7]/20 blur-3xl transition-opacity duration-500 pointer-events-none"
            style={{ opacity: isHovered ? 0.8 : 0.0 }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
