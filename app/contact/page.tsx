"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { FloatingBackButton } from "@/components/floating-back-button";
import { Terminal, Sparkles, MapPin, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface GithubIconProps extends React.SVGProps<SVGSVGElement> {}

const GithubIcon = (props: GithubIconProps) => (
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
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface LinkedinIconProps extends React.SVGProps<SVGSVGElement> {}

const LinkedinIcon = (props: LinkedinIconProps) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface XIconProps extends React.SVGProps<SVGSVGElement> {}

const XIcon = (props: XIconProps) => (
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
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
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
              <div className="flex flex-col gap-y-4 items-start">
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
                <a
                  href="https://github.com/MufidJK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-zinc-800 dark:text-zinc-200 hover:text-[#2398f7] dark:hover:text-[#2398f7] transition-all duration-300 ease-out transform-gpu hover:scale-105 hover:translate-x-1 will-change-transform"
                  id="contact-jeka-github-link"
                >
                  <GithubIcon className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover/link:rotate-12 text-zinc-450 dark:text-zinc-500 group-hover/link:text-[#2398f7]" />
                  <span>@MufidJK</span>
                </a>
              </div>
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

      {/* New 2-Column Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-7xl mx-auto py-16 px-6 transform-gpu will-change-transform mt-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column: The Form */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white dark:bg-[#0c0c0c] border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-3xl overflow-hidden ring-0">
              <CardHeader className="p-8 sm:p-10 pb-6 border-b border-neutral-100 dark:border-neutral-800/50">
                <CardTitle className="text-3xl font-black font-mono uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                  <Terminal className="w-6 h-6 text-[#2398f7]" />
                  Broadcast Transmission
                </CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400 font-light mt-2 text-base">
                  Establish connection via secure protocol. Fill out the coordinates below.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 sm:p-10 pt-8 space-y-6">
                <form action="https://formspree.io/f/xbdeqzkz" method="POST" className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-zinc-800 dark:text-zinc-200 font-medium text-sm tracking-wide">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="Name"
                        required
                        placeholder="Pak Hardin"
                        className="h-12 bg-neutral-100 dark:bg-neutral-900 text-zinc-900 dark:text-zinc-100 border-neutral-200 dark:border-neutral-700/50 focus-visible:ring-[#2398f7] focus-visible:border-[#2398f7] focus:ring-[#2398f7] focus:border-[#2398f7] rounded-xl px-4 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-zinc-800 dark:text-zinc-200 font-medium text-sm tracking-wide">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="Email"
                        required
                        placeholder="emaillo@gmail.com"
                        className="h-12 bg-neutral-100 dark:bg-neutral-900 text-zinc-900 dark:text-zinc-100 border-neutral-200 dark:border-neutral-700/50 focus-visible:ring-[#2398f7] focus-visible:border-[#2398f7] focus:ring-[#2398f7] focus:border-[#2398f7] rounded-xl px-4 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="recipient" className="text-zinc-800 dark:text-zinc-200 font-medium text-sm tracking-wide">
                      Select Recipient
                    </Label>
                    <Select name="Subject" defaultValue="architect">
                      <SelectTrigger
                        id="recipient"
                        className="w-full h-12 bg-neutral-100 dark:bg-neutral-900 text-zinc-900 dark:text-zinc-100 border-neutral-200 dark:border-neutral-700/50 focus-visible:ring-[#2398f7] focus-visible:border-[#2398f7] focus:ring-[#2398f7] focus:border-[#2398f7] text-left justify-between rounded-xl px-4 transition-all"
                      >
                        <SelectValue placeholder="Select Recipient" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-zinc-900 dark:text-zinc-100 rounded-xl overflow-hidden">
                        <SelectItem value="architect" className="py-3 px-4 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800">
                          The Architect (Jeka)
                        </SelectItem>
                        <SelectItem value="anomaly" className="py-3 px-4 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800">
                          The Apex Predator (Affan)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-zinc-800 dark:text-zinc-200 font-medium text-sm tracking-wide">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="Message"
                      required
                      rows={6}
                      placeholder="Input encrypted transmission content..."
                      className="min-h-40 bg-neutral-100 dark:bg-neutral-900 text-zinc-900 dark:text-zinc-100 border-neutral-200 dark:border-neutral-700/50 focus-visible:ring-[#2398f7] focus-visible:border-[#2398f7] focus:ring-[#2398f7] focus:border-[#2398f7] rounded-xl px-4 py-3 resize-y transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-14 font-mono font-bold uppercase tracking-widest text-base bg-[#2398f7] hover:bg-[#1a85db] text-white rounded-xl hover:shadow-[0_0_25px_rgba(35,152,247,0.4)] transition-all duration-300 transform-gpu active:scale-[0.98] cursor-pointer"
                    >
                      Send Transmission
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Direct Frequencies */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-white dark:bg-[#0c0c0c] border-neutral-200 dark:border-neutral-800/80 shadow-2xl rounded-3xl overflow-hidden ring-0 flex flex-col justify-between p-8 sm:p-10">
              <div className="space-y-8">
                <CardHeader className="px-0 pt-0 pb-6 border-b border-neutral-100 dark:border-neutral-800/50">
                  <CardTitle className="text-2xl font-black font-mono uppercase tracking-tight text-zinc-900 dark:text-white">
                    Direct Frequencies
                  </CardTitle>
                  <CardDescription className="text-zinc-500 dark:text-zinc-400 font-light mt-2 text-base">
                    Alternate channels for direct network ping.
                  </CardDescription>
                </CardHeader>

                <div className="space-y-8 pt-2">
                  {/* Origin Point */}
                  <div className="flex gap-5 items-start">
                    <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/50 text-[#2398f7] shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-medium">
                        Origin Point
                      </span>
                      <p className="text-base font-light text-zinc-800 dark:text-zinc-300">
                        Intercelestial
                      </p>
                    </div>
                  </div>

                  {/* Protocol */}
                  <div className="flex gap-5 items-start">
                    <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/50 text-[#2398f7] shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-medium">
                        Protocol Latency
                      </span>
                      <p className="text-base font-light text-zinc-800 dark:text-zinc-300 leading-relaxed">
                        Transmissions are processed within 2 reality cycles (67 Hours).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network / Social icons */}
              <div className="pt-10 mt-10 border-t border-neutral-100 dark:border-neutral-800/50 space-y-5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-medium">
                  Network Connect
                </span>
                <div className="flex gap-4">
                  {/* Mufid Refaya (The Architect) - Instagram */}
                  <a
                    href="https://www.instagram.com/mufid.jk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#2398f7] hover:text-[#2398f7] dark:hover:border-[#2398f7] dark:hover:text-[#2398f7] text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                    title="Mufid Refaya (Instagram)"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>

                  {/* Mufid Refaya (The Architect) - LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/mufidrefaya/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#2398f7] hover:text-[#2398f7] dark:hover:border-[#2398f7] dark:hover:text-[#2398f7] text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                    title="Mufid Refaya (LinkedIn)"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>

                  {/* Haasyir Affan (The Anomaly) - Instagram */}
                  <a
                    href="https://www.instagram.com/affanhaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#2398f7] hover:text-[#2398f7] dark:hover:border-[#2398f7] dark:hover:text-[#2398f7] text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                    title="Haasyir Affan (Instagram)"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>

                  {/* Mufid Refaya (The Architect) - Github */}
                  <a
                    href="https://github.com/MufidJK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#2398f7] hover:text-[#2398f7] dark:hover:border-[#2398f7] dark:hover:text-[#2398f7] text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                    title="Mufid Refaya (GitHub)"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>

                  {/* Mufid Refaya (The Architect) - X / Twitter */}
                  <a
                    href="https://x.com/mufidjk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#2398f7] hover:text-[#2398f7] dark:hover:border-[#2398f7] dark:hover:text-[#2398f7] text-zinc-600 dark:text-zinc-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                    title="Mufid Refaya (X / Twitter)"
                  >
                    <XIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Floating Back Button */}
      <FloatingBackButton />
    </div>
  );
}
