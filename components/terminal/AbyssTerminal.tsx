"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTerminalStore, TerminalLine } from "@/store/useTerminalStore";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useTypewriter } from "@/hooks/useTypewriter";
import { TerminalModelViewer } from "./TerminalModelViewer";
import abyssLore from "@/src/data/abyssLore.json";

interface TypewriterLineProps {
  text: string;
  id: string;
  onStart: (id: string, length: number) => void;
  onComplete: (id: string) => void;
  onCharTyped: () => void;
}

const TypewriterLine = ({ text, id, onStart, onComplete, onCharTyped }: TypewriterLineProps) => {
  const { displayedText, isComplete } = useTypewriter(text, 15);
  const startedRef = useRef(false);
  const completedRef = useRef(false);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!startedRef.current && text.length > 0) {
      startedRef.current = true;
      onStart(id, text.length);
    }
  }, [text, id, onStart]);

  useEffect(() => {
    const currentLength = displayedText.length;
    if (currentLength > prevLengthRef.current) {
      onCharTyped();
      prevLengthRef.current = currentLength;
    }
  }, [displayedText, onCharTyped]);

  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete(id);
    }
  }, [isComplete, id, onComplete]);

  return <span className="whitespace-pre-wrap leading-relaxed font-mono">{displayedText}</span>;
};

export const AbyssTerminal = () => {
  const [isAbyssTheme, setIsAbyssTheme] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile(); // Init
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    isVisible,
    isAuthorized,
    history,
    activeMedia,
    toggleTerminal,
    setTerminalVisible,
    setAuthorized,
    addHistory,
    clearHistory,
    setActiveMedia
  } = useTerminalStore();

  const [input, setInput] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);
  const [isMonitorGlitching, setIsMonitorGlitching] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [, setTypingLines] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const accessGrantedAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const lastPlayTimeRef = useRef<number>(0);
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitorGlitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useKeyboardShortcut({ key: "`", ctrlKey: true }, () => {
    toggleTerminal();
  });

  // TASK 1: FIX VIRTUAL KEYBOARD OVERLAP (Mobile dynamically resizes)
  useEffect(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      const handleResize = () => {
        setViewportHeight(window.visualViewport!.height);
      };
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize(); // Init
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleStartTyping = useCallback((id: string, length: number) => {
    setTypingLines((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    if (length > 50 && ambientAudioRef.current) {
      if (ambientAudioRef.current.paused) {
        ambientAudioRef.current.currentTime = 0;
        ambientAudioRef.current.play().catch(() => {});
      }
    }
  }, []);

  const handleCompleteTyping = useCallback((id: string) => {
    setTypingLines((prev) => {
      const next = new Set(prev);
      next.delete(id);
      if (next.size === 0 && ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      return next;
    });
  }, []);

  const playCharacterSound = useCallback(() => {
    const now = performance.now();
    if (now - lastPlayTimeRef.current > 75) {
      if (typingAudioRef.current) {
        typingAudioRef.current.currentTime = 0;
        typingAudioRef.current.volume = 0.15;
        typingAudioRef.current.play().catch(() => {});
      }
      lastPlayTimeRef.current = now;
    }
  }, []);

  const cleanupAudioAndTimers = useCallback(() => {
    if (typingAudioRef.current) {
      typingAudioRef.current.pause();
      typingAudioRef.current = null;
    }
    if (accessGrantedAudioRef.current) {
      accessGrantedAudioRef.current.pause();
      accessGrantedAudioRef.current = null;
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
      videoRef.current = null;
    }
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
    if (monitorGlitchTimerRef.current) clearTimeout(monitorGlitchTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  const handleClear = useCallback(() => {
    clearHistory();
    setActiveMedia(null);
    setTypingLines(new Set());
    if (typingAudioRef.current) typingAudioRef.current.pause();
    if (ambientAudioRef.current) ambientAudioRef.current.pause();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, [clearHistory, setActiveMedia]);

  useEffect(() => {
    if (isVisible && typeof window !== "undefined") {
      accessGrantedAudioRef.current = new Audio("/dnsl-mr-bones-access-granted.mp3");
      typingAudioRef.current = new Audio("/keyboard-typing-sound-effect.mp3");
      ambientAudioRef.current = new Audio("/textlong.mp3");
      
      if (accessGrantedAudioRef.current) accessGrantedAudioRef.current.volume = 0.6;
      if (typingAudioRef.current) typingAudioRef.current.volume = 0.15;
      if (ambientAudioRef.current) ambientAudioRef.current.volume = 0.7;
    }
    return () => cleanupAudioAndTimers();
  }, [isVisible, cleanupAudioAndTimers]);

  // TASK 2: FIX MOBILE SCROLL FREEZE (Removed 'position: fixed')
  useEffect(() => {
    if (isVisible && typeof window !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible]);

  // Derived length — useEffect only re-runs when a new history entry is added,
  // NOT when activeMedia swaps or isVisible toggles. This stops the auto-scroll
  // from canceling the user's touch tap on the inline mobile video controls.
  const historyLength = history.length;
  useEffect(() => {
    if (isVisible && !isExiting) {
      // Small timeout allows the DOM to render the inline media before scrolling
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);

      // Only auto-focus the input on desktop (non-touch) devices.
      // On mobile, programmatic .focus() hijacks native video controls
      // by stealing focus away from the <video> element the user tapped.
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (isDesktop) {
        inputRef.current?.focus();
      }
    }
  }, [historyLength, isVisible, isExiting]);

  const triggerMonitorGlitch = () => {
    setIsMonitorGlitching(true);
    if (monitorGlitchTimerRef.current) clearTimeout(monitorGlitchTimerRef.current);
    monitorGlitchTimerRef.current = setTimeout(() => setIsMonitorGlitching(false), 350);
  };

  const handleAnimationComplete = () => {
    if (isExiting) {
      setTerminalVisible(false);
      setIsExiting(false);
      cleanupAudioAndTimers();
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    if (ambientAudioRef.current && !ambientAudioRef.current.paused) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }

    addHistory({
      type: "input",
      text: `${isAuthorized ? "root@apex:~#" : "guest@abyss:~$"} ${trimmedCmd}`
    });
    setInput("");

    const args = trimmedCmd.split(/\s+/);
    const mainCommand = args[0].toLowerCase();

    if (mainCommand === "exit") {
      addHistory({ type: "system", text: "Initializing core purge..." });
      addHistory({ type: "system", text: "Severing terminal hooks..." });
      setIsExiting(true);
      setActiveMedia(null);
      return;
    }

    if (mainCommand === "clear") {
      handleClear();
      return;
    }

    if (!isAuthorized) {
      if (trimmedCmd === "SUDO_RPD_APEX") {
        setAuthorized(true);
        setIsGlitching(true);
        addHistory({ type: "system", text: "WARNING: APEX PREDATOR OVERRIDE ACCEPTED." });

        if (accessGrantedAudioRef.current) {
          accessGrantedAudioRef.current.currentTime = 0;
          accessGrantedAudioRef.current.play().catch(() => {});
        }

        if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current);
        glitchTimerRef.current = setTimeout(() => setIsGlitching(false), 2000);
      } else {
        addHistory({ type: "error", text: "Access Denied. Intruder logged." });
      }
      return;
    }

    if (["help", "read", "render", "override", "restore"].includes(mainCommand)) {
      triggerMonitorGlitch();
    }

    if (mainCommand === "render" && args[1] === "true_form.obj") {
      addHistory({ 
        type: "system", 
        text: "[SYSTEM]: INITIALIZING WEBGL CONTEXT... RENDERING CORRUPTED MESH.",
        media: { type: "3d", src: "/models/cursed-1.glb" }
      });
      setActiveMedia({ type: "3d", url: "/models/cursed-1.glb" });
      return;
    }

    if (mainCommand === "override" && args[1] === "--theme" && args[2] === "abyss") {
      addHistory({ type: "system", text: "[CRITICAL WARNING]: OVERRIDING SYSTEM THEME... WELCOME TO THE ABYSS." });
      setIsAbyssTheme(true);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => setIsExiting(true), 1500);
      return;
    }

    if (mainCommand === "restore" && args[1] === "--theme" && args[2] === "light") {
      addHistory({ type: "system", text: "[SYSTEM]: RESTORING DEFAULT LIGHT THEME OVERRIDE." });
      setIsAbyssTheme(false);
      return;
    }

    switch (mainCommand) {
      case "help": {
        const helpData = abyssLore["help"];
        addHistory({ type: "system", text: helpData.content });
        break;
      }
      case "read": {
        const filename = args[1];
        if (filename) {
          const matchedKey = Object.keys(abyssLore).find(
            (key) => key.toLowerCase() === filename.toLowerCase() && key !== "help"
          );
          if (matchedKey) {
            const fileData = abyssLore[matchedKey as keyof typeof abyssLore];
            const mediaPayload = (fileData.type === "video" || fileData.type === "image" || fileData.type === "3d" || fileData.type === "ascii") 
              ? { type: fileData.type as any, src: (fileData as any).src } 
              : undefined;

            addHistory({ 
              type: fileData.type as any, 
              text: fileData.content,
              media: mediaPayload
            });

            if (fileData.type === "video") setActiveMedia({ type: "video", url: "/vidAffanApex.mp4" });
            else if (fileData.type === "image") setActiveMedia({ type: "image", url: (fileData as any).src });
            else setActiveMedia(null);
          } else {
            addHistory({ type: "error", text: "[ERR_0x009]: UNRECOGNIZED LOG KEY. ACCESS DENIED." });
          }
        } else {
          addHistory({ type: "error", text: "[ERR_0x009]: UNRECOGNIZED LOG KEY. ACCESS DENIED." });
        }
        break;
      }
      default: {
        addHistory({ type: "error", text: `[SYSTEM_ERROR]: Command not recognized. Type 'help' for available nodes.` });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCommand(input);
  };

  const renderInlineMedia = (media?: TerminalLine['media']) => {
    if (!media || !isMobile) return null; // CRITICAL FIX: Prevents Double Mount
    const wrapperClass = "flex lg:hidden mt-4 w-full max-w-sm relative rounded-lg border border-[#2398f7]/40 overflow-hidden bg-black/50 p-2 h-auto z-[50]";

    switch (media.type) {
      case "video":
        return (
          <div className="mt-4 w-full flex flex-col lg:hidden relative z-[9999] isolate pointer-events-auto">
            <video
              controls
              playsInline
              src={media.src}
              className="w-full max-w-[300px] mx-auto aspect-[9/16] rounded-lg border border-[#2398f7]/40 bg-black pointer-events-auto"
            />
            <div className="mt-3 w-full max-w-[300px] mx-auto text-cyan-400 font-bold text-xs tracking-wider text-center border border-cyan-400/30 bg-cyan-400/10 p-2 rounded">
              [SYSTEM WARNING]: OS MOBILE TERDETEKSI. DEKRIPSI VIDEO GAGAL. SILAKAN AKSES MELALUI DESKTOP ATAU PC UNTUK MEMUTAR DATA.
            </div>
          </div>
        );
      case "image":
        return (
          <div className={wrapperClass}>
            <Image src={media.src || ""} width={450} height={450} className="w-full h-auto object-contain" alt="classified relic" />
          </div>
        );
      case "3d":
        return (
          <div className={wrapperClass}>
            <div className="w-full aspect-square"><TerminalModelViewer url={media.src || ""} /></div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      {isAbyssTheme && (
        <style dangerouslySetInnerHTML={{
          __html: `body, html { background-color: #050505 !important; color: #ff003c !important; } * { border-color: #8b0000 !important; }`
        }} />
      )}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              isExiting ? { opacity: [1, 0.4, 0.8, 0], scaleY: [1, 1, 0.01, 0] }
              : isMonitorGlitching ? { x: [-2, 2, -2, 2, 0], opacity: [1, 0.3, 0.9, 0.2, 1] }
              : { x: 0, opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 1.05 }}
            transition={isExiting ? { duration: 0.6, ease: "easeInOut" } : isMonitorGlitching ? { duration: 0.35, ease: "linear" } : { duration: 0.3 }}
            onAnimationComplete={handleAnimationComplete}
            style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
            className={`fixed inset-0 z-[9999] w-screen bg-[#050505] p-4 lg:p-6 font-mono text-[#00FF41] overflow-hidden overscroll-none flex flex-col lg:flex-row gap-4 lg:gap-6 will-change-transform transform-gpu`}
          >
            {isGlitching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.8, 0.1, 0.9, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="absolute inset-0 bg-red-500 mix-blend-overlay pointer-events-none z-[10000]"
              />
            )}

            <div className={`flex flex-col transition-all duration-500 ease-in-out ${activeMedia ? "h-full w-full lg:w-1/2 lg:border-r border-[#00FF41]/30 pt-4 lg:pt-0 lg:pr-6" : "h-full w-full"}`}>
              <div
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y pointer-events-auto space-y-3 scrollbar-thin scrollbar-thumb-[#00FF41]/30 font-mono"
              >
                {history.map((entry) => (
                  <div key={entry.id} className="flex flex-col">
                    <div className={`break-words whitespace-pre-wrap leading-relaxed font-mono ${
                        entry.type === "error" ? "text-red-500 font-medium"
                        : entry.type === "system" ? "text-[#00FF41]/80 font-bold"
                        : entry.type === "lore" || entry.type === "ascii" || entry.type === "text" || entry.type === "video" || entry.type === "image" ? "text-cyan-400"
                        : "text-[#00FF41]"
                      }`}
                    >
                      {entry.type === "input" ? (
                        <span className="font-mono">{entry.text}</span>
                      ) : (
                        <TypewriterLine
                          text={entry.text}
                          id={entry.id}
                          onStart={handleStartTyping}
                          onComplete={handleCompleteTyping}
                          onCharTyped={playCharacterSound}
                        />
                      )}
                    </div>
                    {entry.media && renderInlineMedia(entry.media)}
                  </div>
                ))}
                <div ref={bottomRef} className="h-4" />
              </div>

              <div className="mt-4 flex items-center border-t border-[#00FF41]/30 pt-4 font-mono shrink-0 sticky bottom-0 bg-[#050505] pb-2 z-[60]">
                <span className="mr-2 select-none text-[#00FF41]/75 font-mono">
                  {isAuthorized ? "root@apex:~#" : "guest@abyss:~$"}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isExiting}
                  className="flex-1 bg-transparent outline-none text-[#00FF41] caret-[#00FF41] selection:bg-[#00FF41]/20 font-mono disabled:opacity-50 pointer-events-auto"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>

            {activeMedia && !isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="hidden lg:flex flex-col w-1/2 h-full border-l border-[#2398f7]/30 p-4 relative justify-center items-center bg-[#050505] shrink-0"
              >
                <div className="absolute top-4 left-4 text-[#00FF41]/70 text-xs tracking-widest uppercase z-10">
                  [DATA_STREAM: {activeMedia.url.split('/').pop()}]
                </div>
                <div className={`w-full h-full relative mt-8 flex-1 min-h-0 flex justify-center items-center ${
                  activeMedia.type === "image" ? "border border-[#2398f7]/50 bg-black/80"
                  : activeMedia.type === "3d" ? ""
                  : "border border-[#00FF41]/20"
                }`}>
                  {activeMedia.type === "video" ? (
                    <video
                      ref={videoRef}
                      src={activeMedia.url}
                      controls
                      playsInline
                      preload="none"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-full object-contain outline-none absolute inset-0 pointer-events-auto"
                      autoPlay={false}
                    />
                  ) : activeMedia.type === "3d" ? (
                    <div className="w-full h-full absolute inset-0"><TerminalModelViewer url={activeMedia.url} /></div>
                  ) : (
                    <div className="w-full h-full absolute inset-0"><Image src={activeMedia.url} alt="Anomaly" fill className="object-contain" /></div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
