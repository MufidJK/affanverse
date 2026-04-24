"use client"

import * as React from "react"
import { Moon, Sun, Zap, Monitor } from "lucide-react"
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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes textGlitch {
          0%, 90%, 100% { transform: translate(0); text-shadow: none; }
          92% { transform: translate(-1px, 1px); text-shadow: 2px 0 red, -2px 0 blue; }
          94% { transform: translate(1px, -1px); text-shadow: -2px 0 lime, 2px 0 blue; }
          96% { transform: translate(-1px, -1px); text-shadow: 2px 0 red, -2px 0 lime; }
          98% { transform: translate(1px, 1px); text-shadow: -2px 0 red, 2px 0 blue; }
        }
        .animate-text-glitch {
          animation: textGlitch 1.5s infinite;
          display: inline-block;
        }
      `}} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            {/* Icon Sun (Light) */}
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 glitch:-rotate-90 glitch:scale-0" />
            
            {/* Icon Moon (Dark) */}
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 glitch:rotate-90 glitch:scale-0" />
            
            {/* Icon Zap (Glitch) */}
            <Zap className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all glitch:rotate-0 glitch:scale-100 text-purple-500 animate-pulse" />
            
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md z-50">
          
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className="cursor-pointer focus:text-orange-500 focus:bg-orange-500/10 transition-colors"
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className="cursor-pointer focus:text-[#254b9c] focus:bg-[#254b9c]/10 transition-colors"
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className="cursor-pointer focus:text-emerald-500 focus:bg-emerald-500/10 transition-colors"
          >
            <Monitor className="w-4 h-4 mr-2" />
            System
          </DropdownMenuItem>
          
          {/* Jeda 150ms biar menu nutup dulu, baru tema berubah tetep dipertahanin */}
          <DropdownMenuItem 
            onClick={() => { 
              setTimeout(() => setTheme("glitch"), 150) 
            }} 
            className="mt-1 border-t border-border cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 group"
          >
            <Zap className="w-4 h-4 mr-2 text-blue-500" /> 
            
            {/* Wrapper luar buat efek kedap-kedip pulse, dalem buat gradient dan animasi glitch rgb */}
            <span className="animate-pulse">
              <span className="font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-text-glitch">
                Glitch Mode
              </span>
            </span>

          </DropdownMenuItem>
          
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}