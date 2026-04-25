"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils" // Pastikan lu punya utility cn standar shadcn

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  // LOGIKA BUAT NGE-HIDE NAVBAR DI PAGE TERTENTU
  if (pathname === "/memory-leak" || pathname === "/terminal") {
    return null
  }

  const navLinks = [
    { name: "Archives", href: "/archives" },
    { name: "Affan's Music", href: "/music" },
    { name: "Chronicle", href: "/blog" },
    { name: "Memory Leak", href: "/memory-leak" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm dark:shadow-none dark:border-b dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* Kiri: Logo (Static as requested) */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-xl font-bold tracking-tight text-primary">Affanverse.</span>
          </Link>
        </div>

        {/* Kanan: Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2 font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "relative h-9 px-4 py-2 transition-all duration-300 group overflow-hidden active:scale-95 active:bg-zinc-200 dark:active:bg-zinc-800",
                    isActive ? "text-[#2398f7]" : "text-muted-foreground hover:text-[#2398f7]"
                  )}
                >
                  <Link href={link.href}>
                    {link.name}
                    {/* Underline Animation */}
                    <span 
                      className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-[#2398f7] transition-all duration-300",
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      )} 
                    />
                  </Link>
                </Button>
              )
            })}
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Theme Toggle dengan Glow Effect */}
          <div className="hover:drop-shadow-[0_0_8px_#2398f7] transition-all duration-300">
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
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md absolute w-full shadow-lg transition-all animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-2 font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={cn(
                    "justify-start h-12 transition-all active:pl-6 active:bg-zinc-200 dark:active:bg-zinc-800",
                    isActive ? "text-[#2398f7] bg-zinc-100 dark:bg-zinc-900" : "text-muted-foreground"
                  )}
                  asChild
                  onClick={closeMenu}
                >
                  <Link href={link.href}>{link.name}</Link>
                </Button>
              )
            })}
          </nav>
        </div>
      )}
    </nav>
  )
}