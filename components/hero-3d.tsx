"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import { useState, MouseEvent } from "react"

export function Hero3DEffect() {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

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
              {/* IMAGE: HAPUS drop-shadow-2xl dan CSS hover scale, biarin Framer yang ngatur scale di div atasnya */}
              <Image
                src="/affannobg.png"
                alt="Affan portrait"
                fill
                className="object-contain object-center"
                priority
                sizes="(max-width: 768px) 300px, 400px"
              />
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