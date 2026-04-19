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
  {
    question: "Apakah Affan menerima project freelance?",
    answer: "Menerima, asalkan tidak ada deadline dan tidak perlu dikerjakan.",
  },
  {
    question: "Kenapa web ini dibuat?",
    answer: "Sebagai monumen peringatan atas waktu yang terbuang sia-sia.",
  },
  {
    question: "Apa stack favorit Affan?",
    answer: "HTML (Hanya Tidur-Tiduran Menghabiskan Waktu).",
  },
];

export function AffanFAQ() {
  return (
    <section className="w-full py-24 bg-background relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 rounded-xl bg-[#2398f7]/10 text-[#2398f7]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Frequently Affan Questions (FAQ)</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-sm rounded-2xl px-6 border-b-0 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-5 font-medium text-left text-lg text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
