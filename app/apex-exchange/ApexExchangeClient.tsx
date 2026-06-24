"use client";

import React from "react";
import { ApexMarketAsset } from "@/types/apex";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import { MarketWidgets } from "@/components/MarketWidgets";
import { MarketTable } from "@/components/MarketTable";

interface ApexExchangeClientProps {
  initialAssets: ApexMarketAsset[];
  totalMarketCap: number;
  apex20Value: number;
  apex20Change: number;
}

export default function ApexExchangeClient({
  initialAssets,
  totalMarketCap,
  apex20Value,
  apex20Change,
}: ApexExchangeClientProps) {
  const { liveAssets, isMounted, chaosState } = useMarketTicker(initialAssets);

  return (
    <>
      {/* Dashboard Widgets */}
      <MarketWidgets
        totalMarketCap={totalMarketCap}
        apex20Value={apex20Value}
        apex20Change={apex20Change}
        assets={initialAssets}
        chaosState={chaosState}
      />

      {/* Market Table Wrapper */}
      <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl">
        <MarketTable
          liveAssets={liveAssets}
          isMounted={isMounted}
          chaosState={chaosState}
        />
      </div>
    </>
  );
}
