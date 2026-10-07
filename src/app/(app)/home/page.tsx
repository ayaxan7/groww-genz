"use client";

import { GoalSummary, MoneySnapshot, NextStepCard, NoGoalCard, QuickActions } from "@/components/home/HomeWidgets";
import { MobileHeader } from "@/components/layout/TopBar";
import { quizQuestions } from "@/data/quiz";
import { useAppStore } from "@/hooks/useAppStore";
import { usePortfolio } from "@/hooks/usePortfolio";
import { effectiveInvestingStreak, effectiveLearningStreak } from "@/lib/actions";
import { greeting } from "@/lib/format";
import { nextStep } from "@/lib/personalise";

/**
 * Home answers one question first: what should I do next? Then: what am I working
 * toward, and how is my money doing. Everything else lives on its own screen.
 */
export default function HomePage() {
  const { state } = useAppStore();
  const profile = state.profile!;
  const portfolio = usePortfolio();
  const goal = state.goals.find((g) => g.type === profile.goal) ?? state.goals[0];
  const quizDone = quizQuestions.every((q) => state.quiz.answers[q.id]);
  const step = nextStep(profile, state.learning.completed, quizDone, state.transactions.length > 0);
  const learning = effectiveLearningStreak(state.learning);
  const investing = effectiveInvestingStreak(state);

  return (
    <>
      <MobileHeader variant="home" />
      <div className="space-y-5 px-5 pb-6 pt-4">
        <header>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
            {greeting()}, {profile.name} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Let&apos;s take one small step today.</p>
          <div className="mt-3 flex gap-2 text-xs font-semibold">
            {learning > 0 && <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[#8a5300]">🔥 {learning} day streak</span>}
            {investing > 0 && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">📈 {investing} months investing</span>}
          </div>
        </header>

        <NextStepCard step={step} />
        {goal ? <GoalSummary goal={goal} /> : <NoGoalCard />}
        <MoneySnapshot value={portfolio.current} returnsPct={portfolio.returnsPct} empty={portfolio.isEmpty} />
        <QuickActions />
      </div>
    </>
  );
}
