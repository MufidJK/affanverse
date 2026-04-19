"use client";

import React from "react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Jeka",
    role: "Teman",
    text: "Orangnya bahaya kalau dibiarin nganggur, mending suruh rebahan aja.",
  },
  {
    name: "Mas Gilang",
    role: "Observer",
    text: "Saya tidak tahu ini web apa, tapi desainnya terlalu bagus untuk orang seperti dia.",
  },
  {
    name: "Noval",
    role: "Survivor",
    text: "Semenjak kenal Affan, hidup saya jadi lebih... ya gitu deh pokoknya.",
  },
  {
    name: "Febry",
    role: "Critic",
    text: "Developer tier S, tapi S-nya Sempoyongan.",
  },
  {
    name: "Faiz",
    role: "Judge",
    text: "Kalau ada penghargaan orang ter-random, dia udah pasti menang piala platinum.",
  },
  {
    name: "Fadhil",
    role: "Philosopher",
    text: "Website ini adalah bukti nyata bahwa gabut bisa menjadi karya seni tingkat tinggi.",
  },
  {
    name: "Anonim",
    role: "Netizen",
    text: "Tolong kembalikan waktu 5 menit saya setelah melihat website ini.",
  },
];

export function AffanTestimonials() {
  return (
    <div className="w-full relative flex flex-col items-center">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}} />

      <div className="text-center mb-12 space-y-3 px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2398f7]">
          Testimonials from the Multiverse
        </p>
        <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          What they say about <span className="text-[#2398f7]">Affan</span>
        </h2>
      </div>

      <div className="overflow-hidden flex w-full relative py-4">
        {/* Left & Right gradient masks for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee space-x-6 px-6">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
            <div
              key={i}
              className="w-[350px] rounded-3xl border border-[#2398f7]/30 bg-background/50 backdrop-blur-md p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Subtle Glow Effect */}
              <div className="absolute -inset-10 bg-[#2398f7]/10 blur-2xl rounded-full z-0 pointer-events-none" />

              <div className="relative z-10">
                <Quote className="w-8 h-8 text-[#2398f7]/40 mb-4" />
                <p className="text-muted-foreground text-sm leading-relaxed min-h-[60px] italic">
                  "{testimonial.text}"
                </p>
                <div className="mt-6 flex flex-col">
                  <span className="font-bold text-[#2398f7]">{testimonial.name}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
