"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Logika ngilangin footer di page terminal
  if (pathname === "/memory-leak" || pathname === "/terminal") {
    return null;
  }

  const footerSections = [
    {
      title: "Navigation",
      links: [
        { label: "Halaman Utama", href: "/" },
        { label: "Skill Tree", href: "#skill-tree" },
        { label: "Gallery Dump", href: "#gallery" },
        { label: "Cursed Artifacts", href: "#artifact" },
      ],
    },
    {
      title: "Dimensions",
      links: [
        { label: "Minigame Portal", href: "/minigame" },
        { label: "Void Explorer", href: "#" },
        { label: "Fragment Reality", href: "#" },
        { label: "Chaos Theory", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Report Bugs", href: "#" },
        { label: "FAQ", href: "#faq" },
        { label: "Creator Messages", href: "#testimonials" },
        { label: "Sanity Check", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Chaos", href: "#" },
        { label: "Cookie Protocol", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { label: "GitHub", href: "#" },
    { label: "Twitter", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Email", href: "#" },
  ];

  return (
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
              Exploring the boundaries of reality and digital chaos. A premium experience designed for the brave.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="text-xs font-bold text-gray-400 hover:text-[#2398f7] transition-all duration-300"
                >
                  {social.label.toUpperCase()}
                </Link>
              ))}
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
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#2398f7] text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
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
  );
}