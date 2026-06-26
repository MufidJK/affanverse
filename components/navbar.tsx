"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isBooksOpen, setIsBooksOpen] = React.useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsBooksOpen(false)
  }

  if (pathname === "/memory-leak" || pathname === "/terminal" || pathname.startsWith("/minigame/")) {
    return null
  }

  const navLinks = [
    { name: "Archives", href: "/archives" },
    { name: "Affan's Music", href: "/music" },
    { name: "Chronicle", href: "/blog" },
    { name: "Memory Leak", href: "/memory-leak" },
    { name: "Nexus", href: "/nexus" },
    { name: "Exchange", href: "/apex-exchange" },
    { name: "The Books", subLinks: [
      { name: "Affan: The Apex Predator", href: "/novel" },
      { name: "Ambasuke (Spin off)", href: "/ambasuke" }
    ] },
    { name: "AKI", href: "/aki" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 shadow-sm dark:shadow-none dark:border-b dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* Kiri: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-xl font-bold tracking-tight text-primary">Affanverse.</span>
          </Link>
        </div>

        {/* Kanan: Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2 font-medium whitespace-nowrap px-2">
            {navLinks.map((link) => {
              if (link.subLinks) {
                const isActive = link.subLinks.some(sub => pathname.startsWith(sub.href))
                return (
                  <div key={link.name} className="relative group">
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative h-9 px-4 py-2 transition duration-300 overflow-hidden active:scale-95 active:bg-zinc-200 dark:active:bg-zinc-800 transform-gpu",
                        isActive ? "text-[#2398f7]" : "text-muted-foreground hover:text-[#2398f7]"
                      )}
                    >
                      {link.name}
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 transform-gpu group-hover:rotate-90" />
                      <span className={cn(
                        "absolute bottom-0 left-0 h-[2px] w-full bg-[#2398f7] origin-left transition-transform duration-300 will-change-transform transform-gpu",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )} />
                    </Button>
                    <div className="absolute top-full left-0 mt-1 w-64 opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition duration-200 ease-in-out will-change-transform transform-gpu bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-transparent">
                      {link.subLinks.map(sub => {
                        const isSubActive = pathname.startsWith(sub.href) && sub.href !== '/' || pathname === sub.href
                        return (
                          <Link 
                            key={sub.href} 
                            href={sub.href}
                            className={cn(
                              "relative group/subitem block px-4 py-3 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900",
                              "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#2398f7] after:origin-left after:scale-x-0 group-hover/subitem:after:scale-x-100 after:transition-transform after:duration-300 after:will-change-transform after:transform-gpu",
                              isSubActive ? "text-[#2398f7] bg-zinc-50 dark:bg-zinc-900/50" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {sub.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              // INI YANG DIGANTI BUAT DESKTOP
              const isActive = pathname.startsWith(link.href!) && link.href !== '/' || pathname === link.href

              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  asChild
                  className={cn(
                    "relative h-9 px-4 py-2 transition duration-300 group overflow-hidden active:scale-95 active:bg-zinc-200 dark:active:bg-zinc-800 transform-gpu",
                    isActive ? "text-[#2398f7]" : "text-muted-foreground hover:text-[#2398f7]"
                  )}
                >
                  <Link href={link.href!}>
                    {link.name}
                    {/* Underline Animation */}
                    <span 
                      className={cn(
                        "absolute bottom-0 left-0 h-[2px] w-full bg-[#2398f7] origin-left transition-transform duration-300 will-change-transform transform-gpu",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )} 
                    />
                  </Link>
                </Button>
              )
            })}
            
            {/* Intercelestial Button */}
            <Button
              asChild
              className="relative h-9 rounded-full border border-[#2398f7]/50 shadow-[0_0_10px_rgba(35,152,247,0.3)] hover:shadow-[0_0_20px_rgba(35,152,247,0.6)] bg-[#2398f7]/10 hover:bg-[#2398f7]/20 text-[#2398f7] font-semibold transition-all duration-300 ml-2"
            >
              <Link href="/intercelestial">
                Intercelestial
              </Link>
            </Button>
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Theme Toggle dengan Glow Effect */}
          <div className="hover:shadow-[0_0_8px_#2398f7] rounded-md transition duration-300">
            <ThemeToggle />
          </div>
        </div>

        {/* Kanan: Mobile Navigation Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            aria-label="Toggle Menu"
            className="active:scale-90 active:bg-zinc-200 dark:active:bg-zinc-800 transition-transform"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={cn(
          "md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 absolute w-full shadow-lg transition-[opacity,transform,visibility] duration-300 ease-out will-change-transform transform-gpu origin-top z-50",
          isMenuOpen 
            ? "opacity-100 translate-y-0 visible" 
            : "opacity-0 -translate-y-4 invisible pointer-events-none"
        )}
      >
          <nav className="flex flex-col p-4 space-y-2 font-medium">
            {navLinks.map((link) => {
              if (link.subLinks) {
                const isActive = link.subLinks.some(sub => pathname.startsWith(sub.href))
                return (
                  <div key={link.name} className="flex flex-col">
                    <Button 
                      variant="ghost"
                      onClick={() => setIsBooksOpen(!isBooksOpen)}
                      className={cn(
                        "flex w-full justify-between h-12 transition active:translate-x-2 transform-gpu active:bg-zinc-200 dark:active:bg-zinc-800",
                        isActive ? "text-[#2398f7] bg-zinc-100 dark:bg-zinc-900" : "text-muted-foreground"
                      )}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform duration-200 transform-gpu text-muted-foreground",
                        isBooksOpen ? "rotate-90" : "rotate-0"
                      )} />
                    </Button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out flex flex-col ml-4",
                        isBooksOpen 
                          ? "max-h-96 opacity-100 mt-1 mb-2 border-l-2 border-zinc-200 dark:border-zinc-800" 
                          : "max-h-0 opacity-0 mt-0 mb-0 border-l-0 pointer-events-none"
                      )}
                    >
                      <div className="pl-4 flex flex-col space-y-1">
                        {link.subLinks.map(sub => {
                          const isSubActive = pathname.startsWith(sub.href) && sub.href !== '/' || pathname === sub.href
                          return (
                            <Button
                              key={sub.href}
                              variant="ghost"
                              className={cn(
                                "justify-start h-10 transition active:translate-x-2 transform-gpu active:bg-zinc-200 dark:active:bg-zinc-800",
                                isSubActive ? "text-[#2398f7] bg-zinc-100 dark:bg-zinc-900" : "text-muted-foreground"
                              )}
                              asChild
                              onClick={closeMenu}
                            >
                              <Link href={sub.href}>{sub.name}</Link>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              // INI JUGA DIGANTI BUAT MOBILE
              const isActive = pathname.startsWith(link.href!) && link.href !== '/' || pathname === link.href

              return (
                <Button
                  key={link.name}
                  variant="ghost"
                  className={cn(
                    "justify-start h-12 transition active:translate-x-2 transform-gpu active:bg-zinc-200 dark:active:bg-zinc-800",
                    isActive ? "text-[#2398f7] bg-zinc-100 dark:bg-zinc-900" : "text-muted-foreground"
                  )}
                  asChild
                  onClick={closeMenu}
                >
                  <Link href={link.href!}>{link.name}</Link>
                </Button>
              )
            })}

            {/* Intercelestial Mobile Button */}
            <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                asChild
                className="w-full h-12 rounded-xl border border-[#2398f7]/50 shadow-[0_0_15px_rgba(35,152,247,0.2)] bg-[#2398f7]/10 hover:bg-[#2398f7]/20 text-[#2398f7] font-bold transition-all duration-300"
                onClick={closeMenu}
              >
                <Link href="/intercelestial">
                  Intercelestial 🌌
                </Link>
              </Button>
            </div>
          </nav>
        </div>
    </nav>
  )
}