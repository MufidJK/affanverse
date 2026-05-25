"use client";

import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";

export const MemoryLeakTrigger = () => {
  const { setTerminalVisible } = useTerminalStore();

  return (
    <div className="w-full flex justify-center py-8">
      <motion.button
        onClick={() => setTerminalVisible(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.5, 0.2, 0.8, 0.1] }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "linear",
          times: [0, 0.2, 0.5, 0.8, 1]
        }}
        className="text-[10px] sm:text-xs font-mono text-red-900/40 hover:text-red-500/80 hover:bg-red-900/10 px-2 py-1 rounded cursor-pointer transition-colors"
      >
        [SYSTEM_ERROR]: Memory Leak Detected at 0x00F83A...
      </motion.button>
    </div>
  );
};
