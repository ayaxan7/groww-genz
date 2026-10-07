"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, CheckCircle2, Flame } from "lucide-react";
import { getInstrument } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { effectiveInvestingStreak, effectiveLearningStreak } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import type { LastInvestment, Transaction } from "@/lib/types";
import { buttonClass } from "../ui/Button";
import { Art } from "../ui/Art";
import { Confetti } from "../ui/Confetti";
import { Card } from "../ui/primitives";

export function SuccessState({ tx, last }: { tx: Transaction; last: LastInvestment }) {
  const { state } = useAppStore();
  const inst = getInstrument(tx.instrumentId)!;
  const goal = state.goals.find((g) => g.id === tx.goalId);
  const before = last.goalBefore ?? 0;
  const [pct, setPct] = useState(goal ? (before / goal.target) * 100 : 0);

  // animate goal progress from the old value to the new one
  useEffect(() => {
    if (!goal) return;
    const t = setTimeout(() => setPct((goal.saved / goal.target) * 100), 500);
    return () => clearTimeout(t);
  }, [goal]);

  return (
    <div className="relative overflow-hidden px-5 pb-10 pt-8 text-center">
      <Confetti />
      <div className="relative mx-auto w-fit">
        <Art name="char-celebrate" className="h-44 w-auto animate-pop" />
        <svg className="absolute -right-2 bottom-1 size-14 rounded-full bg-white p-1 shadow-[var(--shadow-lift)]" viewBox="0 0 56 56" aria-hidden>
          <circle className="check-circle" cx="28" cy="28" r="26" fill="none" stroke="var(--color-brand)" strokeWidth="3" />
          <path
            className="check-mark"
            d="M17 29l7 7 15-16"
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mt-6 animate-fade-up text-[26px] font-extrabold leading-tight tracking-tight">
        🎉 {last.firstEver ? "Your first investment is set up!" : "Your investment is set up!"}
      </h1>
      <p className="mt-2 text-muted">You&apos;re one step closer to your goal. Keep going!</p>

      <Card className="mt-8 p-5 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Investment</p>
            <p className="font-bold">{inst.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{tx.frequency === "monthly" ? "Monthly SIP" : "One-time"}</p>
            <p className="text-xl font-extrabold tabular">{formatINR(tx.amount)}</p>
          </div>
        </div>

        {goal && (
          <div className="mt-5 rounded-2xl bg-canvas p-4">
            <div className="flex items-baseline justify-between text-sm">
              <p className="font-semibold">{goal.name}</p>
              <p className="tabular">
                <span className="font-bold">{formatINR(goal.saved)}</span> <span className="text-muted">/ {formatINR(goal.target)}</span>
              </p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-out" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              +{formatINR(tx.amount)} added · {Math.round((goal.saved / goal.target) * 100)}% complete
            </p>
          </div>
        )}

        <ul className="mt-5 space-y-2.5 text-sm">
          {[
            [<CheckCircle2 key="c" className="size-4 text-brand" />, "Investment added to portfolio", null],
            [<Flame key="f" className="size-4 text-[#f97316]" />, "Learning streak", `${effectiveLearningStreak(state.learning)} days`],
            [<CalendarCheck key="i" className="size-4 text-brand-700" />, "Investing streak", `${effectiveInvestingStreak(state)} months`],
          ].map(([icon, label, value], i) => (
            <li key={i} className="flex animate-fade-up items-center gap-2.5" style={{ animationDelay: `${300 + i * 120}ms` }}>
              {icon}
              <span className="text-ink-2">{label}</span>
              {value && <span className="ml-auto font-bold">{value}</span>}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 grid gap-3">
        <Link href="/portfolio" className={buttonClass({ size: "lg" })}>
          View Portfolio <ArrowRight className="size-4" />
        </Link>
        <Link href="/learn" className={buttonClass({ variant: "outline", size: "lg" })}>
          Continue Learning
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">Demo transaction · No real money was moved.</p>
    </div>
  );
}
