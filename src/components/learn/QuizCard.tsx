"use client";

import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/data/quiz";
import { QUIZ_POINTS } from "@/data/quiz";
import { cn } from "@/lib/format";

export function QuizCard({
  question,
  answer,
  onAnswer,
}: {
  question: QuizQuestion;
  answer?: { choice: number; correct: boolean };
  onAnswer: (choice: number) => void;
}) {
  const answered = !!answer;
  return (
    <div>
      <h2 className="text-xl font-extrabold leading-snug tracking-tight">{question.question}</h2>
      <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={question.question}>
        {question.options.map((opt, i) => {
          const isCorrect = i === question.answer;
          const isChosen = answer?.choice === i;
          const state = !answered ? "idle" : isCorrect ? "correct" : isChosen ? "wrong" : "muted";
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={isChosen}
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={cn(
                "press flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-[15px] font-semibold disabled:cursor-default",
                state === "idle" && "border-line bg-white hover:border-ink/25",
                state === "correct" && "animate-pop border-brand bg-brand-50 text-brand-700",
                state === "wrong" && "animate-shake border-down bg-rose-soft text-[#c2410c]",
                state === "muted" && "border-line bg-white opacity-55",
              )}
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  state === "correct" ? "border-brand bg-brand text-white" : state === "wrong" ? "border-down bg-down text-white" : "border-line text-muted",
                )}
              >
                {state === "correct" ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : state === "wrong" ? (
                  <X className="size-4" strokeWidth={3} />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div role="status" className={cn("mt-4 animate-fade-up rounded-2xl p-4", answer.correct ? "bg-brand-50" : "bg-amber-soft")}>
          <p className="flex items-center justify-between text-[15px] font-extrabold">
            {answer.correct ? "Nice! 🎉" : "Almost. Let's understand why."}
            {answer.correct && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-brand-700">+{QUIZ_POINTS} pts</span>}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
