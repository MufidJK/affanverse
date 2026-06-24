export interface ApexMarketAsset {
  id: string;
  rank: number;
  name: string;
  ticker: string;
  image_url: string;
  base_price: string;
  circulating_supply: string;
  base_volume_24h: string;
  base_1h_change: string;
  base_24h_change: string;
  base_7d_change: string;
  volatility_index: string;
  created_at?: string;
  description?: string | null;
  max_supply?: string | null;
  all_time_high?: string | null;
  all_time_high_date?: string | null;
  all_time_low?: string | null;
  all_time_low_date?: string | null;
  category?: string | null;
  founded_year?: number | null;
}

export interface DynamicMarketAsset extends ApexMarketAsset {
  current_price: number;
  dynamic_market_cap: number;
  price_direction: "up" | "down" | "neutral";
  sparkline_data: number[];
}

// ── Chaos Event Engine Types ──
export interface ChaosEvent {
  id: string;
  title: string;
  duration: number;
  multiplier: number;
  affectedAssets: string[];
}

export interface ChaosEventState {
  event: ChaosEvent;
  startTime: number;
  phase: "active" | "recovering";
}
