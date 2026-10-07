"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, PlayCircle, Rocket } from "lucide-react";
import { goalArt } from "@/data/art";
import { horizonOptions, labelOf } from "@/data/profileOptions";
import { cn, formatINR } from "@/lib/format";
import type { NextStep } from "@/lib/personalise";
import type { Goal } from "@/lib/types";
import { Sparkline } from "../charts/Sparkline";
import { Art } from "../ui/Art";
import { buttonClass } from "../ui/Button";
import { CountUpINR } from "../ui/CountUp";
import { Change, ProgressBar } from "../ui/primitives";

/** The one thing to do next, with its 3D character. The visual focus of Home. */
export function NextStepCard({ step }: { step: NextStep }) {
  const [why, setWhy] = useState(false);
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#d9f7ea] via-[#ebfbf4] to-[#f7fdfa] p-5 pb-6">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/60" aria-hidden />
      <div className="relative z-10 max-w-[60%]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">{step.eyebrow}</p>
        <h2 className="mt-2 text-[26px] font-extrabold leading-[1.1] tracking-tight">{step.title}</h2>
        <p className="mt-2 text-sm leading-snug text-ink-2">{step.blurb}</p>
        <span className="mt-3 inline-block rounded-full border border-brand/30 bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {step.meta}
        </span>
        <div className="mt-4">
          <Link href={step.href} className={buttonClass({ className: "shadow-[0_8px_20px_-8px_rgb(0_208_156/0.7)]" })}>
            {step.cta} →
          </Link>
        </div>
        <button onClick={() => setWhy((w) => !w)} className="mt-3 text-xs font-medium text-muted hover:text-ink" aria-expanded={why}>
          Why this?
        </button>
        {why && <p className="mt-1 animate-fade-in text-xs text-muted">{step.reason}.</p>}
      </div>
      <Art name={step.art} className="absolute -right-3 bottom-0 h-[205px] w-auto" />
    </section>
  );
}

/** "You're building toward…" with the goal's 3D object. */
export function GoalSummary({ goal }: { goal: Goal }) {
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  return (
    <Link href="/goals" className="press block rounded-3xl bg-white p-5 ring-1 ring-hairline">
      <p className="text-xs font-semibold text-muted">You&apos;re building toward</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-soft">
          <Art name={goalArt[goal.type]} className="size-11" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{goal.name}</p>
          <p className="text-xl font-extrabold tabular">
            {formatINR(goal.saved)} <span className="text-sm font-medium text-subtle">/ {formatINR(goal.target)}</span>
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-xs font-bold text-brand-700 tabular">{pct}%</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">
          {formatINR(goal.monthly)}/month · {labelOf(horizonOptions, goal.horizon)}
        </span>
        <span className="font-semibold text-brand-700">View goal →</span>
      </div>
    </Link>
  );
}

export function NoGoalCard() {
  return (
    <Link href="/goals" className="press flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-hairline">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-soft">
        <Art name="el-target" className="size-11" />
      </span>
      <span className="flex-1">
        <span className="block font-bold">Give your money a job</span>
        <span className="block text-xs text-muted">Set your first goal</span>
      </span>
      <span className="text-sm font-semibold text-brand-700">Start →</span>
    </Link>
  );
}

export function MoneySnapshot({ value, returnsPct, empty }: { value: number; returnsPct: number; empty: boolean }) {
  return (
    <Link href="/portfolio" className="press block rounded-3xl bg-white p-5 ring-1 ring-hairline">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">Your money</p>
          <p className="mt-1 text-[28px] font-extrabold leading-none">
            <CountUpINR value={value} />
          </p>
          {empty ? <p className="mt-2 text-xs text-muted">Nothing invested yet</p> : <Change value={returnsPct} className="mt-2 block text-sm" />}
        </div>
        {!empty && <Sparkline seed="home-money" end={value} changePct={returnsPct} width={110} height={44} fill />}
      </div>
      <p className="mt-3 text-right text-xs font-semibold text-brand-700">View portfolio →</p>
    </Link>
  );
}

const actions = [
  { label: "Learn", href: "/learn", icon: PlayCircle, tint: "bg-violet-soft text-[#6b46d6]" },
  { label: "Explore", href: "/explore", icon: Compass, tint: "bg-brand-50 text-brand-700" },
  { label: "Invest", href: "/invest", icon: Rocket, tint: "bg-amber-soft text-[#c26a00]" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ label, href, icon: Icon, tint }) => (
        <Link key={label} href={href} className="press flex flex-col items-center gap-2 rounded-2xl bg-white py-4 ring-1 ring-hairline">
          <span className={cn("grid size-10 place-items-center rounded-full", tint)}>
            <Icon className="size-5" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold">{label}</span>
        </Link>
      ))}
    </div>
  );
}
