"use client";

import { useEffect, useState } from "react";
import { ApexMarketAsset, DynamicMarketAsset } from "@/types/apex";
import { useKeyboardShortcut } from "./useKeyboardShortcut";
import { useChaosStore } from "@/store/useChaosStore";

export function useMarketTicker(initialAssets: ApexMarketAsset[]) {
  const [isMounted, setIsMounted] = useState(false);

  // Subscribe to global store
  const chaosState = useChaosStore((s) => s.chaosState);
  const marketData = useChaosStore((s) => s.marketData);
  const triggerChaos = useChaosStore((s) => s.triggerChaos);
  const initEngine = useChaosStore((s) => s.initEngine);

  // Initialize engine (Singleton setup)
  useEffect(() => {
    setIsMounted(true);
    initEngine(initialAssets);
  }, [initialAssets, initEngine]);

  // Keyboard Shortcut: Ctrl+Shift+C → global store trigger
  useKeyboardShortcut(
    { key: "c", ctrlKey: true, shiftKey: true },
    triggerChaos
  );

  // Fallback to initialAssets while marketData initializes (prevents layout shift)
  const liveAssets = marketData && marketData.length > 0 ? marketData : [];

  return { liveAssets, isMounted, chaosState, triggerChaos };
}
