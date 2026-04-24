"use client"

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// List Hantu Lu
const MONSTERS = ['/SCP-087-B.webp', '/fnaf.webp', '/SCP-067.webp']

export function JumpscareOverlay() {
  const { theme } = useTheme()
  const [scares, setScares] = useState<{ img: string, style: any }[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (theme !== 'glitch') {
      setScares([])
      // Bersihin class kalau user matiin glitch
      document.body.classList.remove('glitch-invert')
      return
    }

    // 1. MESIN SWAP TEMA (Tiap 2.5 Detik)
    // Ini yang bikin Hitam ke Putih tanpa ngerusak CSS lu!
    const swapInterval = setInterval(() => {
      document.body.classList.toggle('glitch-invert')
    }, 2500)

    // 2. MESIN JUMPSCARE (Tiap 5 Detik)
    const jumpInterval = setInterval(() => {
      // 15% peluang Fullscreen, 85% peluang Random Sedang/Kecil
      const isFullscreenMode = Math.random() > 0.85

      if (isFullscreenMode) {
        // Mode Fullscreen
        const img = MONSTERS[Math.floor(Math.random() * MONSTERS.length)]
        setScares([{
          img,
          style: {
            position: 'fixed', // Pasti stay di layar karena bug CSS udah diculik
            top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 999999, backgroundImage: `url("${img}")`, backgroundSize: 'cover',
            backgroundPosition: 'center', pointerEvents: 'none', filter: 'contrast(1.5) brightness(1.2)'
          }
        }])
      } else {
        // Mode Acak (1 sampai 3 Hantu)
        const numMonsters = Math.floor(Math.random() * 3) + 1
        const shuffled = [...MONSTERS].sort(() => 0.5 - Math.random()).slice(0, numMonsters)
        
        // Sektor biar gak numpuk
        const quadrants = [
          { top: 5, left: 5 },   
          { top: 5, left: 55 },  
          { top: 50, left: 5 },  
          { top: 50, left: 55 }  
        ].sort(() => 0.5 - Math.random())

        const scatterScares = shuffled.map((img, idx) => {
          // Ukuran Acak 20vw sampe 45vw
          const sizeVw = Math.floor(Math.random() * 25) + 20 

          // Batas aman biar gak nyeplos ke luar layar
          const maxPosition = 100 - sizeVw
          const topPos = Math.min(quadrants[idx].top + (Math.random() * 10), maxPosition)
          const leftPos = Math.min(quadrants[idx].left + (Math.random() * 10), maxPosition)

          return {
            img,
            style: {
              position: 'fixed',
              top: `${topPos}vh`,
              left: `${leftPos}vw`,
              width: `${sizeVw}vw`,
              height: `${sizeVw}vw`, 
              zIndex: 999999 + idx,
              backgroundImage: `url("${img}")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              pointerEvents: 'none',
              filter: 'contrast(1.5) brightness(1.2)'
            }
          }
        })
        setScares(scatterScares)
      }

      // Hilang dalam 200ms
      setTimeout(() => setScares([]), 200)

    }, 5000)

    return () => {
      clearInterval(swapInterval)
      clearInterval(jumpInterval)
      document.body.classList.remove('glitch-invert')
    }
  }, [theme])

  if (!mounted || scares.length === 0) return null

  return (
    <>
      {scares.map((scare, idx) => (
        <div key={idx} style={scare.style} />
      ))}
    </>
  )
}