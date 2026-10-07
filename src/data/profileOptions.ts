import type { Experience, GoalType, Horizon, Knowledge, LifeStage, Profile, Risk } from "@/lib/types";

export interface Option<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
  emoji?: string;
}

export const experienceOptions: Option<Experience>[] = [
  { value: "new", label: "Completely new", hint: "I have never invested before", emoji: "🌱" },
  { value: "explored", label: "Explored a little", hint: "I know some basics but still have questions", emoji: "🔍" },
  { value: "comfortable", label: "Fairly comfortable", hint: "I have some experience investing", emoji: "📈" },
  { value: "experienced", label: "Experienced", hint: "I actively manage my investments", emoji: "⭐" },
];

export const knowledgeOptions: Option<Knowledge>[] = [
  { value: "explain", label: "Explain everything", hint: "Plain English, no jargon please", emoji: "💬" },
  { value: "basics", label: "I know the basics", hint: "Stocks, mutual funds, that sort of thing", emoji: "📘" },
  { value: "most", label: "I understand most investment terms", hint: "CAGR, NAV, expense ratio…", emoji: "🧠" },
  { value: "advanced", label: "Advanced", hint: "Skip the basics, show me the details", emoji: "🚀" },
];

export const lifeStageOptions: Option<LifeStage>[] = [
  { value: "student", label: "Student", hint: "Learning and earning a little", emoji: "🎓" },
  { value: "first-job", label: "First job", hint: "Just started earning", emoji: "💼" },
  { value: "early-career", label: "Early career", hint: "A few years into work", emoji: "🧑‍💻" },
  { value: "family", label: "Growing family", hint: "Planning for more than just me", emoji: "🏡" },
  { value: "other", label: "Other", hint: "Something else", emoji: "✨" },
];

export const goalOptions: Option<GoalType>[] = [
  { value: "wealth", label: "Long-term wealth", emoji: "🌳" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "education", label: "Education", emoji: "🎓" },
  { value: "emergency", label: "Emergency fund", emoji: "🛟" },
  { value: "gadget", label: "Laptop / Gadget", emoji: "💻" },
  { value: "retirement", label: "Retirement", emoji: "🏖️" },
  { value: "other", label: "Not sure yet", hint: "That's okay, we'll help you figure it out", emoji: "🤔" },
];

export const amountOptions = [100, 500, 1000, 2500] as const;

export const horizonOptions: Option<Horizon>[] = [
  { value: "lt1", label: "Less than 1 year", hint: "I'll need the money soon", emoji: "⏱️" },
  { value: "1-3", label: "1–3 years", hint: "A short-to-medium goal", emoji: "📅" },
  { value: "3-5", label: "3–5 years", hint: "A medium-term goal", emoji: "🗓️" },
  { value: "5plus", label: "5+ years", hint: "I can stay invested for long", emoji: "🌳" },
];

export const riskOptions: Option<Risk>[] = [
  { value: "low", label: "Low", hint: "I prefer steady, smaller ups and downs", emoji: "🛡️" },
  { value: "moderate", label: "Moderate", hint: "Some ups and downs are okay for better growth", emoji: "⚖️" },
  { value: "high", label: "High", hint: "I'm okay with big swings for higher potential", emoji: "🔥" },
];

/** Default target per goal type, used when a goal is created from onboarding. */
export const goalTargets: Record<GoalType, number> = {
  wealth: 100000,
  travel: 25000,
  education: 50000,
  emergency: 30000,
  gadget: 10000,
  retirement: 500000,
  other: 20000,
};

export function labelOf<T extends string>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function emojiOf<T extends string>(options: Option<T>[], value: T): string {
  return options.find((o) => o.value === value)?.emoji ?? "🎯";
}

export const demoProfile: Profile = {
  name: "Ayaan",
  experience: "new",
  knowledge: "explain",
  lifeStage: "early-career",
  goal: "gadget",
  amount: 500,
  horizon: "3-5",
  risk: "moderate",
};
