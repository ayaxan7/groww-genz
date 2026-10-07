import type { Frequency, Horizon, Risk } from "./types";

/** Assumed annual rates used ONLY for illustrative projections. */
export const assumedRate: Record<Risk, number> = { low: 0.06, moderate: 0.1, high: 0.12 };
export const horizonYears: Record<Horizon, number> = { lt1: 1, "1-3": 3, "3-5": 5, "5plus": 10 };

export function project(amount: number, frequency: Frequency, horizon: Horizon, risk: Risk) {
  const years = horizonYears[horizon];
  const r = assumedRate[risk];
  if (frequency === "one-time") {
    return { years, rate: r, invested: amount, value: amount * Math.pow(1 + r, years) };
  }
  const i = r / 12;
  const n = years * 12;
  const value = amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return { years, rate: r, invested: amount * n, value };
}
