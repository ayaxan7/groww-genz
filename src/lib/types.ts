export type Experience = "new" | "explored" | "comfortable" | "experienced";
export type Knowledge = "explain" | "basics" | "most" | "advanced";
export type LifeStage = "student" | "first-job" | "early-career" | "family" | "other";
export type GoalType = "wealth" | "travel" | "education" | "emergency" | "gadget" | "retirement" | "other";
export type Horizon = "lt1" | "1-3" | "3-5" | "5plus";
export type Risk = "low" | "moderate" | "high";
export type Valuation = "cheap" | "usual" | "pricey";
export type AuthMethod = "phone" | "google" | "chatgpt";
export type Frequency = "one-time" | "monthly";

export interface Profile {
  name: string;
  experience: Experience;
  knowledge: Knowledge;
  lifeStage: LifeStage;
  goal: GoalType;
  amount: number;
  horizon: Horizon;
  risk: Risk;
}

export interface AuthState {
  isAuthed: boolean;
  method: AuthMethod | null;
  phone: string | null;
}

export type InstrumentType = "stock" | "mf" | "etf";

export interface NewsItem {
  title: string;
  source: string;
  ago: string;
}

export interface Instrument {
  id: string;
  type: InstrumentType;
  name: string;
  ticker: string;
  /** Short category label, e.g. "Large Cap · Energy" or "Index Fund" */
  category: string;
  price: number;
  changePct: number;
  risk: Risk;
  valuation: Valuation;
  descriptor: string;
  about: string;
  happening: string;
  insights: string[];
  returns: { y1: number; y3: number; y5: number };
  /** Minimum amount for this instrument in the demo flow */
  minAmount: number;
  sipEligible: boolean;
  financials: { label: string; value: string }[];
  news: NewsItem[];
  logoColor: string;
  popularity: number;
}

export interface Holding {
  instrumentId: string;
  invested: number;
  current: number;
  units: number;
}

export interface Transaction {
  id: string;
  instrumentId: string;
  amount: number;
  frequency: Frequency;
  goalId: string | null;
  createdAt: string;
}

export interface Sip {
  id: string;
  instrumentId: string;
  amount: number;
  goalId: string | null;
  startedAt: string;
}

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  target: number;
  saved: number;
  monthly: number;
  horizon: Horizon;
  createdAt: string;
}

export interface LearningState {
  completed: string[];
  liked: string[];
  bookmarked: string[];
  streak: number;
  lastActiveDate: string | null;
  points: number;
}

export interface QuizState {
  answers: Record<string, { choice: number; correct: boolean }>;
}

export interface InvestDraft {
  instrumentId: string | null;
  goalId: string | null;
  goalType: GoalType;
  amount: number;
  frequency: Frequency;
  horizon: Horizon;
  risk: Risk;
}

export interface LastInvestment {
  transactionId: string;
  goalBefore: number | null;
  firstEver: boolean;
}

export interface AppState {
  version: number;
  auth: AuthState;
  pendingPhone: string | null;
  profile: Profile | null;
  learning: LearningState;
  quiz: QuizState;
  watchlist: string[];
  compare: string[];
  holdings: Holding[];
  transactions: Transaction[];
  sips: Sip[];
  goals: Goal[];
  investingStreak: number;
  lastInvestMonth: string | null;
  draft: InvestDraft | null;
  lastInvestment: LastInvestment | null;
}
