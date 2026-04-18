"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="container mx-auto flex h-16 items-center flex-wrap px-4 sm:px-8">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">Affan</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1 sm:space-x-2 font-medium">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/projects">Projects</Link>
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </nav>
          <div className="hidden sm:block w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
