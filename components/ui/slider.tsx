"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center group cursor-pointer py-2",
      className
    )}
    {...props}
  >
    {/* TRACK: Langsingin jadi h-1 (4px) biar elegan ala Spotify */}
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-black/15 dark:bg-white/20 transition-colors">
      <SliderPrimitive.Range className="absolute h-full bg-[#2398f7]" />
    </SliderPrimitive.Track>
    
    {/* THUMB: Dikecilin dikit jadi h-3.5 w-3.5 biar proporsional sama garisnya */}
    <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full border border-black/5 dark:border-white/10 bg-[#2398f7] shadow-[0_2px_8px_rgba(35,152,247,0.5)] ring-offset-background transition-transform group-hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2398f7] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }