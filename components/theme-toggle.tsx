"use client"

import * as React from "react"
import { Moon, Sun, Zap } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {/* Icon Sun (Light) */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 glitch:-rotate-90 glitch:scale-0" />
          
          {/* Icon Moon (Dark) */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 glitch:rotate-90 glitch:scale-0" />
          
          {/* Icon Zap (Glitch) */}
          <Zap className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all glitch:rotate-0 glitch:scale-100 text-red-500 animate-pulse" />
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md z-50">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        
        {/* Tambahan Opsi Glitch */}
        <DropdownMenuItem 
          onClick={() => setTheme("glitch")} 
          className="text-red-500 font-bold focus:text-red-600 focus:bg-red-500/10 mt-1 border-t border-border"
        >
          <Zap className="w-4 h-4 mr-2" /> Glitch Mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}