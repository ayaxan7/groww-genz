import { getInstrument } from "@/data/instruments";
import { QUIZ_POINTS, quizQuestions, REEL_POINTS } from "@/data/quiz";
import { daysBetween, monthKey, monthsBetween, todayKey, uid } from "./format";
import { createSeedState, goalFromProfile } from "./seed";
import type { AppState, AuthMethod, Goal, InvestDraft, LearningState, Profile } from "./types";

/** Pure state transitions. Each takes the current state and returns the next one. */

export function touchLearningDay(l: LearningState): LearningState {
  const today = todayKey();
  if (l.lastActiveDate === today) return l;
  const gap = l.lastActiveDate ? daysBetween(l.lastActiveDate, today) : Infinity;
  return { ...l, streak: gap === 1 ? l.streak + 1 : 1, lastActiveDate: today };
}

/** Streak to display: a streak is broken if the last active day is older than yesterday. */
export function effectiveLearningStreak(l: LearningState): number {
  if (!l.lastActiveDate) return 0;
  return daysBetween(l.lastActiveDate, todayKey()) <= 1 ? l.streak : 0;
}

export function effectiveInvestingStreak(s: AppState): number {
  if (!s.lastInvestMonth) return 0;
  return monthsBetween(s.lastInvestMonth, monthKey()) <= 1 ? s.investingStreak : 0;
}

export const login = (s: AppState, method: AuthMethod, phone: string | null = null): AppState => ({
  ...s,
  auth: { isAuthed: true, method, phone },
  pendingPhone: null,
});

export const setPendingPhone = (s: AppState, phone: string): AppState => ({ ...s, pendingPhone: phone });

export const logout = (s: AppState): AppState => ({ ...s, auth: { isAuthed: false, method: null, phone: null } });

export function completeOnboarding(s: AppState, profile: Profile): AppState {
  // Keep existing goals; make sure there is one for the chosen goal type.
  const hasGoal = s.goals.some((g) => g.type === profile.goal);
  const goals = hasGoal
    ? s.goals.map((g) => (g.type === profile.goal ? { ...g, monthly: profile.amount, horizon: profile.horizon } : g))
    : [goalFromProfile(profile, s.goals.length === 0 && s.holdings.length > 0 ? 1500 : 0), ...s.goals];
  return { ...s, profile, goals };
}

/**
 * The full "You learned something new" card is saved for meaningful moments instead of
 * interrupting every reel: the first reel of the day, every third reel, and finishing them all.
 */
export function isLearningMilestone(completedCount: number, totalLessons: number, streakUp: boolean): boolean {
  return streakUp || completedCount % 3 === 0 || completedCount === totalLessons;
}

export function completeLesson(s: AppState, lessonId: string): { state: AppState; firstTime: boolean; streakUp: boolean } {
  if (s.learning.completed.includes(lessonId)) return { state: s, firstTime: false, streakUp: false };
  const touched = touchLearningDay(s.learning);
  const streakUp = touched.streak > effectiveLearningStreak(s.learning);
  return {
    state: {
      ...s,
      learning: { ...touched, completed: [...s.learning.completed, lessonId], points: s.learning.points + REEL_POINTS },
    },
    firstTime: true,
    streakUp,
  };
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export const toggleLike = (s: AppState, id: string): AppState => ({
  ...s,
  learning: { ...s.learning, liked: toggle(s.learning.liked, id) },
});

export const toggleBookmark = (s: AppState, id: string): AppState => ({
  ...s,
  learning: { ...s.learning, bookmarked: toggle(s.learning.bookmarked, id) },
});

export function answerQuiz(s: AppState, questionId: string, choice: number): AppState {
  if (s.quiz.answers[questionId]) return s;
  const q = quizQuestions.find((x) => x.id === questionId);
  if (!q) return s;
  const correct = q.answer === choice;
  return {
    ...s,
    quiz: { answers: { ...s.quiz.answers, [questionId]: { choice, correct } } },
    learning: {
      ...touchLearningDay(s.learning),
      points: s.learning.points + (correct ? QUIZ_POINTS : 0),
    },
  };
}

/** Clears quiz answers, either all of them or just the given questions. */
export function resetQuiz(s: AppState, questionIds?: string[]): AppState {
  if (!questionIds) return { ...s, quiz: { answers: {} } };
  const answers = { ...s.quiz.answers };
  for (const id of questionIds) delete answers[id];
  return { ...s, quiz: { answers } };
}

export const toggleWatchlist = (s: AppState, id: string): AppState => ({ ...s, watchlist: toggle(s.watchlist, id) });

export const MAX_COMPARE = 3;

export function toggleCompare(s: AppState, id: string): AppState {
  if (s.compare.includes(id)) return { ...s, compare: s.compare.filter((x) => x !== id) };
  if (s.compare.length >= MAX_COMPARE) return s;
  return { ...s, compare: [...s.compare, id] };
}

export const setCompare = (s: AppState, ids: string[]): AppState => ({ ...s, compare: ids.slice(0, MAX_COMPARE) });

export function startDraft(s: AppState, patch: Partial<InvestDraft> = {}): AppState {
  const p = s.profile;
  const primaryGoal = s.goals.find((g) => g.type === p?.goal) ?? s.goals[0];
  const draft: InvestDraft = {
    instrumentId: null,
    goalId: primaryGoal?.id ?? null,
    goalType: p?.goal ?? "wealth",
    amount: p?.amount ?? 500,
    frequency: "monthly",
    horizon: p?.horizon ?? "3-5",
    risk: p?.risk ?? "moderate",
    ...patch,
  };
  return { ...s, draft };
}

export const updateDraft = (s: AppState, patch: Partial<InvestDraft>): AppState => (s.draft ? { ...s, draft: { ...s.draft, ...patch } } : startDraft(s, patch));

export function confirmInvestment(s: AppState): AppState {
  const d = s.draft;
  const inst = getInstrument(d?.instrumentId);
  if (!d || !inst) return s;

  const tx = {
    id: uid("tx"),
    instrumentId: inst.id,
    amount: d.amount,
    frequency: d.frequency,
    goalId: d.goalId,
    createdAt: new Date().toISOString(),
  };

  const units = d.amount / inst.price;
  const existing = s.holdings.find((h) => h.instrumentId === inst.id);
  const holdings = existing
    ? s.holdings.map((h) => (h.instrumentId === inst.id ? { ...h, invested: h.invested + d.amount, current: h.current + d.amount, units: h.units + units } : h))
    : [...s.holdings, { instrumentId: inst.id, invested: d.amount, current: d.amount, units }];

  const goal = s.goals.find((g) => g.id === d.goalId);
  const goals = s.goals.map((g) => (g.id === d.goalId ? { ...g, saved: g.saved + d.amount } : g));

  const thisMonth = monthKey();
  let investingStreak = s.investingStreak;
  if (s.lastInvestMonth !== thisMonth) {
    investingStreak = s.lastInvestMonth && monthsBetween(s.lastInvestMonth, thisMonth) === 1 ? s.investingStreak + 1 : 1;
  }

  const sips =
    d.frequency === "monthly" ? [...s.sips, { id: uid("sip"), instrumentId: inst.id, amount: d.amount, goalId: d.goalId, startedAt: tx.createdAt }] : s.sips;

  return {
    ...s,
    holdings,
    goals,
    sips,
    transactions: [tx, ...s.transactions],
    investingStreak,
    lastInvestMonth: thisMonth,
    lastInvestment: { transactionId: tx.id, goalBefore: goal ? goal.saved : null, firstEver: s.transactions.length === 0 },
    draft: null,
  };
}

export function addGoal(s: AppState, goal: Omit<Goal, "id" | "createdAt">): AppState {
  return { ...s, goals: [...s.goals, { ...goal, id: uid("goal"), createdAt: new Date().toISOString() }] };
}

export const updateGoal = (s: AppState, id: string, patch: Partial<Goal>): AppState => ({
  ...s,
  goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
});

export const deleteGoal = (s: AppState, id: string): AppState => ({
  ...s,
  goals: s.goals.filter((g) => g.id !== id),
  sips: s.sips.map((x) => (x.goalId === id ? { ...x, goalId: null } : x)),
});

export const clearSampleData = (s: AppState): AppState => ({
  ...s,
  holdings: [],
  transactions: [],
  sips: [],
  goals: [],
  lastInvestment: null,
});

export const freshState = (): AppState => createSeedState();
