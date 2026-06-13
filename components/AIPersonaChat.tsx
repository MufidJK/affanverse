"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Send, Bot, User, Cpu, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AIPersonaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Halo bang! Gw Affan AI. Mau kepo soal Cursed Entity 67, 100 Days Ambatron, cerita Affan The Apex Predator, atau yg lainnya? Tanyain aja coeg!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Force scroll to top on mount to override browser scroll restoration
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
    return () => clearTimeout(scrollTimer);
  }, []);

  // Scroll to bottom of chat only when new messages are added or loading status changes after mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await response.json();
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Gacor parah! Mesin backend Python kita terkoneksi dengan sempurna.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Waduh coeg, koneksi ke otak AI backend lu agak ngadet. Coba cek python agent.py lu udah jalan belom?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: "Console cleared. Halo bang! Tanya apa aja soal Cursed Entity 67, 100 Days Ambatron, cerita Affan The Apex Predator, atau yg lainnya? Tanyain aja coeg",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <section className="relative w-full py-20 md:py-32 border-y border-black/5 dark:border-white/5 overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20">
      {/* Dot Matrix / Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Static Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(35,152,247,0.08)_0%,transparent_70%)]" />

      <div className="container relative mx-auto px-4 sm:px-6 z-10 flex flex-col items-center">
        {/* Header & Status */}
        <div className="flex flex-col items-center text-center mb-10 space-y-5">
          <div className="inline-flex items-center space-x-2 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">AI SYSTEM: ONLINE</span>
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-sans font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            <span className="font-mono text-[#2398f7]">&gt;_</span> INTERACT WITH <span style={{color: "#2398f7"}}>AFFAN AI</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl font-sans">
            Ask me about 100 Days Ambatron, Every features, or The Apex Predator, anything in Affanverse.
          </p>
        </div>

        {/* Chat Terminal Container */}
        <div className="w-full sm:max-w-2xl lg:max-w-4xl mx-auto transition-all duration-300">
          <div className={`w-full rounded-xl overflow-hidden border transition-all duration-300 transform-gpu bg-white dark:bg-[#090d16] ${isFocused ? "border-[#2398f7] shadow-[0_0_0_1px_rgba(35,152,247,0.5)]" : "border-zinc-200 dark:border-zinc-800/80 shadow-xl"}`}>
            
            {/* macOS Window Header */}
            <div className="bg-zinc-100/90 dark:bg-[#0f1626]/90 px-4 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 select-none">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer" onClick={clearChat} title="Clear Terminal" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] transition-transform duration-150 hover:scale-110 active:scale-95" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] transition-transform duration-150 hover:scale-110 active:scale-95" />
              </div>
              <div className="flex items-center space-x-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-[#2398f7]" />
                <span className="hidden sm:inline">AFFAN AI</span>
                <span className="sm:hidden">AFFAN AI</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-zinc-200/60 dark:bg-zinc-800/60 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">ACTIVE</span>
              </div>
            </div>

            {/* Chat Output Window */}
            <ScrollArea className="h-[400px] md:h-[450px] lg:max-h-[70vh] 2xl:h-[600px] 2xl:max-h-none p-4 sm:p-6 bg-zinc-50/50 dark:bg-[#070b12] font-mono text-sm" tabIndex={-1}>
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    {/* Avatar Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${msg.role === "user" ? "bg-[#2398f7] text-white" : "bg-zinc-200 dark:bg-[#131b2e] text-zinc-700 dark:text-[#2398f7] border border-zinc-300/50 dark:border-[#2398f7]/20"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`rounded-xl px-4 py-3 border transition-all duration-200 ${msg.role === "user" ? "bg-[#2398f7] border-[#1d82d4] text-white rounded-tr-none shadow-sm" : "bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-tl-none shadow-sm"}`}>
                        {msg.role === "assistant" ? (
                          <ReactMarkdown
                            components={{
                              // Override <p> to preserve existing text styling
                              p: ({ children }) => (
                                <p className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed antialiased break-words">
                                  {children}
                                </p>
                              ),
                              // Override <a> to render as a Next.js Link styled like a primary button
                              a: ({ href, children }) => {
                                // Only intercept internal routes (starting with /)
                                if (href && href.startsWith("/")) {
                                  return (
                                    <span className="block mt-3">
                                      <Link
                                        href={href}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all duration-200 transform-gpu will-change-transform bg-[#2398f7] text-white hover:bg-[#1a7fd1] hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#2398f7]/20 h-10 px-5 py-2"
                                      >
                                        {children}
                                        <ArrowRight className="w-4 h-4" />
                                      </Link>
                                    </span>
                                  );
                                }
                                // External links fallback (shouldn't happen per prompt rules)
                                return (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#2398f7] underline underline-offset-2 hover:text-[#1a7fd1] transition-colors">
                                    {children}
                                  </a>
                                );
                              },
                              // Strip wrapper elements that react-markdown may add
                              ul: ({ children }) => <ul className="list-disc list-inside mt-2 space-y-1 font-sans text-[15px]">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mt-2 space-y-1 font-sans text-[15px]">{children}</ol>,
                              li: ({ children }) => <li className="font-sans text-[15px] leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed antialiased break-words">{msg.content}</p>
                        )}
                      </div>
                      <span className="text-[10px] mt-1 text-zinc-400 dark:text-zinc-500 px-1 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200 dark:bg-[#131b2e] text-[#2398f7] border border-[#2398f7]/20">
                      <Cpu className="w-4 h-4 animate-spin text-[#2398f7]" />
                    </div>
                    <div className="flex flex-col max-w-[85%] sm:max-w-[78%]">
                      <div className="bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-zinc-800/80 rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                        <div className="flex space-x-1.5">
                          <div className="w-1.5 h-1.5 bg-[#2398f7] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 bg-[#2398f7] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 bg-[#2398f7] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 pl-1.5">Processing logic...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white dark:bg-[#0c1220] border-t border-zinc-200 dark:border-zinc-800/80 flex gap-2 items-center">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-zinc-400 dark:text-zinc-600 font-mono text-sm select-none">$</span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Tanyain hal absurd Affanverse in here..."
                  className="flex-1 pl-7 font-sans text-[15px] antialiased bg-muted/30 dark:bg-[#060a12] border-zinc-200 dark:border-zinc-800/80 focus-visible:ring-[#2398f7] focus-visible:ring-1 focus-visible:border-[#2398f7] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="bg-[#2398f7] hover:bg-[#1a7fd1] text-white font-mono px-4 sm:px-5 py-2.5 h-auto transition-transform duration-200 transform-gpu will-change-transform hover:scale-[1.03] active:scale-[0.97] flex items-center space-x-1.5 shadow-md shadow-[#2398f7]/10"
                disabled={isLoading || !input.trim()}
              >
                <span className="hidden sm:inline">SEND</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
