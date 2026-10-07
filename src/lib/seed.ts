import { goalTargets } from "@/data/profileOptions";
import { monthKey, shiftDays, shiftMonths, todayKey, uid } from "./format";
import type { AppState, Goal, Holding, Profile } from "./types";

export const STATE_VERSION = 1;

/** Sample holdings for the demo profile: ₹11,000 invested, ₹12,480 current. */
export const sampleHoldings: Holding[] = [
  { instrumentId: "hdfcbank", invested: 4650, current: 5300, units: 3.27 },
  { instrumentId: "reliance", invested: 4250, current: 4780, units: 1.67 },
  { instrumentId: "nifty50-index", invested: 2100, current: 2400, units: 99.26 },
];

/**
 * Fresh demo state. `withDates: false` gives a date-free placeholder used for the
 * server prerender; the real seed (with yesterday's streak date) is created in the browser.
 */
export function createSeedState(withDates = true): AppState {
  return {
    version: STATE_VERSION,
    auth: { isAuthed: false, method: null, phone: null },
    pendingPhone: null,
    profile: null,
    learning: {
      completed: [],
      liked: [],
      bookmarked: [],
      streak: 5,
      lastActiveDate: withDates ? todayKey(shiftDays(-1)) : null,
      points: 120,
    },
    quiz: { answers: {} },
    watchlist: ["reliance", "nifty50-index"],
    compare: [],
    holdings: sampleHoldings.map((h) => ({ ...h })),
    transactions: [],
    sips: [],
    goals: [],
    investingStreak: 2,
    lastInvestMonth: withDates ? monthKey(shiftMonths(-1)) : null,
    draft: null,
    lastInvestment: null,
  };
}

export function goalFromProfile(profile: Profile, saved = 1500): Goal {
  return {
    id: uid("goal"),
    type: profile.goal,
    name: goalName(profile.goal),
    target: goalTargets[profile.goal],
    saved,
    monthly: profile.amount,
    horizon: profile.horizon,
    createdAt: new Date().toISOString(),
  };
}

export function goalName(type: Profile["goal"]): string {
  const names: Record<Profile["goal"], string> = {
    wealth: "Long-term wealth",
    travel: "Dream trip",
    education: "Education fund",
    emergency: "Emergency fund",
    gadget: "Laptop / Gadget",
    retirement: "Retirement",
    other: "My first goal",
  };
  return names[type];
}
