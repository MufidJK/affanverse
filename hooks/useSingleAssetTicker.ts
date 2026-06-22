"use client";

import { useState, useEffect } from "react";
import { ApexMarketAsset, DynamicMarketAsset } from "@/types/apex";

export function useSingleAssetTicker(initialAsset: ApexMarketAsset) {
  const [isMounted, setIsMounted] = useState(false);
  const [asset, setAsset] = useState<DynamicMarketAsset>(() => {
    const basePriceNum = parseFloat(initialAsset.base_price);
    const supplyNum = parseFloat(initialAsset.circulating_supply);
    return {
      ...initialAsset,
      current_price: basePriceNum,
      dynamic_market_cap: basePriceNum * supplyNum,
      price_direction: "neutral" as const,
      sparkline_data: [],
    };
  });

  useEffect(() => {
    setIsMounted(true);

    const interval = setInterval(() => {
      setAsset((prev) => {
        const volatility = parseFloat(prev.volatility_index);
        const changePercent = (Math.random() * 2 - 1) * volatility;
        const newPrice = prev.current_price * (1 + changePercent);
        const supply = parseFloat(prev.circulating_supply);
        return {
          ...prev,
          current_price: newPrice,
          dynamic_market_cap: newPrice * supply,
          price_direction: newPrice > prev.current_price 
            ? "up" as const 
            : "down" as const,
        };
      });
    }, 3000);

    // AGENTS.md Rule 2 — strict cleanup
    return () => clearInterval(interval);
  }, []);

  return { liveAsset: asset, isMounted };
}
