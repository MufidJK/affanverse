"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  { question: "Siapa itu Affan?", answer: "Affan itu cuma seorang pria biasa. Tapi bukan yang biasa-biasa aja — dia THE guy. Tipe orang yang masuk ke suatu tempat dan entah kenapa suasananya langsung berubah. Selamat datang di universenya. 🌌" },
  { question: "Kenapa namanya 'Affanverse'?", answer: "Karena hidup Affan itu udah kayak universe tersendiri — penuh drama, momen random, absurditas, dan entah kenapa tetap entertaining. Jadi ya, kita buatin dia versenya sendiri." },
  { question: "Kenapa web ini dibuat?", answer: "Sebagai monumen peringatan atas waktu yang terbuang sia-sia." },
  { question: "Kapan ulang tahun Affan?", answer: "24 Oktober 2009 — tandain di kalender lo, karena ini basically hari libur nasional versi kita." },
  { question: "Affan itu orangnya kayak gimana?", answer: "Tergantung kapan lo ketemu dia. Bisa jadi orang paling kalem sama pendengar yang baik di ruangan, kalo ngobrol obrolannya ngalir terus, bisa juga jadi sumber kekacauan utama. Tidak ada di antara ketiganya. Tidak ada zona aman." },
  { question: "Affan sukanya ngapain aja?", answer: "Main Basket, Scroll TikTok, Chat temen — tapi mostly ya exist dengan volume penuh dan bikin orang-orang sekitarnya mempertanyakan pilihan hidup mereka. Dengan cara yang menyenangkan tentunya." },
  { question: "Di mana bisa nemuin Affan?", answer: "Di IG — tapi kalau lo udah kenal dia, lo tau sendiri dia susah banget on time. Siapin mental dulu." },
  { question: "Affan jomblo atau enggak?", answer: "Privasi" },
  { question: "Gimana ceritanya Affanverse bisa ada?", answer: "Ada seseorang (tidak akan disebutkan namanya) yang tiba-tiba punya ide untuk bikin website khusus buat pria ini. Perlu nggak? Nggak juga. Worthwhile? Sangat. Wkwk, aslinya ini bentuk dari remaster website Affan yang lama, soalnya yang lama mangkrak + struktur folder file even webnya bener bener berantakan parah yang lama, ini bentuk remastered nya lahh" },
  { question: "Apa momen paling iconic dari Affan?", answer: "Khas Nerdy-nerdynya, tapi itu dulu kalo sekarang GG Gaming — dan ini baru yang versi bisa dipublikasikan. Sisanya masih Secret." },
  { question: "Apakah gw bisa jadi bagian dari Affanverse?", answer: "Lo udah jadi bagiannya. Sejak lo klik website ini, lo udah masuk ke universnya. Nggak ada jalan balik. Nikmatin aja." },
  { question: "Apa yang bikin Affan beda dari orang lain?", answer: "Susah dijelasin, tapi gampang dirasain. Dia tipe orang yang bikin lo ketawa tanpa niat, dan bikin lo mikir tanpa sadar. Langka sih tipe kayak gitu." },
  { question: "Apakah Affan tau website ini ada?", answer: "Sudah tau dan sudah izin dawgg — tapi mau dia tau atau nggak, udah terlanjur, palingan juga gak peduli maybe." },
  { question: "Ada pesan dari kreator Affanverse?", answer: "Buat Affan: lo nggak minta ini dibikinin. Makanya gw bikinin. Tetap exist ya, bro Affan. 🫡" },
  { question: "Apakah Affan menerima project freelance?", answer: "Menerima, asalkan tidak ada deadline dan tidak perlu dikerjakan." }
];

export function AffanFAQ() {
  return (
    <section className="w-full py-24 bg-background relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 rounded-xl bg-[#2398f7]/10 text-[#2398f7]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Frequently Affan <span className="text-[#2398f7]">Questions</span> (FAQ)</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-sm rounded-2xl px-6 border-b-0 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-5 font-medium text-left text-foreground text-lg md:text-xl">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2 font-light text-muted-foreground dark:text-gray-400 leading-relaxed text-sm md:text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
