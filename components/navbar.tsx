"use client"

import * as React from "react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm dark:shadow-none dark:border-b dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* Kiri: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-xl font-bold tracking-tight text-primary">Affanverse.</span>
          </Link>
        </div>

        {/* Kanan: Desktop Navigation (Hidden di Mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2 font-medium">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/archives">Archives</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/music">Affan's Music</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/blog">Chronicle</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/about">About</Link>
            </Button>
          </nav>
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>

        {/* Kanan: Mobile Navigation Controls (Hidden di Desktop) */}
        <div className="flex items-center gap-2 md:hidden">
          {/* ThemeToggle tetep diluar menu biar stand alone */}
          <ThemeToggle />
          
          {/* Hamburger Button */}
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Muncull pas Hamburger di klik) */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md absolute w-full shadow-lg transition-all animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-2 font-medium">
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary" asChild onClick={closeMenu}>
              <Link href="/archives">Archives</Link>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary" asChild onClick={closeMenu}>
              <Link href="/music">Affan's Music</Link>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary" asChild onClick={closeMenu}>
              <Link href="/blog">Chronicle</Link>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary" asChild onClick={closeMenu}>
              <Link href="/contact">Contact</Link>
            </Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary" asChild onClick={closeMenu}>
              <Link href="/about">About</Link>
            </Button>
          </nav>
        </div>
      )}
    </nav>
  )
}