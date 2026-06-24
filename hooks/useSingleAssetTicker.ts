"use client";

import { useEffect, useState } from "react";
import { ApexMarketAsset, DynamicMarketAsset } from "@/types/apex";
import { useKeyboardShortcut } from "./useKeyboardShortcut";
import { useChaosStore } from "@/store/useChaosStore";

export function useSingleAssetTicker(initialAsset: ApexMarketAsset) {
  const [isMounted, setIsMounted] = useState(false);

  // Subscribe to global store
  const chaosState = useChaosStore((s) => s.chaosState);
  const marketData = useChaosStore((s) => s.marketData);
  const triggerChaos = useChaosStore((s) => s.triggerChaos);
  const initEngine = useChaosStore((s) => s.initEngine);

  // Initialize engine with this single asset if it's not already running
  useEffect(() => {
    setIsMounted(true);
    initEngine([initialAsset]);
  }, [initialAsset, initEngine]);

  // Keyboard Shortcut: Ctrl+Shift+C → global store trigger
  useKeyboardShortcut(
    { key: "c", ctrlKey: true, shiftKey: true },
    triggerChaos
  );

  // Find the specific asset in the global market data
  const liveAsset = marketData?.find((a) => a.ticker === initialAsset.ticker) as DynamicMarketAsset | undefined;

  // Fallback to initialAsset shape while initializing to prevent layout shift
  const asset = liveAsset || {
    ...initialAsset,
    current_price: parseFloat(initialAsset.base_price),
    dynamic_market_cap: parseFloat(initialAsset.base_price) * parseFloat(initialAsset.circulating_supply),
    price_direction: "neutral" as const,
    sparkline_data: [],
  };

  return { liveAsset: asset, isMounted, chaosState, triggerChaos };
}
