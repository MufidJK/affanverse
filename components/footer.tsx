"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub, FaXTwitter, FaInstagram, FaLinkedin, FaSkullCrossbones } from "react-icons/fa6";
import { useTerminalStore } from "@/store/useTerminalStore";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CreatorMessages } from "@/components/creator-messages";

export function Footer() {
  const pathname = usePathname();
  const { setTerminalVisible } = useTerminalStore();
  const [creatorMessagesOpen, setCreatorMessagesOpen] = useState(false);
  const glitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sanity Check: 2-second glitch easter egg + toast
  const handleSanityCheck = useCallback(() => {
    // Prevent stacking if already glitching
    if (glitchTimeoutRef.current) return;

    document.body.classList.add("sanity-glitch");
    glitchTimeoutRef.current = setTimeout(() => {
      document.body.classList.remove("sanity-glitch");
      glitchTimeoutRef.current = null;
    }, 2000);

    toast.custom(
      (t) => (
        <div className="relative overflow-hidden w-full max-w-sm rounded-lg bg-[#0a0a0a] border border-gray-800 shadow-2xl flex flex-col font-mono">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2398f7]" />
          
          <div className="flex items-start gap-4 p-4 pl-5">
            <div className="mt-0.5 text-[#2398f7]">
              <FaSkullCrossbones className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                [SYSTEM ERROR]
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Reality Sync: Unstable. Sanity Level: 67%. Are you sure you are awake?
              </p>
            </div>
          </div>

          {/* Animated Countdown Progress Bar */}
          <div className="h-1 w-full bg-gray-900 mt-auto">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-[#2398f7]"
            />
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  }, []);

  // Logika ngilangin footer di page terminal
  if (pathname === "/memory-leak" || pathname === "/terminal") {
    return null;
  }

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Archives", href: "/archives" },
        { label: "Music", href: "/music" },
        { label: "Memory Leak", href: "/memory-leak" },
        { label: "Projects", href: "/projects" },
        { label: "Chronicle", href: "/chronicle" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Dimensions",
      links: [
        { label: "Affan AI Chat", href: "/#affan-ai-chat" },
        { label: "Void Portal", href: "/minigame" },
        { label: "The Abyss", href: "#", action: () => setTerminalVisible(true) },
        { label: "Apex Predator", href: "/novel" },
        { label: "Ambasuke Spin-off", href: "/ambasuke" },
        { label: "Behind the Code", href: "/behind-the-scenes" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "FAQ", href: "/#faq" },
        { label: "Creator Messages", href: "#", action: () => setCreatorMessagesOpen(true) },
        { label: "Sanity Check", href: "#", action: handleSanityCheck },
        { label: "Saweria", href: "https://saweria.co/MufidJK", external: true },
        { label: "Trakteer", href: "https://trakteer.id/mufidjk", external: true }
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Chaos", href: "/terms-of-chaos" },
        { label: "Cookie Protocol", href: "/cookie-protocol" },
        { label: "Abyss Term", href: "/abyss-term" },
      ],
    },
  ];

  const socialLinks = [
    { label: "Instagram (Mufid)", href: "https://www.instagram.com/mufid.jk", icon: FaInstagram },
    { label: "LinkedIn (Mufid)", href: "https://www.linkedin.com/in/mufidrefaya/", icon: FaLinkedin },
    { label: "Instagram (Affan)", href: "https://www.instagram.com/affanhaa", icon: FaInstagram },
    { label: "GitHub", href: "https://github.com/MufidJK", icon: FaGithub },
    { label: "X / Twitter", href: "https://x.com/mufidjk", icon: FaXTwitter },
  ];

  return (
    <>
    <footer className="w-full bg-gray-950 border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 border-b border-white/5 lg:border-none pb-8 lg:pb-0">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <span className="text-xl font-black tracking-tighter text-white">
                AFFAN<span className="text-[#2398f7]">VERSE</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-xs">
              A digital ecosystem where reality meets anomaly. The official archives of The Apex Predator, built for those who dare to explore the glitch.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-600 text-gray-400 hover:border-[#2398f7] hover:text-[#2398f7] transition-all duration-300 hover:shadow-[0_0_15px_rgba(35,152,247,0.3)] hover:scale-105"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, i) => (
            <div key={i}>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-[#2398f7] rounded-full" />
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    {('action' in link && link.action) ? (
                      <button
                        type="button"
                        onClick={link.action as () => void}
                        className="text-gray-400 hover:text-[#2398f7] text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    ) : ('external' in link && link.external) ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#2398f7] text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-[#2398f7] text-sm transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 font-medium">
            © 2026 <span className="text-[#2398f7]">Affanverse</span>. Evidence of His Existence.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <span>Designed in the Void</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span>Reality Sync: Stable</span>
            </div>
          </div>
        </div>
      </div>
    </footer>

    {/* Creator Messages Terminal Drawer */}
    <CreatorMessages
      open={creatorMessagesOpen}
      onOpenChange={setCreatorMessagesOpen}
    />
    </>
  );
}