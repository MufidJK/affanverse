import { useState, useEffect } from "react";
import { ApexMarketAsset, DynamicMarketAsset } from "@/types/apex";

export function useMarketTicker(initialAssets: ApexMarketAsset[]) {
  const [isMounted, setIsMounted] = useState(false);

  const [assets, setAssets] = useState<DynamicMarketAsset[]>(() => {
    return initialAssets.map((asset) => {
      const basePriceNum = parseFloat(asset.base_price);
      const supplyNum = parseFloat(asset.circulating_supply);
      
      return {
        ...asset,
        current_price: basePriceNum,
        dynamic_market_cap: basePriceNum * supplyNum,
        price_direction: "neutral",
        sparkline_data: [],
      };
    });
  });

  useEffect(() => {
    setIsMounted(true);

    // Initial client-side sparkline generation
    setAssets((prevAssets) => 
      prevAssets.map((asset) => {
        const base7d = parseFloat(asset.base_7d_change);
        const endPrice = asset.current_price;
        const startPrice = endPrice / (1 + base7d / 100);
        
        const sparkline: number[] = [];
        let runningVal = startPrice;
        
        for (let i = 0; i < 20; i++) {
          // Strong directional pull toward end price
          const remaining = 19 - i;
          const pull = remaining > 0 
            ? (endPrice - runningVal) / (remaining + 1) 
            : 0;
          
          // Aggressive noise: 3-8% of current value per step
          const noisePct = 0.03 + Math.random() * 0.05;
          const noise = (Math.random() - 0.5) * 2 * runningVal * noisePct;
          
          // Frequent sharp spikes: 30% chance, up to 10% move
          const spike = Math.random() < 0.3
            ? (Math.random() - 0.5) * 2 * runningVal * 0.10
            : 0;
          
          runningVal = Math.max(runningVal * 0.01, runningVal + pull + noise + spike);
          sparkline.push(runningVal);
        }
        
        // Force last point to be exactly current price
        sparkline[19] = endPrice;
        
        return {
          ...asset,
          sparkline_data: sparkline,
        };
      })
    );

    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const volatility = parseFloat(asset.volatility_index);
          // PRNG mutation based on volatility
          const changePercent = (Math.random() * 2 - 1) * volatility; 
          const newPrice = asset.current_price * (1 + changePercent);
          const supply = parseFloat(asset.circulating_supply);
          
          return {
            ...asset,
            current_price: newPrice,
            dynamic_market_cap: newPrice * supply,
            price_direction: newPrice > asset.current_price ? "up" : "down",
          };
        })
      );
    }, 3000);

    // STRICT REACT CLEANUP
    return () => clearInterval(interval);
  }, []);

  return { liveAssets: assets, isMounted };
}
