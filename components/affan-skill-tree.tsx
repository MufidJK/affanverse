"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain, Bug, Coffee, Moon } from "lucide-react";

const SKILLS = [
  {
    name: "Sleep Mastery",
    level: 99,
    label: "Mastery",
    icon: <Moon className="w-4 h-4" />,
    color: "bg-indigo-500",
  },
  {
    name: "Creating Bugs",
    level: 85,
    label: "Advanced",
    icon: <Bug className="w-4 h-4" />,
    color: "bg-red-500",
  },
  {
    name: "Solving Bugs",
    level: 2,
    label: "Beginner",
    icon: <Zap className="w-4 h-4" />,
    color: "bg-yellow-500",
  },
  {
    name: "Procrastination",
    level: 100,
    label: "God Tier",
    icon: <Brain className="w-4 h-4" />,
    color: "bg-orange-500",
  },
  {
    name: "Rebahan Level",
    level: 100,
    label: "Transcendant",
    icon: <Coffee className="w-4 h-4" />,
    color: "bg-blue-500",
    isInfinite: true,
  },
];

export function AffanSkillTree() {
  return (
    <section className="w-full py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            The Skill Tree <span className="text-[#2398f7]">(Tech Stack Parody)</span>
          </h2>
          <p className="text-muted-foreground text-lg italic">
            "I have a very particular set of skills. Skills that make me a nightmare for project managers."
          </p>
        </div>

        <div className="grid gap-8">
          {SKILLS.map((skill, index) => (
            <div key={index} className="space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${skill.color} bg-opacity-10 text-primary`}>
                    {skill.icon}
                  </div>
                  <span className="font-bold text-lg">{skill.name}</span>
                </div>
                <Badge variant="secondary" className="bg-[#2398f7]/10 text-[#2398f7] border-none font-mono">
                  {skill.isInfinite ? "∞" : `${skill.level}%`} — {skill.label}
                </Badge>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/30">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${skill.color} shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:brightness-110`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
