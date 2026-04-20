"use client";

import React from "react";

const skills = [
  { name: "Sleep Mastery", value: 67, text: "67% - Advanced" },
  { name: "Scroll TikTok", value: 99, text: "99% - Master" },
  { name: "Basket", value: 100, text: "100% - God Tier" },
  { name: "Chance kuliah diluar negeri", value: 81, text: "81% - Expert" },
  { name: "Procrastination", value: 67, text: "67% - Advanced" },
  { name: "Rebahan Level", value: 100, text: "∞ - Transcendent" },
  { name: "Luck", value: 77, text: "77% - Advanced" },
  { name: "Attack Potensial", value: 75, text: "75% - Advanced" },
  { name: "Crit Rate", value: 90, text: "90% - Legend" },
  { name: "Crit Damage", value: 100, text: "180% - God Tier" },
  { name: "Speed", value: 61, text: "61% - Intermediate" },
  { name: "Secret Plan", value: 98, text: "98% - Master" },
  { name: "Defense", value: 20, text: "20% - Beginner" },
  { name: "Bodyfat", value: 25, text: "25% - Amateur" },
  { name: "Slow Respon to other Friends", value: 99, text: "99% - Legend" },
  { name: "Benci diri sendiri", value: 1, text: "1% - Noob" },
  { name: "IQ", value: 86, text: "86% - Expert" },
  { name: "Muscle Mass", value: 10, text: "10% - Novice" },
  { name: "Kesibukan", value: 76, text: "76% - Advanced" },
  { name: "Game Skill", value: 89, text: "89% - Legend" },
  { name: "Anime Knowledge", value: 80, text: "80% - Expert" },
  { name: "Manhwa Knowledge", value: 79, text: "79% - Advanced" },
  { name: "Knowledge of School Subjects", value: 50, text: "50% - Advanced" },
  { name: "Rank ML", value: 100, text: "100% - Mythical Immortal" },
  { name: "Manipulator skill", value: 67, text: "67% - Advanced" },
  { name: "Dark side skill", value: 69, text: "69% - Advanced" },
  { name: "Light Mode", value: 82, text: "82% - Expert" },
  { name: "Hormone", value: 93, text: "93% - Legend" },
  { name: "Damage", value: 97, text: "97% - Master" },
  { name: "Produktif", value: 40, text: "40% - Trainee" },
  { name: "Speed (Awakened)", value: 70, text: "70% - Advanced" },
  { name: "Related", value: 95, text: "95% - Legend" },
  { name: "Battle IQ", value: 98, text: "98% - Legend" },
  { name: "Investment Skill", value: 80, text: "80% - Expert" },
  { name: "True Potensial", value: 100, text: "??? - UNKNOWN", isSpecial: true }
];

const colors = [
  'bg-indigo-500', 
  'bg-rose-500', 
  'bg-amber-500', 
  'bg-orange-500', 
  'bg-sky-500', 
  'bg-emerald-500', 
  'bg-violet-500', 
  'bg-pink-500'
];

const textColors = [
  'text-indigo-500', 
  'text-rose-500', 
  'text-amber-500', 
  'text-orange-500', 
  'text-sky-500', 
  'text-emerald-500', 
  'text-violet-500', 
  'text-pink-500'
];

export function AffanSkillTree() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-background">
      <style>{`
        .glitch-effect:hover, .glitch-effect:active {
          animation: anime-glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
        @keyframes anime-glitch {
          0% { transform: translate(0); filter: drop-shadow(0 0 0 transparent); }
          20% { transform: translate(-2px, 2px) skewX(1deg); filter: drop-shadow(3px 0px 0px rgba(255,0,0,0.8)) drop-shadow(-3px 0px 0px rgba(0,255,255,0.8)); }
          40% { transform: translate(-2px, -2px) skewX(-1deg); filter: drop-shadow(-3px 0px 0px rgba(255,0,0,0.8)) drop-shadow(3px 0px 0px rgba(0,255,255,0.8)); }
          60% { transform: translate(2px, 2px) skewX(0deg); filter: drop-shadow(3px 0px 0px rgba(255,0,0,0.8)) drop-shadow(-3px 0px 0px rgba(0,255,255,0.8)); }
          80% { transform: translate(2px, -2px) skewX(1deg); filter: drop-shadow(-3px 0px 0px rgba(255,0,0,0.8)) drop-shadow(3px 0px 0px rgba(0,255,255,0.8)); }
          100% { transform: translate(0); filter: drop-shadow(0 0 0 transparent); }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            The <span className="text-[#2398f7]">Affan's</span> Skill Tree
          </h2>
          <p className="text-muted-foreground text-xl italic max-w-4xl mx-auto">
            "Gw punya skill yang banyak banget nihh wok wowkwkwkkwkwk, skill issue 😹😹"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {skills.map((skill, index) => {
            const assignedBg = colors[index % colors.length];
            const assignedText = textColors[index % textColors.length];
            
            return (
              <div 
                key={skill.name} 
                className={skill.isSpecial 
                  ? "md:col-span-2 mt-4 flex flex-col p-5 gap-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-purple-500/20 dark:border-pink-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:shadow-[0_0_30px_rgba(236,72,153,0.25)] transition-all duration-300 hover:scale-[101%] hover:-translate-y-1 glitch-effect cursor-pointer"
                  : "flex flex-col p-5 gap-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-sm transition-all duration-300 hover:scale-[102%] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-white/5"
                }
              >
                <div className="flex justify-between items-center gap-4">
                  <span className={`font-bold text-lg tracking-tight ${
                    skill.isSpecial 
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse font-black text-2xl" 
                      : "text-foreground"
                  }`}>
                    {skill.name}
                  </span>
                  <span className={`font-mono text-sm font-bold ${
                    skill.isSpecial 
                      ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse font-black" 
                      : assignedText
                  }`}>
                    {skill.text}
                  </span>
                </div>
                
                <div className="w-full h-3 bg-secondary/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      skill.isSpecial
                        ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"
                        : assignedBg
                    }`}
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
