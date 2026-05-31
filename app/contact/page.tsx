"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { FloatingBackButton } from "@/components/floating-back-button";
import { Terminal, Sparkles } from "lucide-react";

interface InstagramIconProps extends React.SVGProps<SVGSVGElement> {}

const InstagramIcon = (props: InstagramIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function ContactPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      }
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-24 px-4 sm:px-8 bg-background overflow-hidden selection:bg-[#2398f7]/30">
      {/* Background Decorative Grid - Static layout, no animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Subtle Static Color Accents (No continuous animations) */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#2398f7]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl w-full flex flex-col items-center"
      >
        {/* Page Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-16 md:mb-24 transform-gpu will-change-transform"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-6">
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            CONNECT WITH <span className="text-[#2398f7]">US</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed font-light">
            Reach out directly to the creators of the Affanverse through their official digital handles.
          </p>
        </motion.div>

        {/* Dynamic Typography-driven Split Section */}
        <motion.div 
          variants={itemVariants}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-850/80 items-stretch transform-gpu will-change-transform"
        >
          {/* Section 01: Jeka */}
          <div className="flex flex-col justify-between p-2 md:px-12 md:py-4 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#2398f7]">
                <Terminal className="w-3.5 h-3.5" />
                <span>01 / THE ARCHITECT</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Mufid Refaya
                </h2>
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                  Lead Developer / AI Student
                </p>
              </div>
              
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md font-light">
                Student of Artificial Intelligence in UBM. The systems engineer who compiled the logic, routes, and interactive realities of the Affanverse.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <span className="text-xs font-mono tracking-wider text-zinc-450 dark:text-zinc-500 block uppercase">
                Direct Contact
              </span>
              <a
                href="https://www.instagram.com/mufid.jk"
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-200 hover:text-[#2398f7] dark:hover:text-[#2398f7] transition-all duration-300 ease-out transform-gpu hover:scale-105 hover:translate-x-1 will-change-transform"
                id="contact-jeka-link"
              >
                <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover/link:rotate-12 text-zinc-450 dark:text-zinc-500 group-hover/link:text-[#2398f7]" />
                <span>@mufid.jk</span>
              </a>
            </div>
          </div>

          {/* Section 02: Affan */}
          <div className="flex flex-col justify-between p-2 pt-16 md:pt-4 md:px-12 md:py-4 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#2398f7]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>02 / THE ANOMALY</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  Haasyir Affan Andinnari
                </h2>
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase">
                  Apex Predator / Subject
                </p>
              </div>
              
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md font-light">
                The apex predator and fish technology researcher. Domineering the digital abyss, serving as the central subject and core inspiration of the entire project.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <span className="text-xs font-mono tracking-wider text-zinc-450 dark:text-zinc-500 block uppercase">
                Direct Contact
              </span>
              <a
                href="https://www.instagram.com/affanhaa"
                target="_blank"
                rel="noopener noreferrer"
                className="group/link inline-flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-200 hover:text-[#2398f7] dark:hover:text-[#2398f7] transition-all duration-300 ease-out transform-gpu hover:scale-105 hover:translate-x-1 will-change-transform"
                id="contact-affan-link"
              >
                <InstagramIcon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover/link:rotate-12 text-zinc-450 dark:text-zinc-500 group-hover/link:text-[#2398f7]" />
                <span>@affanhaa</span>
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Back Button */}
      <FloatingBackButton />
    </div>
  );
}
