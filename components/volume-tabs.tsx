"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type VolumeTabsProps = {
  activeTab: string;
};

export function VolumeTabs({ activeTab }: VolumeTabsProps) {
  return (
    <div className="w-full mt-8 flex justify-center">
      <div className="flex w-fit mx-auto p-1 bg-gray-100 dark:bg-zinc-900 rounded-full mb-8 relative">
        {['ln', 'manhwa'].map((tabId) => {
          const label = tabId === 'ln' ? 'Light Novel' : 'Manhwa';
          const isActive = activeTab === tabId;

          return (
            <Link
              key={tabId}
              href={`?tab=${tabId}`}
              scroll={false}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10 ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="vol-tab-indicator"
                  className="absolute inset-0 bg-[#2398f7] rounded-full -z-10 will-change-transform transform-gpu"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
