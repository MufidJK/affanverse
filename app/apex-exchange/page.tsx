import React from "react";
import { supabase } from "@/lib/supabase";
import { MarketTable } from "@/components/MarketTable";
import { MarketWidgets } from "@/components/MarketWidgets";
import { ApexMarketAsset } from "@/types/apex";

export const revalidate = 0; // Ensures it skips Next.js aggressive cache

export default async function ApexExchangePage() {
  const { data, error } = await supabase
    .from("apex_market_assets")
    .select("*")
    .order("rank", { ascending: true });

  const assets = data as ApexMarketAsset[] | null;

  if (error || !assets || assets.length === 0) {
    console.error("Error fetching market assets or data is missing. Check Supabase RLS policies.", error);
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Market Data Unavailable</h1>
          <p className="text-zinc-500 dark:text-white/50">Please check your database connection or RLS policies.</p>
        </div>
      </main>
    );
  }

  const initialAssets = assets;

  // Global Market Cap Calculation
  const totalMarketCap = assets.reduce((sum, asset) => {
    return sum + (parseFloat(asset.base_price) * parseFloat(asset.circulating_supply));
  }, 0);

  // Apex20 Index Calculation
  const assetsWithMc = assets.map(asset => ({
    ...asset,
    mc: parseFloat(asset.base_price) * parseFloat(asset.circulating_supply),
    change24h: parseFloat(asset.base_24h_change)
  })).sort((a, b) => b.mc - a.mc);

  const top20 = assetsWithMc.slice(0, 20);
  const top20Mc = top20.reduce((sum, a) => sum + a.mc, 0);
  
  // Create a simulated index value by scaling the market cap down
  const apex20Value = top20Mc / 1e8; // Just a scalar to make a readable number like 14000
  
  // Calculate weighted 24h performance percentage
  const apex20Change = top20.reduce((sum, a) => sum + (a.change24h * (a.mc / top20Mc)), 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white selection:bg-[#2398f7]/30 font-sans overflow-x-hidden relative">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50 dark:opacity-100">
        {/* Glow effects mapped correctly as static backgrounds, NO BACKDROP BLUR for performance */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/30 dark:from-[#2398f7]/15 to-transparent rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-300/20 dark:from-[#ef4444]/10 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[95%] 2xl:max-w-[1800px] mx-auto space-y-8 px-6 py-24">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-white/50">
              Apex Exchange
            </span>
          </h1>
          <p className="text-zinc-600 dark:text-white/60 max-w-2xl text-lg">
            Live market capitalization and dynamic volatility engine for the 
            Affanverse ecosystem. ⚠️ Disclaimer: This is a fictional simulation. 
            All assets, prices, and market data are entirely made up and do not 
            represent any real financial instruments or market conditions.
          </p>
        </div>

        {/* Dashboard Widgets */}
        <MarketWidgets 
          totalMarketCap={totalMarketCap}
          apex20Value={apex20Value}
          apex20Change={apex20Change}
          assets={initialAssets}
        />

        {/* Market Table Wrapper */}
        <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-xl dark:shadow-2xl">
          <MarketTable initialAssets={initialAssets} />
        </div>
      </div>
    </main>
  );
}
