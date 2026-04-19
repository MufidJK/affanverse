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
    <section className="w-full py-24 bg-background relative border-t border-border/40">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 rounded-xl bg-[#2398f7]/10 text-[#2398f7]">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Frequently Affan Questions (FAQ)</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border/50 rounded-2xl px-6 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-6 font-semibold text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
