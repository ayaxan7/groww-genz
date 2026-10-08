import { lessonArt, type ArtName } from "@/data/art";
import { instruments } from "@/data/instruments";
import { lessons, type Lesson, type LessonLevel } from "@/data/lessons";
import { formatINR } from "./format";
import type { Instrument, InstrumentType, Profile } from "./types";

/**
 * Deterministic personalisation rules. Every recommendation in the app is derived
 * from the onboarding profile through these functions, never from an AI model.
 */

const longHorizon = (p: Profile) => p.horizon === "3-5" || p.horizon === "5plus";
const isBeginner = (p: Profile) => p.experience === "new" || p.experience === "explored";
const wantsPlainEnglish = (p: Profile) => p.knowledge === "explain" || p.knowledge === "basics";

interface Scored<T> {
  item: T;
  score: number;
  reasons: string[];
}

function scoreLesson(lesson: Lesson, p: Profile): Scored<Lesson> {
  let score = 0;
  const reasons: string[] = [];
  const add = (n: number, why?: string) => {
    score += n;
    if (why) reasons.push(why);
  };

  switch (lesson.id) {
    case "sip":
      if (isBeginner(p)) add(3, "you're just getting started");
      if (wantsPlainEnglish(p)) add(2);
      if (longHorizon(p)) add(2, "you have a multi-year goal");
      if (["wealth", "retirement", "gadget", "education"].includes(p.goal)) add(1);
      break;
    case "diversification":
      if (p.experience === "comfortable" || p.experience === "experienced") add(3, "you already have some experience");
      if (p.risk !== "low") add(1, `you're comfortable with ${p.risk} risk`);
      if (p.knowledge === "most" || p.knowledge === "advanced") add(1);
      break;
    case "cagr":
      if (p.knowledge === "most" || p.knowledge === "advanced") add(2, "you know the basic terms");
      if (p.experience === "comfortable") add(1);
      break;
    case "risk-return":
      if (p.horizon === "lt1") add(3, "you'll need this money soon");
      if (p.goal === "emergency") add(2, "an emergency fund needs stability");
      if (p.risk === "high") add(1, "you chose high risk comfort");
      if (p.risk === "low") add(1);
      break;
    case "etf":
      if (p.knowledge === "basics" || p.knowledge === "most") add(2, "you know the basics");
      if (p.experience === "explored" || p.experience === "comfortable") add(1);
      if (p.risk === "moderate") add(1);
      break;
    case "sip-vs-lumpsum":
      if (p.amount >= 2500) add(2, "you invest larger amounts");
      if (p.experience === "explored") add(1, "you've already explored a little");
      break;
    case "index-vs-active":
      if (p.knowledge === "basics" || p.knowledge === "most") add(2, "you know the basics of funds");
      if (longHorizon(p)) add(1);
      break;
    case "pe-valuation":
      if (p.experience === "experienced" || p.experience === "comfortable") add(2, "you research companies");
      if (p.knowledge === "advanced") add(1);
      break;
    case "rebalancing":
      if (longHorizon(p)) add(2, "you're investing for the long run");
      if (p.risk !== "low") add(1);
      break;
    case "capital-gains-tax":
      if (p.lifeStage === "early-career" || p.lifeStage === "family") add(2, "tax starts to matter at your stage");
      if (p.experience === "experienced") add(1);
      break;
    case "drawdowns":
      if (p.risk === "high") add(3, "you're comfortable with big swings");
      if (p.experience === "experienced") add(1);
      break;
    case "goal":
      if (p.goal === "other") add(3, "you're still choosing a goal");
      else if (["travel", "education", "gadget", "emergency"].includes(p.goal)) add(2, "you're saving for a specific goal");
      if (p.lifeStage === "student" || p.lifeStage === "first-job") add(1);
      break;
    case "mutual-funds":
      if (isBeginner(p)) add(4, "you're just getting started");
      if (wantsPlainEnglish(p)) add(3);
      if (longHorizon(p)) add(2, "you have a multi-year goal");
      if (["wealth", "retirement", "education"].includes(p.goal)) add(1);
      break;
    case "stocks":
      if (p.knowledge === "most" || p.knowledge === "advanced") add(2, "you understand the basics");
      if (p.experience === "comfortable" || p.experience === "experienced") add(2, "you have some experience");
      if (p.risk === "high") add(1, "you're comfortable with higher risk");
      break;
    case "time-horizon":
      if (p.horizon === "lt1" || p.horizon === "1-3") add(4, "you'll need this money soon");
      if (p.goal === "emergency" || p.goal === "gadget" || p.goal === "travel") add(2, "your goal has a defined timeline");
      if (isBeginner(p)) add(1, "foundational concept for new investors");
      break;
  }
  return { item: lesson, score, reasons };
}

const experienceScore: Record<Profile["experience"], number> = { new: 0, explored: 1, comfortable: 2, experienced: 3 };
const knowledgeScore: Record<Profile["knowledge"], number> = { explain: 0, basics: 1, most: 2, advanced: 3 };

/** Starting learning level from onboarding: experience + knowledge (0–6) → Basics / Intermediate / Advanced. */
export function profileLevel(p: Profile): LessonLevel {
  const score = experienceScore[p.experience] + knowledgeScore[p.knowledge];
  return score <= 1 ? 1 : score <= 3 ? 2 : 3;
}

/** Learning level today: starts from the profile, moves up once every lesson at a level is watched. */
export function learnerLevel(p: Profile | null, completed: string[]): LessonLevel {
  let level: LessonLevel = p ? profileLevel(p) : 1;
  while (level < 3 && lessons.filter((l) => l.level === level).every((l) => completed.includes(l.id))) level = (level + 1) as LessonLevel;
  return level;
}

export type FeedTag = "level" | "next" | "refresher";

export interface FeedItem {
  lesson: Lesson;
  reason: string;
  tag: FeedTag;
}

function rankWithin(group: Lesson[], p: Profile | null): { lesson: Lesson; reason: string }[] {
  if (!p) return group.map((lesson) => ({ lesson, reason: "Popular with new investors" }));
  return group
    .map((l) => scoreLesson(l, p))
    .sort((a, b) => b.score - a.score)
    .map(({ item, reasons }) => ({ lesson: item, reason: reasons.length ? `Because ${reasons[0]}` : "Builds on what you know" }));
}

/**
 * The Learn feed adapts to experience instead of showing everyone the same lessons:
 * lessons at your level first (personally ranked), then the next level as a stretch,
 * then one level below as optional refreshers. Advanced learners don't see the very
 * basics in their feed; beginners don't get advanced topics until they level up.
 */
export function learnFeed(p: Profile | null, completed: string[]): { level: LessonLevel; items: FeedItem[] } {
  const level = learnerLevel(p, completed);
  const at = (l: number) => lessons.filter((x) => x.level === l);
  const items: FeedItem[] = [
    ...rankWithin(at(level), p).map((r) => ({ ...r, tag: "level" as const })),
    ...rankWithin(at(level + 1), p).map((r) => ({ ...r, reason: "Next level, when you're ready", tag: "next" as const })),
    ...(level >= 2 ? rankWithin(at(level - 1), p).map((r) => ({ ...r, reason: "Quick refresher", tag: "refresher" as const })) : []),
  ];
  return { level, items };
}

/** Next lesson to recommend: first unwatched lesson in the user's feed. */
export function nextLesson(p: Profile | null, completed: string[]): FeedItem {
  const { items } = learnFeed(p, completed);
  return items.find((r) => !completed.includes(r.lesson.id)) ?? items[0];
}

/*
 * Compliance note: recommending specific securities based on someone's profile is investment
 * advice and needs SEBI registration (Investment Adviser / Research Analyst). So the app only
 * personalises *learning* and general explanations of investment types. Lists of specific
 * stocks, funds and ETFs are the same for everyone and never ranked against the user's answers.
 */

/** Same list for every user: sorted by how often each is explored on the app (mock popularity). */
export function popularInstruments(limit = 8, type?: InstrumentType): Instrument[] {
  const pool = type ? instruments.filter((i) => i.type === type) : instruments;
  return [...pool].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
}

export interface InvestmentType {
  type: InstrumentType;
  title: string;
  summary: string;
  /** general, educational context (not a recommendation) */
  note: string;
}

/** Plain-English explainers of the main investment types, in a fixed order for everyone. */
export function investmentTypes(p: Profile | null): InvestmentType[] {
  const shortTimeline = p?.horizon === "lt1";
  return [
    {
      type: "mf",
      title: "Mutual Funds",
      summary: "A professionally managed basket of many companies (or bonds).",
      note: shortTimeline
        ? "For money needed within a year, people often look at steadier debt or liquid funds; equity funds can swing in the short term."
        : "Spreads money across many holdings in one go, and SIPs can start from ₹100.",
    },
    {
      type: "etf",
      title: "ETFs",
      summary: "A basket that tracks an index or gold and trades like a share.",
      note: "Usually low cost. Buying needs a demat account and happens in whole units.",
    },
    {
      type: "stock",
      title: "Stocks",
      summary: "Direct ownership of a single company.",
      note: "One company's news moves your money directly, so prices can swing more than a diversified fund.",
    },
  ];
}

/** General points about an instrument. Identical for every user; educational, not advice. */
export function thingsToConsider(i: Instrument): string {
  if (i.id === "liquid") return "Built for stability and easy withdrawals, so returns are usually modest.";
  if (i.id === "goldbees") return "Gold often behaves differently from stocks, and it doesn't pay dividends.";
  if (i.id === "smallcap") return "Small companies can grow fast but also fall hard; these funds have historically had deep drawdowns.";
  if (i.id === "elss") return "Money is locked in for 3 years, and the tax benefit depends on your tax regime.";
  if (i.type === "etf" && i.category.includes("Sector")) return "It follows one industry, so it can move more than the overall market.";
  if (i.type === "etf") return "It tracks an index at low cost; you buy and sell whole units on the exchange.";
  if (i.type === "mf") return "It spreads money across many companies, and its returns depend on the market and the fund's costs.";
  return "With a single company, its results and news move the price directly. Compare it with peers before deciding.";
}

export interface NextStep {
  eyebrow: string;
  title: string;
  meta: string;
  blurb: string;
  cta: string;
  href: string;
  art: ArtName;
  reason: string;
}

/** The single most useful thing to do next: learn first, then practise, then act. */
export function nextStep(p: Profile, completed: string[], quizDone: boolean, hasInvested: boolean): NextStep {
  const unwatched = learnFeed(p, completed).items.find((r) => !completed.includes(r.lesson.id));
  if (unwatched) {
    const { lesson, reason } = unwatched;
    return {
      eyebrow: `Your next ${lesson.durationSec} seconds`,
      title: lesson.title,
      meta: `${lesson.durationSec} sec`,
      blurb: lesson.description,
      cta: "Watch now",
      href: `/learn?lesson=${lesson.id}`,
      art: lessonArt[lesson.id],
      reason,
    };
  }
  if (!quizDone) {
    return {
      eyebrow: "Practice",
      title: "Take today's quiz",
      meta: "2 min",
      blurb: "Check what you've learned",
      cta: "Start quiz",
      href: "/learn/quiz",
      art: "char-thinking",
      reason: "You've watched every reel",
    };
  }
  return {
    eyebrow: hasInvested ? "Keep going" : "Ready when you are",
    title: hasInvested ? "Add to your goal" : "Make your first investment",
    meta: `From ${formatINR(Math.min(p.amount, 500))}`,
    blurb: "We'll guide you step by step",
    cta: hasInvested ? "Invest" : "Start small",
    href: "/invest",
    art: "char-saving",
    reason: "You've covered the basics",
  };
}

/** One plain-English reason this instrument could matter to this user. Educational, not advice. */
export function whyItMatters(p: Profile, i: Instrument): string {
  let base: string;
  if (i.id === "liquid") base = "It's steady and easy to withdraw, which suits money you might need soon.";
  else if (i.id === "goldbees") base = "Gold often holds up when stocks fall, so some people keep a little as balance.";
  else if (i.id === "smallcap") base = "Small companies can grow fast but also fall hard. These usually suit 7+ year timelines.";
  else if (i.id === "elss") base = "The 3-year lock-in nudges you to stay invested instead of reacting to every dip.";
  else if (i.type === "etf" && i.category.includes("Sector")) base = "It follows one industry, so it can move more than the overall market.";
  else if (i.type === "etf") base = "It's a low-cost way to own a whole index in a single unit.";
  else if (i.type === "mf") base = "It spreads your money across many companies, which can smooth out the ride.";
  else base = "With one company, its news moves your money directly. Many beginners pair a few stocks with a diversified fund.";

  if ((p.horizon === "lt1" || p.horizon === "1-3") && i.risk === "high") return `${base} With a shorter timeline, bigger swings matter more.`;
  if (longHorizon(p) && i.type === "mf") return `${base} That fits a ${p.horizon === "5plus" ? "5+" : "3–5"} year goal like yours.`;
  return base;
}

export interface Discovery {
  id: string;
  kicker: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  art?: ArtName;
}

/** "What's worth knowing today?" cards for Explore: curiosity first, then action. */
export function exploreDiscoveries(p: Profile): Discovery[] {
  const mover = [...instruments].filter((i) => i.type === "stock").sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))[0];
  // a level-appropriate lesson: basics for beginners, deeper topics for experienced users
  const lesson = nextLesson(p, []).lesson;
  return [
    {
      id: "mover",
      kicker: `${mover.changePct >= 0 ? "▲" : "▼"} ${Math.abs(mover.changePct).toFixed(1)}% today`,
      title: `Why is ${mover.name.split(" ")[0]} moving today?`,
      body: "The story behind the number",
      cta: "See why",
      href: `/explore/${mover.id}`,
      art: "char-insight",
    },
    {
      id: "lesson",
      kicker: "30 sec",
      title: lesson.id === "sip" ? "Learn about SIPs" : "Learn about ETFs",
      body: lesson.hook,
      cta: "Watch",
      href: `/learn?lesson=${lesson.id}`,
    },
    {
      id: "companies",
      kicker: "Stocks",
      title: "3 companies worth understanding",
      body: "Simple breakdowns for beginners",
      cta: "Explore",
      href: "/explore?tab=stocks",
    },
  ];
}
