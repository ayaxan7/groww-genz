"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { goalArt } from "@/data/art";
import { horizonOptions, labelOf } from "@/data/profileOptions";
import { cn, formatINR } from "@/lib/format";
import type { Goal } from "@/lib/types";
import { Art } from "../ui/Art";
import { buttonClass } from "../ui/Button";
import { ProgressBar } from "../ui/primitives";

function GoalMenu({ onView, onAdjust }: { onView: () => void; onAdjust: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((m) => !m)}
        className="press grid size-9 place-items-center rounded-full hover:bg-black/5"
        aria-label="Goal options"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-5 text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-10 w-36 animate-fade-in overflow-hidden rounded-xl border border-hairline bg-white py-1 shadow-[var(--shadow-lift)]">
          {(
            [
              ["View details", onView],
              ["Adjust goal", onAdjust],
            ] as const
          ).map(([label, fn]) => (
            <button
              key={label}
              onClick={() => {
                setOpen(false);
                fn();
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-canvas"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A goal as something you're working toward, not a financial record.
 * `featured` is the large card for the main goal; otherwise a compact row.
 */
export function GoalCard({ goal, featured, onView, onAdjust }: { goal: Goal; featured?: boolean; onView: () => void; onAdjust: () => void }) {
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const meta = `${formatINR(goal.monthly)}/month · ${labelOf(horizonOptions, goal.horizon)}`;

  if (!featured) {
    return (
      <div className="rounded-3xl bg-white p-4 ring-1 ring-hairline">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-canvas">
            <Art name={goalArt[goal.type]} className="size-9" />
          </span>
          <button onClick={onView} className="min-w-0 flex-1 text-left">
            <p className="truncate font-bold">{goal.name}</p>
            <p className="text-sm tabular text-muted">
              {formatINR(goal.saved)} / {formatINR(goal.target)}
            </p>
          </button>
          <GoalMenu onView={onView} onAdjust={onAdjust} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={pct} className="flex-1" />
          <span className="text-xs font-bold text-brand-700 tabular">{pct}%</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted">{meta}</span>
          <Link href={`/invest?goal=${goal.id}`} className="font-semibold text-brand-700">
            Add money →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ece9ff] via-[#f3f1ff] to-[#e6faf3] p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-[#6b46d6]">You&apos;re building toward</p>
        <GoalMenu onView={onView} onAdjust={onAdjust} />
      </div>
      <div className="relative">
        <h2 className="max-w-[60%] text-[24px] font-extrabold leading-tight tracking-tight">{goal.name}</h2>
        <Art name={goalArt[goal.type]} className="absolute -top-8 right-0 size-28" />
      </div>
      <p className={cn("mt-6 text-sm font-semibold", pct >= 100 ? "text-brand-700" : "text-ink-2")}>{pct >= 100 ? "You did it 🎉" : `You're ${pct}% there`}</p>
      <p className="mt-1 text-[26px] font-extrabold tabular">
        {formatINR(goal.saved)} <span className="text-sm font-medium text-subtle">/ {formatINR(goal.target)}</span>
      </p>
      <ProgressBar value={pct} className="mt-3 bg-white" />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-white/80 px-2.5 py-1 font-medium text-ink-2">{formatINR(goal.monthly)}/month</span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 font-medium text-ink-2">{labelOf(horizonOptions, goal.horizon)}</span>
        {pct < 100 && <span className="ml-auto text-muted">{formatINR(goal.target - goal.saved)} to go</span>}
      </div>
      <Link href={`/invest?goal=${goal.id}`} className={buttonClass({ full: true, size: "lg", className: "mt-5" })}>
        Add money
      </Link>
    </section>
  );
}
