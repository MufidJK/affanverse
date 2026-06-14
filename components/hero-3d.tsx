"use client"

import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect, MouseEvent } from "react"

const HERO_IMAGES = [
  '/affan-no-bg-1.png',
  '/affan-no-bg-2.png',
  '/affan-no-bg-3.png',
  '/affan-no-bg-4.png',
  '/affan-no-bg-5.png'
]

export function Hero3DEffect() {
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Auto-cycle logic strictly managed with cleanup (RULE 2)
  useEffect(() => {
    if (isHovered) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [isHovered]);

  // Spring animations for smooth follow (Damping dinaikin dikit biar gak terlalu liar)
  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Map mouse position to rotation values
  const rotateX = useTransform(springY, [-1, 1], [15, -15])
  const rotateY = useTransform(springX, [-1, 1], [-15, 15])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
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
        className="transform-gpu"
        style={{ transform: "translateZ(0)" }} // Paksa masuk GPU layer
      >
        {/* Inner Wrapper: Interactive Tilt Tracking */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={handleMouseLeave}
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: "preserve-3d",
          }}
          className="relative w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-3xl overflow-visible touch-none cursor-pointer transform-gpu"
        >
          {/* Background card: GANTI backdrop-blur-lg jadi warna solid semi-transparan biar enteng */}
          <div 
            className="absolute inset-0 rounded-3xl bg-secondary/80 dark:bg-zinc-900/90 border border-[#2398f7]/30 shadow-xl transition-all duration-300"
            style={{ transform: "translateZ(-20px)" }}
          />
          
          {/* Elegant Image Floating Layout */}
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center overflow-visible transition-transform duration-300 ease-out transform-gpu"
            style={{ 
              transform: isHovered ? "translateZ(80px) scale(1.05)" : "translateZ(30px) scale(1)",
            }}
          >
            <div className="relative w-full h-full scale-[1.3] -translate-y-[12%] flex items-center justify-center pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center transform-gpu will-change-transform"
                >
                  <Image
                    src={HERO_IMAGES[currentIndex]}
                    alt={`Affan portrait ${currentIndex + 1}`}
                    fill
                    className="object-contain object-center"
                    priority={currentIndex === 0}
                    sizes="(max-width: 768px) 300px, 400px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Glow effect on hover (Efek ini udah cukup buat ngasih kesan 'shadow' yang nyala tanpa bikin GPU nangis) */}
          <div 
            className="absolute inset-0 -z-10 rounded-3xl bg-[#2398f7]/20 blur-2xl transition-opacity duration-500 pointer-events-none"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}