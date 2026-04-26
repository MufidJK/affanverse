"use client";

import React from "react";
import { Quote, User } from "lucide-react";
import { motion } from "framer-motion";

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
  avatarUrl: string;
  avatarSrc: string;
}

export function TestimonialsMarquee({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  // Gandain array buat ilusi loop tak terbatas
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="w-full relative flex flex-col items-center">
      <div className="text-center mb-12 space-y-3 px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2398f7]">
          Testimonials from the Multiverse
        </p>
        <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          What they say about <span className="text-[#2398f7]">Affan</span>
        </h2>
      </div>

      <div className="overflow-hidden flex w-full relative py-4 group">
        {/* Left & Right gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* THE ULTIMATE FIX: Pake Framer Motion.
          Ini bakal jalan nempel sama refresh rate layar lu (165Hz/200Hz).
        */}
        <motion.div
          className="flex w-max space-x-6 px-3 will-change-transform"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35, // Makin gede angkanya, makin pelan jalannya
              ease: "linear",
            },
          }}
        >
          {duplicatedTestimonials.map((testimonial, i) => (
            <div
              key={i}
              className="w-[350px] rounded-3xl border border-[#2398f7]/30 bg-background/95 p-6 flex flex-col gap-4 relative overflow-hidden transform-gpu [backface-visibility:hidden]"
            >
              {/* Radial gradient aman tanpa efek blur */}
              <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,_rgba(35,152,247,0.15)_0%,_transparent_70%)] rounded-full z-0 pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 shrink-0 rounded-full border-2 border-[#2398f7]/50 overflow-hidden bg-background flex items-center justify-center">
                    {testimonial.name === "Anonim" ? (
                      <User className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <img 
                        src={testimonial.avatarSrc} 
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: gray;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                          (e.target as HTMLImageElement).classList.add('p-2');
                        }}
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#2398f7] leading-tight">{testimonial.name}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                      {testimonial.role}
                    </span>
                  </div>
                </div>

                <Quote className="w-6 h-6 text-[#2398f7]/40 mb-2" />
                <p className="text-muted-foreground text-sm leading-relaxed min-h-[60px] italic">
                  "{testimonial.text}"
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}