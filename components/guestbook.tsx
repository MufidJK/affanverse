"use client"

import React, { useState, useEffect } from "react"
import { MessageSquare, X, Send, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface GuestbookProps {
  pageId: string;
  variant: "floating" | "section";
  title?: string;
  description?: string;
}

export function Guestbook({ pageId, variant, title = "Tinggalkan Jejak", description = "Tulis apa aja yang ada di pikiran lu." }: GuestbookProps) {
  // FIX HYDRATION
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isGlitch = mounted && theme === "glitch"

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [pageId])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("guestbook")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: false })
      .limit(30)

    if (!error && data) {
      setMessages(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (honeypot !== "") {
      setName(""); setMessage(""); return;
    }

    if (name.trim().length < 2) return alert("Nama minimal 2 karakter bro!")
    if (message.trim().length < 5) return alert("Pesan minimal 5 karakter lahh!")
    if (message.trim().length > 200) return alert("Max 200 karakter aja ngab.")

    const storageKey = `affanverse_cooldown_${pageId}`
    const lastPost = localStorage.getItem(storageKey)
    if (lastPost) {
      const timeDiff = Date.now() - parseInt(lastPost)
      if (timeDiff < 60000) {
        return alert("Sabar ngab, tunggu semenit lagi baru bisa ngirim pesan!")
      }
    }

    setIsSubmitting(true)
    const { error } = await (supabase as any)
      .from("guestbook")
      .insert([{ name: name.trim(), message: message.trim(), page_id: pageId }])

    setIsSubmitting(false)

    if (!error) {
      localStorage.setItem(storageKey, Date.now().toString())
      setMessage("")
      fetchMessages()
    } else {
      alert("Gagal ngirim jejak, server lagi tantrum.")
    }
  }

  // ==========================================
  // TRIK DVD BOUNCE: Pisah Animasi X dan Y
  // Durasi pake angka prima (11s, 13s, 17s) biar pantulannya ga pernah nebak
  // ==========================================
  const floatStyle = (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes dvdMoveX {
        0% { transform: translateX(-40vw); }
        100% { transform: translateX(40vw); }
      }
      @keyframes dvdMoveY {
        0% { transform: translateY(-40vh); }
        100% { transform: translateY(40vh); }
      }
      
      .dvd-x-0 { animation: dvdMoveX 13s linear infinite alternate; }
      .dvd-y-0 { animation: dvdMoveY 17s linear infinite alternate; }
      
      .dvd-x-1 { animation: dvdMoveX 19s linear infinite alternate-reverse; }
      .dvd-y-1 { animation: dvdMoveY 11s linear infinite alternate; }
      
      .dvd-x-2 { animation: dvdMoveX 15s linear infinite alternate; }
      .dvd-y-2 { animation: dvdMoveY 23s linear infinite alternate-reverse; }
      
      .dvd-x-3 { animation: dvdMoveX 21s linear infinite alternate-reverse; }
      .dvd-y-3 { animation: dvdMoveY 14s linear infinite alternate-reverse; }
    `}} />
  )

  // ==========================================
  // LAPISAN GAIB: MUNCUL CUMA PAS GLITCH MODE
  // Dilengkapi sama background card biar gampang dibaca
  // ==========================================
  const glitchOverlay = isGlitch && (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      {messages.map((msg, index) => {
        // Taruh di area tengah, biar animasinya yang gerakin ke ujung layar
        const randomLeft = (index * 23) % 30 + 35; // 35vw sampe 65vw
        const randomTop = (index * 37) % 30 + 35;  // 35vh sampe 65vh
        const typeX = index % 4;
        const typeY = (index + 1) % 4;

        return (
          // Pembungkus X (Gerak Kiri Kanan)
          <div
            key={`glitch-${msg.id}`}
            className={`absolute dvd-x-${typeX}`}
            style={{
              top: `${randomTop}vh`,
              left: `${randomLeft}vw`,
            }}
          >
            {/* Pembungkus Y (Gerak Atas Bawah) */}
            <div className={`dvd-y-${typeY}`}>
              
              {/* Card Chat-nya (Ada background & border) */}
              <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl rounded-tl-none shadow-2xl w-max max-w-[280px] pointer-events-auto">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-sm text-[#2398f7]">{msg.name}</span>
                </div>
                {/* Teks RGB Statis Gak Goyang */}
                <p className="break-words text-lg font-bold bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm leading-relaxed">
                  {msg.message}
                </p>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )

  // ==========================================
  // RENDER UI: VARIANT FLOATING (Buat Homepage)
  // ==========================================
  if (variant === "floating") {
    return (
      <>
        {floatStyle}
        {glitchOverlay} {/* Panggil lapisan gaibnya di sini */}
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 transition-transform hover:scale-110 active:scale-95 bg-[#2398f7] hover:bg-[#1e82d4] text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <div className="fixed bottom-24 right-6 w-[340px] max-h-[600px] flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in slide-in-from-bottom-5 md:right-8 md:bottom-28">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50">
              <h3 className="font-bold text-lg text-[#2398f7]">Home Shoutbox</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/30">
              <input type="text" className="absolute w-0 h-0 opacity-0 -z-10" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
              
              <input 
                type="text" 
                placeholder="Nama / Nickname" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={isSubmitting} 
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-[#2398f7] focus:ring-1 focus:ring-[#2398f7] outline-none transition-all shadow-sm" 
              />
              <div className="relative">
                <textarea 
                  placeholder="Pesan lu buat ninggalin jejak kenangan..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  disabled={isSubmitting} 
                  rows={3} 
                  className="w-full text-sm px-4 py-3 pr-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-[#2398f7] focus:ring-1 focus:ring-[#2398f7] resize-none outline-none transition-all shadow-sm" 
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isSubmitting || !name || !message} 
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-[#2398f7] hover:bg-[#1e82d4] text-white transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                </Button>
              </div>
            </form>

            <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[300px] scrollbar-thin">
              {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">Belom ada jejak.</div>
              ) : isGlitch ? (
                <div className="text-center text-sm text-[#2398f7] py-8 animate-pulse font-medium">
                  Jejak tersebar ke dimensi lain...
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="space-y-1.5 relative">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-[#2398f7]">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleDateString("id-ID")}</span>
                    </div>
                    {/* UI BUBBLE ASLI */}
                    <div className="p-3 rounded-2xl rounded-tl-none text-sm w-max max-w-full break-words shadow-sm bg-zinc-100 dark:bg-zinc-800/50">
                      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // ==========================================
  // RENDER UI: VARIANT SECTION (Buat Void/Chronicle)
  // ==========================================
  return (
    <section className="w-full py-16 border-t border-zinc-200 dark:border-zinc-800 mt-20 relative z-10">
      {floatStyle}
      {glitchOverlay} {/* Panggil lapisan gaibnya di sini juga */}
      
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#2398f7]">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-12 space-y-5 bg-white dark:bg-zinc-900/20 p-6 md:p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm relative z-20">
           <input type="text" className="absolute w-0 h-0 opacity-0 -z-10" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />

          <input 
            type="text" 
            placeholder="Nama lu" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={isSubmitting} 
            className="w-full max-w-xs text-sm px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:border-[#2398f7] focus:ring-1 focus:ring-[#2398f7] outline-none transition-all" 
          />
          <div className="relative">
            <textarea 
              placeholder="Tulis pesan lu di sini..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              disabled={isSubmitting} 
              rows={4} 
              className="w-full text-sm px-4 py-4 pb-14 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:border-[#2398f7] focus:ring-1 focus:ring-[#2398f7] resize-none outline-none transition-all" 
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !name || !message} 
              className="absolute right-3 bottom-3 rounded-full bg-[#2398f7] hover:bg-[#1e82d4] text-white px-5"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2 ml-0.5" />}
              {isSubmitting ? "Ngirim..." : "Kirim Pesan"}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl">Belom ada jejak sama sekali.</p>
          ) : isGlitch ? (
            <p className="text-center text-[#2398f7] py-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl animate-pulse font-medium">
              Jejak tersebar ke dimensi lain...
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-[#2398f7]">{msg.name}</span>
                  <span className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                    {new Date(msg.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}