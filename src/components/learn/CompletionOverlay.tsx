"use client";

import Link from "next/link";
import { ArrowRight, Brain, Flame, RotateCcw, X } from "lucide-react";
import { lessons, type Lesson } from "@/data/lessons";
import { REEL_POINTS } from "@/data/quiz";
import { cn } from "@/lib/format";
import { Art } from "../ui/Art";
import { buttonClass } from "../ui/Button";

export interface CompletionResult {
  firstTime: boolean;
  streakUp: boolean;
  streak: number;
  /** show the full celebration card (milestones only); otherwise a small toast */
  celebrate: boolean;
  /** lessons watched so far, used to offer a quiz on everything learned */
  learnedCount: number;
}

function headline(r: CompletionResult) {
  if (r.learnedCount === lessons.length) return "You've watched them all! 🎉";
  if (r.streakUp) return "Great! 🎉";
  return `${r.learnedCount} lessons down 🎉`;
}

function subline(r: CompletionResult) {
  if (r.learnedCount === lessons.length) return "Test yourself on everything you've learned.";
  if (r.streakUp) return "You learned something new today.";
  return "Nice momentum. Ready to check what stuck?";
}

/** Shown at learning milestones: celebrates, updates streak, offers a quiz on what was learned. */
export function CompletionOverlay({
  lesson,
  result,
  onReplay,
  onNext,
  hasNext,
  onClose,
}: {
  lesson: Lesson;
  result: CompletionResult;
  onReplay: () => void;
  onNext?: () => void;
  hasNext: boolean;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center p-3 pt-24">
      {/* tapping the dimmed area dismisses the card */}
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-sm animate-sheet-up rounded-3xl bg-white p-5 pt-6 text-ink shadow-[var(--shadow-lift)]"
        role="dialog"
        aria-label="Lesson complete"
      >
        <Art name="char-celebrate" className="absolute -top-16 right-3 h-24 w-auto" />
        <button onClick={onClose} className="press absolute left-3 top-3 grid size-8 place-items-center rounded-full hover:bg-line-2" aria-label="Close">
          <X className="size-4 text-muted" />
        </button>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid size-12 animate-pop place-items-center rounded-full bg-brand text-white">
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-extrabold">{headline(result)}</p>
            <p className="text-sm text-muted">{subline(result)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-amber-soft p-3">
          <Flame className={cn("size-7 text-[#f97316]", result.streakUp && "animate-pulse-soft")} />
          <div className="flex-1">
            <p className="text-xs font-medium text-[#8a5300]">Learning streak</p>
            <p className="text-base font-extrabold">{result.streak} days</p>
          </div>
          {result.firstTime && <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700">+{REEL_POINTS} pts</span>}
        </div>

        <p className="mt-4 text-sm font-bold">Ready to put it into practice?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={lesson.cta.href} className={buttonClass({ size: "sm", className: "col-span-2" })}>
            {lesson.cta.label} <ArrowRight className="size-3.5" />
          </Link>
          <Link href="/learn/quiz" className={buttonClass({ variant: "secondary", size: "sm" })}>
            <Brain className="size-4" /> Quiz me ({result.learnedCount})
          </Link>
          {hasNext && onNext ? (
            <button onClick={onNext} className={buttonClass({ variant: "outline", size: "sm" })}>
              Next reel
            </button>
          ) : (
            <button onClick={onReplay} className={buttonClass({ variant: "outline", size: "sm" })}>
              <RotateCcw className="size-4" /> Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
