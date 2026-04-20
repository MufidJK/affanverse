import Link from "next/link";
import { Zap, Check } from "lucide-react";

export function MinigamePortal() {
  const features = [
    "Access to Unstable Realities",
    "Existential Dread Beta",
    "Guaranteed Brain Damage (Temporary)",
    "Flappy Affan Access (Soon™)"
  ];

  return (
    <section className="py-24 bg-gray-100 dark:bg-gray-900 px-4 w-full overflow-hidden pb-30 md:pb-48 min-h-[90vh] flex flex-col justify-center">
      <style>{`
        @keyframes portal-vortex {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes brutal-glitch {
          0% { transform: skew(0deg); text-shadow: -2px 0 red, 2px 0 blue; }
          20% { transform: skew(-2deg) translate(-1px, 1px); text-shadow: 2px 0 red, -2px 0 blue; }
          40% { transform: skew(2deg) translate(1px, -1px); text-shadow: -2px 0 blue, 2px 0 red; }
          60% { transform: skew(0deg) translate(-1px, -1px); text-shadow: 2px 0 blue, -2px 0 red; }
          80% { transform: skew(-2deg) translate(1px, 1px); text-shadow: -2px 0 red, 2px 0 blue; }
          100% { transform: skew(0deg); text-shadow: 2px 0 red, -2px 0 blue; }
        }
        .portal-vortex-bg {
          background: linear-gradient(270deg, #2398f7, #5c23f7, #ec4899, #2398f7);
          background-size: 300% 300%;
          animation: portal-vortex 4s ease infinite;
        }
        .group:hover .group-hover\\:animate-brutal-glitch {
          animation: brutal-glitch 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }
        .hover\\:brutal-glitch:hover, .active\\:brutal-glitch:active {
          animation: brutal-glitch 0.1s linear infinite;
        }

        /* 1. Smooth Floating (Wrapper) */
        @keyframes smooth-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-wrapper-float {
          animation: smooth-float 5s ease-in-out infinite;
        }

        /* 2. Precise 2-Second TikTok Glitch Loop (Inner Card) */
        @keyframes tiktok-idle-glitch {
          0%, 90% { transform: translate(0) skew(0); filter: drop-shadow(0 0 0 transparent); }
          92% { transform: translate(-3px, 2px) skewX(-2deg); filter: drop-shadow(-4px 0px 0px rgba(255,0,0,0.8)) drop-shadow(4px 0px 0px rgba(0,255,255,0.8)); }
          94% { transform: translate(3px, -2px) skewX(2deg); filter: drop-shadow(4px 0px 0px rgba(255,0,0,0.8)) drop-shadow(-4px 0px 0px rgba(0,255,255,0.8)); }
          96% { transform: translate(-1px, 1px) skewX(-1deg); filter: drop-shadow(-2px 0px 0px rgba(255,0,0,0.8)) drop-shadow(2px 0px 0px rgba(0,255,255,0.8)); }
          98%, 100% { transform: translate(0) skew(0); filter: drop-shadow(0 0 0 transparent); }
        }
        .idle-glitch-2s {
          animation: tiktok-idle-glitch 2s infinite;
        }
      `}</style>

      {/* New Title Section directly above the card */}
      <div className="w-full max-w-3xl mx-auto text-center mb-8 px-4 z-10 relative">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Affan's Void Portal:
        </h2>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2ba0ff] mt-2 tracking-tight">
          Gateway to multi-dimensional chaos.
        </h3>
      </div>

      <div className="max-w-md mx-auto relative px-4 mt-8 md:mt-16 animate-wrapper-float z-20">
        <div className="flex flex-col p-8 gap-6 rounded-3xl bg-card border-2 border-[#2398f7]/40 shadow-[0_0_60px_rgba(35,152,247,0.3)] transition-all duration-300 idle-glitch-2s hover:brutal-glitch group cursor-pointer">
          
          <div className="flex justify-center mb-2">
            <div className="p-4 rounded-full bg-[#2398f7]/10 animate-pulse">
              <Zap className="w-10 h-10 text-[#2398f7]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-center text-[#2398f7] tracking-tight group-hover:animate-brutal-glitch transition-colors">
            Affan's Void: The Chaos Subscription
          </h2>
          
          <p className="text-center font-extrabold text-5xl md:text-6xl text-foreground mt-2 group-hover:animate-brutal-glitch">
            ∞ <span className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors mix-blend-difference">Sanity Pts</span> / 0 ETH
          </p>

          <ul className="space-y-4 my-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start text-muted-foreground text-sm font-medium">
                <Check className="w-5 h-5 text-[#2398f7] mr-3 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link 
            href="/minigame" 
            className="w-full mt-2 outline-none"
          >
            <button className="w-full flex items-center justify-center py-4 px-6 rounded-2xl portal-vortex-bg text-white font-black tracking-widest text-lg shadow-xl shadow-[#2398f7]/20 hover:shadow-[#2398f7]/50 active:scale-95 transition-all">
               <span className="group-hover:animate-brutal-glitch">SUBSCRIBE TO THE VOID</span>
            </button>
          </Link>
          
        </div>
      </div>
    </section>
  );
}