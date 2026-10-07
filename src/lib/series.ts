/** Deterministic pseudo-random price series for mock charts. */

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Range = "1D" | "1W" | "1M" | "1Y" | "5Y";
export const ranges: Range[] = ["1D", "1W", "1M", "1Y", "5Y"];

const rangePoints: Record<Range, number> = { "1D": 48, "1W": 35, "1M": 30, "1Y": 52, "5Y": 60 };

/**
 * Builds a series that ends exactly at `end` and starts at `end / (1 + changePct/100)`,
 * with deterministic noise so every render of the same instrument/range looks identical.
 */
export function buildSeries(key: string, end: number, changePct: number, range: Range = "1D", volatility = 1): number[] {
  const n = rangePoints[range];
  const rand = mulberry32(hash(`${key}:${range}`));
  const start = end / (1 + changePct / 100);
  const noiseScale = Math.abs(end - start) * 0.35 + end * 0.004 * volatility;
  const pts: number[] = [];
  let drift = 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    drift = drift * 0.7 + (rand() - 0.5) * noiseScale;
    const edge = Math.sin(Math.PI * t); // pin both ends
    pts.push(start + (end - start) * t + drift * edge);
  }
  pts[0] = start;
  pts[n - 1] = end;
  return pts;
}

/** Approximate % change for a given range, derived from the instrument's returns. */
export function rangeChange(range: Range, daily: number, r: { y1: number; y5: number }): number {
  switch (range) {
    case "1D":
      return daily;
    case "1W":
      return daily * 1.8 + r.y1 / 52;
    case "1M":
      return r.y1 / 12 + daily;
    case "1Y":
      return r.y1;
    case "5Y":
      return r.y5;
  }
}
