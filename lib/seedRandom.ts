/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 *
 * Produces deterministic results from a string seed,
 * ensuring zero React hydration mismatches when generating
 * fake historical time-series data.
 */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/** Returns a deterministic () => number (0–1) seeded by a string. */
export function seedRandom(seed: string): () => number {
  let state = hashString(seed);
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generates a deterministic time-series array. */
export function generateTimeSeries(
  seed: string,
  days: number,
  baseValue: number,
  volatility: number = 0.02
): { date: string; value: number }[] {
  const rng = seedRandom(seed);
  const data: { date: string; value: number }[] = [];
  let current = baseValue;
  const now = new Date("2026-06-20T00:00:00Z");

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const change = (rng() - 0.48) * volatility; // slight upward bias
    current = current * (1 + change);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: current,
    });
  }
  return data;
}

/** Generates a deterministic number within a range. */
export function seededRange(seed: string, min: number, max: number): number {
  const rng = seedRandom(seed);
  return min + rng() * (max - min);
}

/** Generates N deterministic numbers within a range. */
export function seededRangeArray(
  seed: string,
  count: number,
  min: number,
  max: number
): number[] {
  const rng = seedRandom(seed);
  return Array.from({ length: count }, () => min + rng() * (max - min));
}
