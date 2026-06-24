import { create } from "zustand";
import { ApexMarketAsset, ChaosEvent, ChaosEventState, DynamicMarketAsset } from "@/types/apex";

// ── Predefined Chaos Events Pool ──
const CHAOS_EVENTS: ChaosEvent[] = [
  {
    id: "containment-breach-s4",
    title:
      "⚠ BREAKING: Containment Breach at Server 4 — All Apex Nodes Compromised",
    duration: 60000,
    multiplier: 12,
    affectedAssets: ["ALL"],
  },
  {
    id: "jeka-protocol-leak",
    title:
      "🔴 CRITICAL: Jeka Protocol Source Code Leaked on the Dark Abyss — Market in Freefall",
    duration: 60000,
    multiplier: 10,
    affectedAssets: ["ALL"],
  },
  {
    id: "entity67-resonance",
    title:
      "💀 ANOMALY: Entity 67 Resonance Cascade Detected — Reality Index Destabilizing",
    duration: 60000,
    multiplier: 15,
    affectedAssets: ["ALL"],
  },
];

// ── Linear Interpolation (smooth recovery, anti-chart-break) ──
function lerp(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}

// ── Price floor: prices can NEVER go negative ──
const PRICE_FLOOR = 0.000001;

// ── Timer handles & Engine State (module-level — SOP Rule 1 & 2 safe) ──
let chaosTimeout: ReturnType<typeof setTimeout> | null = null;
let recoveryTimeout: ReturnType<typeof setTimeout> | null = null;
let engineInterval: ReturnType<typeof setInterval> | null = null;

const preLerpPrices = new Map<string, number>();

interface ChaosStoreState {
  chaosState: ChaosEventState | null;
  marketData: DynamicMarketAsset[] | null;
  triggerChaos: () => void;
  initEngine: (assets: ApexMarketAsset[]) => void;
  cleanup: () => void;
}

export const useChaosStore = create<ChaosStoreState>((set, get) => ({
  chaosState: null,
  marketData: null,

  initEngine: (initialAssets: ApexMarketAsset[]) => {
    // 1. Merge incoming assets with existing marketData
    const currentData = get().marketData || [];
    const currentTickers = new Set(currentData.map((a) => a.ticker));
    
    const newAssets = initialAssets.filter((a) => !currentTickers.has(a.ticker)).map((asset) => {
      const basePriceNum = parseFloat(asset.base_price);
      const supplyNum = parseFloat(asset.circulating_supply);
      const base7d = parseFloat(asset.base_7d_change);
      const endPrice = basePriceNum;
      const startPrice = endPrice / (1 + base7d / 100);

      // Initial sparkline generation
      const sparkline: number[] = [];
      let runningVal = startPrice;

      for (let i = 0; i < 20; i++) {
        const remaining = 19 - i;
        const pull = remaining > 0 ? (endPrice - runningVal) / (remaining + 1) : 0;
        const noisePct = 0.03 + Math.random() * 0.05;
        const noise = (Math.random() - 0.5) * 2 * runningVal * noisePct;
        const spike = Math.random() < 0.3 ? (Math.random() - 0.5) * 2 * runningVal * 0.1 : 0;

        runningVal = Math.max(runningVal * 0.01, runningVal + pull + noise + spike);
        sparkline.push(runningVal);
      }
      sparkline[19] = endPrice;

      return {
        ...asset,
        current_price: basePriceNum,
        dynamic_market_cap: basePriceNum * supplyNum,
        price_direction: "neutral" as const,
        sparkline_data: sparkline,
      };
    });

    if (newAssets.length > 0) {
      set({ marketData: [...currentData, ...newAssets] });
    }

    // 2. Start Singleton Engine if not running
    if (engineInterval === null) {
      engineInterval = setInterval(() => {
        const { chaosState, marketData } = get();
        if (!marketData) return;

        const updatedData = marketData.map((asset) => {
          const baseVolatility = parseFloat(asset.volatility_index);
          const basePriceNum = parseFloat(asset.base_price);
          const supply = parseFloat(asset.circulating_supply);

          // ── CHAOS EVENT INTERCEPTION ──
          if (chaosState?.phase === "recovering") {
            const targetPrice = preLerpPrices.get(asset.ticker) ?? basePriceNum;
            const lerpedPrice = Math.max(PRICE_FLOOR, lerp(asset.current_price, targetPrice, 0.15));
            return {
              ...asset,
              current_price: lerpedPrice,
              dynamic_market_cap: lerpedPrice * supply,
              price_direction: lerpedPrice > asset.current_price ? ("up" as const) : ("down" as const),
            };
          }

          let effectiveVolatility = baseVolatility;
          let directionalBias = 0;

          if (chaosState?.phase === "active") {
            effectiveVolatility = baseVolatility * chaosState.event.multiplier;
            directionalBias = (Math.random() - 0.5) * 2 * 0.55;
          }

          const changePercent = (Math.random() * 2 - 1) * effectiveVolatility + directionalBias;
          const newPrice = Math.max(PRICE_FLOOR, asset.current_price * (1 + changePercent));

          return {
            ...asset,
            current_price: newPrice,
            dynamic_market_cap: newPrice * supply,
            price_direction: newPrice > asset.current_price ? ("up" as const) : ("down" as const),
          };
        });

        set({ marketData: updatedData });
      }, 3000);
    }
  },

  triggerChaos: () => {
    // Prevent stacking — ignore if already active or recovering
    if (get().chaosState !== null) return;

    // Pick a random event
    const event = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];

    // Snapshot prices for recovery
    const currentData = get().marketData || [];
    currentData.forEach((a) => preLerpPrices.set(a.ticker, a.current_price));

    set({
      chaosState: {
        event,
        startTime: Date.now(),
        phase: "active",
      },
    });

    // After event.duration (60s), transition to recovery phase
    chaosTimeout = setTimeout(() => {
      set((state) => ({
        chaosState: state.chaosState
          ? { ...state.chaosState, phase: "recovering" as const }
          : null,
      }));

      // After 5s lerp recovery, clear chaos completely
      recoveryTimeout = setTimeout(() => {
        preLerpPrices.clear();
        set({ chaosState: null });
      }, 5000);
    }, event.duration);
  },

  cleanup: () => {
    if (chaosTimeout) {
      clearTimeout(chaosTimeout);
      chaosTimeout = null;
    }
    if (recoveryTimeout) {
      clearTimeout(recoveryTimeout);
      recoveryTimeout = null;
    }
    if (engineInterval) {
      clearInterval(engineInterval);
      engineInterval = null;
    }
    set({ chaosState: null });
  },
}));
