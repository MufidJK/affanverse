"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApexMarketAsset, ChaosEventState } from "@/types/apex";
import { WidgetModal } from "./apex-exchange/WidgetModal";

// === RULE 8: Lazy Loading — all modals dynamically imported with ssr: false ===
const GlobalMarketCapModal = dynamic(
  () => import("./apex-exchange/modals/GlobalMarketCapModal"),
  { ssr: false, loading: () => <ModalLoader /> }
);
const Apex20IndexModal = dynamic(
  () => import("./apex-exchange/modals/Apex20IndexModal"),
  { ssr: false, loading: () => <ModalLoader /> }
);
const FearGreedModal = dynamic(
  () => import("./apex-exchange/modals/FearGreedModal"),
  { ssr: false, loading: () => <ModalLoader /> }
);
const AltcoinSeasonModal = dynamic(
  () => import("./apex-exchange/modals/AltcoinSeasonModal"),
  { ssr: false, loading: () => <ModalLoader /> }
);
const CryptoRSIModal = dynamic(
  () => import("./apex-exchange/modals/CryptoRSIModal"),
  { ssr: false, loading: () => <ModalLoader /> }
);

function ModalLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-[#2398f7] font-mono animate-pulse text-sm">Loading data...</div>
    </div>
  );
}

interface MarketWidgetsProps {
  totalMarketCap: number;
  apex20Value: number;
  apex20Change: number;
  assets: ApexMarketAsset[];
  chaosState?: ChaosEventState | null;
}

type ModalType = 1 | 2 | 3 | 4 | 5 | null;

export function MarketWidgets({ totalMarketCap, apex20Value, apex20Change, assets, chaosState }: MarketWidgetsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const formatCompactCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(val);
  };

  const isApex20Up = apex20Change >= 0;
  
  // Dynamic Fear & Greed Math — Chaos Override
  const isChaosActive = chaosState?.phase === "active";
  const baseFearGreedValue = 87;
  // During chaos, force extreme fear or greed based on event id hash
  const chaosDirection = chaosState?.event.id.charCodeAt(0) ?? 0;
  const fearGreedValue = isChaosActive
    ? (chaosDirection % 2 === 0 ? 8 + Math.floor(chaosDirection % 7) : 92 + Math.floor(chaosDirection % 6))
    : baseFearGreedValue;
  const fearGreedRotation = (fearGreedValue / 100) * 180;
  const fearGreedLabel = fearGreedValue < 25 ? "Extreme Fear" : fearGreedValue > 75 ? "Greed" : "Neutral";
  const fearGreedLabelColor = fearGreedValue < 25 ? "text-red-500" : "text-emerald-500";

  const widgetBaseClass =
    "p-4 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2398f7]/20 shadow-sm flex flex-col justify-center transition-all duration-300 cursor-pointer hover:opacity-80 hover:border-[#2398f7]/40 will-change-transform";

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 w-full">
        
        {/* 1. Widget: Global Market Cap */}
        <button
          className={widgetBaseClass}
          onClick={() => setActiveModal(1)}
          aria-label="Open Global Market Cap details"
        >
          <div className="text-xs text-zinc-500 dark:text-white/50 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
            Global Market Cap <span className="text-[#2398f7]">›</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white text-left">{formatCompactCurrency(totalMarketCap)}</div>
          <div className="text-sm text-emerald-500 dark:text-[#2398f7] mt-1 font-medium text-left">+2.5% 24h</div>
        </button>

        {/* 2. Widget: Apex20 Performance */}
        <button
          className={widgetBaseClass}
          onClick={() => setActiveModal(2)}
          aria-label="Open Apex20 Index details"
        >
          <div className="text-xs text-zinc-500 dark:text-white/50 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
            Apex20 Index <span className="text-[#2398f7]">›</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white text-left">{formatNumber(apex20Value)}</div>
          <div className={`text-sm mt-1 font-medium text-left ${isApex20Up ? "text-emerald-500 dark:text-[#2398f7]" : "text-red-500 dark:text-[#ef4444]"}`}>
            {isApex20Up ? "+" : ""}{formatNumber(apex20Change)}% 24h
          </div>
        </button>

        {/* 3. Widget: Fear & Greed Gauge */}
        <button
          className={`${widgetBaseClass} items-center relative overflow-hidden ${isChaosActive ? (fearGreedValue < 25 ? "border-red-500/60 dark:border-[#ef4444]/60" : "border-emerald-500/60 dark:border-emerald-400/60") : ""}`}
          onClick={() => setActiveModal(3)}
          aria-label="Open Fear and Greed Index details"
        >
          <div className="text-xs text-zinc-500 dark:text-white/50 mb-2 uppercase tracking-wider font-semibold w-full text-left flex items-center gap-1">
            Fear & Greed Index <span className="text-[#2398f7]">›</span>
          </div>
          <div className="relative w-full max-w-[120px] aspect-[2/1] mt-2">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              {/* 4 Distinct Segments */}
              {/* Red (180 to 135) */}
              <path d="M 10 50 A 40 40 0 0 1 21.72 21.72" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="butt" />
              {/* Orange (135 to 90) */}
              <path d="M 21.72 21.72 A 40 40 0 0 1 50 10" fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="butt" />
              {/* Yellow (90 to 45) */}
              <path d="M 50 10 A 40 40 0 0 1 78.28 21.72" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="butt" />
              {/* Green (45 to 0) */}
              <path d="M 78.28 21.72 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="butt" />
              
              {/* Dynamic Marker */}
              <circle 
                cx="10" 
                cy="50" 
                r="4" 
                className="fill-white dark:fill-[#111] transition-transform duration-1000 ease-out" 
                stroke="#22c55e" 
                strokeWidth="2" 
                transform={`rotate(${fearGreedRotation}, 50, 50)`}
              />
            </svg>
            
            {/* Inner Text Placement inside empty arc bottom center */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <span className="text-xl font-bold text-zinc-900 dark:text-white leading-none">{fearGreedValue}</span>
              <span className={`text-[10px] uppercase font-bold ${fearGreedLabelColor}`}>{fearGreedLabel}</span>
            </div>
          </div>
        </button>

        {/* 4. Widget: Jekacoin vs Altcoin Season */}
        <button
          className={widgetBaseClass}
          onClick={() => setActiveModal(4)}
          aria-label="Open Altcoin Season Index details"
        >
          <div className="text-xs text-zinc-500 dark:text-white/50 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
            Altcoin Season Index <span className="text-[#2398f7]">›</span>
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-none text-left">67 <span className="text-sm font-normal text-zinc-500 dark:text-white/50">/ 100</span></div>
          
          <div className="relative w-full h-2 rounded-full overflow-hidden flex mb-2 mt-1">
            <div className="flex-1 bg-orange-500"></div>     {/* Solid Orange */}
            <div className="flex-1 bg-orange-300"></div>     {/* Light Orange */}
            <div className="flex-1 bg-sky-300"></div>        {/* Light Blue */}
            <div className="flex-1 bg-sky-500 dark:bg-[#2398f7]"></div> {/* Solid Blue */}
            
            {/* Value Marker at 67% */}
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-gray-300 shadow-sm rounded-full" style={{ left: 'calc(67% - 7px)' }} />
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/50 font-medium">
            <span>Jekacoin</span>
            <span>Altcoin</span>
          </div>
        </button>

        {/* 5. Widget: Average Crypto RSI */}
        <button
          className={widgetBaseClass}
          onClick={() => setActiveModal(5)}
          aria-label="Open Average Crypto RSI details"
        >
          <div className="text-xs text-zinc-500 dark:text-white/50 mb-2 uppercase tracking-wider font-semibold flex items-center gap-1">
            Average RSI (14D) <span className="text-[#2398f7]">›</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 leading-none text-left">55 <span className="text-sm font-normal text-zinc-500 dark:text-white/50">Neutral</span></div>
          <div className="relative w-full h-2 rounded-full overflow-hidden mb-2 mt-1">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-purple-500 to-red-500" />
             {/* Value Marker at 55% */}
             <div className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)]" style={{ left: '55%' }} />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 dark:text-white/50 font-medium">
            <span>0</span>
            <span>100</span>
          </div>
        </button>

      </div>

      {/* === MODALS — Conditional rendering per Rule 9 (no display:none) === */}
      {activeModal === 1 && (
        <WidgetModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Market Overview"
          subtitle="Stay updated on the latest cryptocurrency market trends, including Jekacoin dominance, altcoin season, ETF net flows, and real-time market sentiment."
        >
          <GlobalMarketCapModal assets={assets} totalMarketCap={totalMarketCap} />
        </WidgetModal>
      )}

      {activeModal === 2 && (
        <WidgetModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Apex20 Index"
          subtitle="Built by the Affanverse data authority, the Apex20 Index provides the most unbiased, transparent, and data-driven way to track crypto market performance."
        >
          <Apex20IndexModal assets={assets} apex20Value={apex20Value} apex20Change={apex20Change} />
        </WidgetModal>
      )}

      {activeModal === 3 && (
        <WidgetModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Affanverse Fear and Greed Index"
          subtitle="Discover our Fear and Greed Index, a powerful tool that analyzes market sentiment to help you make informed crypto investment decisions."
        >
          <FearGreedModal totalMarketCap={totalMarketCap} />
        </WidgetModal>
      )}

      {activeModal === 4 && (
        <WidgetModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Affanverse Altcoin Season Index"
          subtitle="Real-time insights into whether the cryptocurrency market is currently in Altcoin Season, based on the performance of the top coins relative to Jekacoin over the past 90 days."
        >
          <AltcoinSeasonModal assets={assets} />
        </WidgetModal>
      )}

      {activeModal === 5 && (
        <WidgetModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Relative Strength Index (RSI)"
          subtitle="The current crypto market RSI heatmap and data. Includes the largest cryptos and their current overbought vs oversold status."
        >
          <CryptoRSIModal assets={assets} />
        </WidgetModal>
      )}
    </div>
  );
}
