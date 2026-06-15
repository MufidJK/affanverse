"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import dynamic from "next/dynamic"
import { FloatingBackButton } from "@/components/floating-back-button"

import { X } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"

// SOP Rule 8: Lazy load heavy components below the fold
const Guestbook = dynamic(
  () => import("@/components/guestbook").then((mod) => mod.Guestbook),
  { ssr: false }
)

interface MinigameData {
  id: string
  title: string
  thumbnail: string
  tags: string[]
  description: string
  playRoute: string
}

/**
 * Mockup games — shown only when no real games exist yet.
 * Kept in code so the hub never looks empty during development.
 */
const MOCKUP_GAMES: MinigameData[] = [
  {
    id: "abyss-runner",
    title: "The Abyss Runner",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    tags: ["Action", "Endless", "Void"],
    description: "Run as far as you can through the crushing void. How long until the darkness consumes you?",
    playRoute: "/minigame/abyss-runner",
  },
  {
    id: "void-protocol",
    title: "Void Protocol: Alpha",
    thumbnail: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=800&auto=format&fit=crop",
    tags: ["Strategy", "Lore", "Simulation"],
    description: "Manage the containment protocols of a rogue dimension. Every decision ripples through the timeline.",
    playRoute: "/minigame/void-protocol",
  },
  {
    id: "echoes-forgotten",
    title: "Echoes of the Forgotten",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    tags: ["Puzzle", "Atmospheric"],
    description: "Solve fragments of lost memories scattered across the astral plane.",
    playRoute: "/minigame/echoes-forgotten",
  },
]

/**
 * Real, playable games — these take priority over mockups.
 */
const REAL_GAMES: MinigameData[] = [
  {
    id: "flappy-affan",
    title: "Flappy Affan",
    thumbnail: "https://res.cloudinary.com/dcsh47583/image/upload/v1777988094/flappyAffan_x68vkz.jpg",
    tags: ["Arcade", "Casual", "Flappy"],
    description: "Dodge the glitch pillars and flap your way to the top of the leaderboard. How far can Affan fly? 67 miles wowkwkwkk",
    playRoute: "/minigame/flappy-affan",
  },
  {
    id: "affan-strike",
    title: "Affan Strike",
    thumbnail: "https://res.cloudinary.com/dcsh47583/image/upload/v1778240766/affanStrike_uphjgn.png",
    tags: ["Action", "Endless Runner", "Boss Fight"],
    description: "Survive the endless run and face off against Dio in an epic boss fight! Use your fireball and ultimate to claim victory.",
    playRoute: "/minigame/affan-strike",
  },
  {
    id: "ambasuke-protocol",
    title: "The Ambasuke Protocol",
    thumbnail: "https://res.cloudinary.com/dcsh47583/image/upload/v1781531209/ambasukeProtocol_ykbia5.png",
    tags: ["Survival", "Hack & Slash", "Anomaly"],
    description: "Navigate the corrupted data streams as Ambasuke. Slash through waves of Corrupted Entities in this cyberpunk survival protocol. How long can you maintain uplink?",
    playRoute: "/minigame/ambasuke-protocol",
  },
]

/** Hybrid fallback: show real games when available, otherwise mockups */
const gamesToDisplay = REAL_GAMES.length > 0 ? REAL_GAMES : MOCKUP_GAMES

export default function MinigameHub() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)

  const [selectedGame, setSelectedGame] = useState<MinigameData | null>(null)

  // SOP Rule 2: Strict React Cleanup (Even for simple mount state)
  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      setMounted(true)
    }
    return () => {
      isMounted = false
    }
  }, [])

  const handlePlay = (route: string) => {
    // Perform any necessary cleanup before routing if needed
    setSelectedGame(null)
    router.push(route)
  }

  // Pre-render content to avoid hydration mismatch, though transition handles initial visual state
  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground mb-20 font-sans selection:bg-[#2398f7]/30 overflow-x-hidden">
      {/* SOP Rule 6: Framer Motion for "Entering the void" transition */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 1, backgroundColor: "hsl(var(--background))" }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="fixed inset-0 z-50 pointer-events-none"
        />
      </AnimatePresence>

      <main className="container mx-auto px-4 py-24 md:py-32 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
              Minigame
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl text-lg">
              Enter the void. Select a protocol to begin your simulation.
            </p>
          </header>

          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-[#2398f7] rounded-full inline-block" />
                Recommended For You
              </h2>
              {/* Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gamesToDisplay.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                    // SOP Rule 5: Hardware Acceleration limits
                    className="group relative cursor-pointer rounded-2xl overflow-hidden bg-card border border-border will-change-transform transform-gpu transition-all hover:-translate-y-2 hover:border-primary hover:shadow-2xl hover:shadow-[#2398f7]/10"
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="aspect-[4/3] relative w-full overflow-hidden">
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        fill
                        unoptimized={true}
                        priority={i < 2} // SOP RULE 9
                        className="object-cover transition-transform duration-500 will-change-transform transform-gpu group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </div>
                    <div className="p-5 absolute bottom-0 left-0 right-0">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {game.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/20 text-white rounded-sm backdrop-blur-none"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold truncate text-white">{game.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>

        {/* Lazy Loaded Guestbook section at the bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <Guestbook
            pageId="minigame_hub"
            variant="section"
            title="Void Echoes"
            description="Leave your mark in the void."
          />
        </motion.div>
      </main>

      {/* Hybrid Modal / Drawer Interaction */}
      {isMobile ? (
        <Drawer open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
          <DrawerContent className="bg-background border-border text-foreground min-h-[60dvh] h-[70dvh]">
            {selectedGame && (
              <div className="flex flex-col h-full w-full overflow-hidden relative">
                <DrawerClose className="absolute top-4 right-4 z-[100] flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
                  <X className="w-4 h-4" />
                </DrawerClose>
                <div className="relative w-full h-[30vh] shrink-0">
                  <Image
                    src={selectedGame.thumbnail}
                    alt={selectedGame.title}
                    fill
                    unoptimized={true}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col px-4 pt-6 pb-8 bg-white dark:bg-zinc-950 relative z-10 h-full">
                  <DrawerHeader className="text-left px-0">
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {selectedGame.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#2398f7]/20 text-[#2398f7] rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <DrawerTitle className="text-2xl font-black">{selectedGame.title}</DrawerTitle>
                    <DrawerDescription className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {selectedGame.description}
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter className="px-0 pt-6 mt-auto">
                    <Button
                      onClick={() => handlePlay(selectedGame.playRoute)}
                      className="w-full bg-[#2398f7] hover:bg-[#1e82d4] text-primary-foreground h-12 text-lg font-bold"
                    >
                      PLAY NOW
                    </Button>
                  </DrawerFooter>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
          <DialogContent showCloseButton={false} className="bg-background border-border text-foreground p-0 overflow-hidden sm:max-w-[800px]">
            {selectedGame && (
              <div className="grid grid-cols-1 md:grid-cols-2 h-full relative">
                <DialogClose className="absolute top-4 right-4 z-[100] flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
                  <X className="w-4 h-4" />
                </DialogClose>
                <div className="relative w-full h-full min-h-[300px] md:min-h-full">
                  <Image
                    src={selectedGame.thumbnail}
                    alt={selectedGame.title}
                    fill
                    unoptimized={true}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center space-y-4 bg-white dark:bg-zinc-950 h-full relative z-10">
                  <DialogHeader className="text-left mb-2">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {selectedGame.tags.map((tag) => (
                        <span key={tag} className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-[#2398f7]/20 text-[#2398f7] rounded-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <DialogTitle className="text-3xl font-black leading-tight">{selectedGame.title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2 text-base leading-relaxed">
                      {selectedGame.description}
                    </DialogDescription>
                  </DialogHeader>
                  <Button
                    onClick={() => handlePlay(selectedGame.playRoute)}
                    className="w-full bg-[#2398f7] hover:bg-[#1e82d4] text-primary-foreground h-12 text-lg font-bold transition-transform active:scale-95 will-change-transform transform-gpu"
                  >
                    ENTER PROTOCOL
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      <FloatingBackButton />
    </div>
  )
}
