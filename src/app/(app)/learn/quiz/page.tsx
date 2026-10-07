"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, ArrowRight, Flame, RotateCcw, Sparkles } from "lucide-react";
import { QuizCard } from "@/components/learn/QuizCard";
import { MobileHeader } from "@/components/layout/TopBar";
import { Art } from "@/components/ui/Art";
import { Button, buttonClass } from "@/components/ui/Button";
import { Card, ProgressBar } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/ui/states";
import { SwipeHint } from "@/components/ui/SwipeHint";
import { getLesson, lessons } from "@/data/lessons";
import { QUIZ_POINTS, quizQuestions } from "@/data/quiz";
import { useAppStore } from "@/hooks/useAppStore";
import { useSwipe } from "@/hooks/useSwipe";
import { answerQuiz, effectiveLearningStreak, resetQuiz } from "@/lib/actions";

function QuizView() {
  const { state, update } = useAppStore();
  const router = useRouter();
  const params = useSearchParams();
  const answers = state.quiz.answers;
  const topic = getLesson(params.get("topic"));
  const completed = state.learning.completed;

  // The quiz is curated from what the user has actually learned: one lesson when opened from a
  // reel, otherwise every lesson they've watched (in the order they watched them).
  const pool = topic ? quizQuestions.filter((q) => q.lessonId === topic.id) : completed.flatMap((id) => quizQuestions.filter((q) => q.lessonId === id));

  const firstOpen = pool.findIndex((q) => !answers[q.id]);
  const [index, setIndex] = useState(firstOpen >= 0 ? firstOpen : pool.length);
  const total = pool.length;
  const answeredCount = pool.filter((q) => answers[q.id]).length;
  const correctCount = pool.filter((q) => answers[q.id]?.correct).length;
  const finished = total > 0 && index >= total;
  const q = pool[Math.min(index, total - 1)];
  const lesson = q ? getLesson(q.lessonId) : undefined;

  const goNext = () => {
    // skip to the next unanswered question, otherwise the summary
    const nextOpen = pool.findIndex((x, i) => i > index && !answers[x.id]);
    setIndex(nextOpen >= 0 ? nextOpen : answeredCount === total ? total : index + 1);
  };

  // swipe left for the next question (once answered), right for the previous one
  const swipe = useSwipe({
    onLeft: () => q && !finished && answers[q.id] && goNext(),
    onRight: () => !finished && setIndex((i) => Math.max(0, i - 1)),
  });

  const lessonsCovered = new Set(pool.map((x) => x.lessonId)).size;

  return (
    <>
      <MobileHeader title="Quiz" back="/learn" />
      <div className="px-5 pb-8 pt-4">
        {total === 0 ? (
          <div className="flex flex-col items-center pt-6 text-center">
            <Art name="char-thinking" className="h-44 w-auto" />
            <h2 className="mt-4 text-xl font-extrabold">Your quiz builds itself as you learn</h2>
            <p className="mt-2 text-sm text-muted">Watch a 30-sec reel and we&apos;ll ask you about what you just learned. No trick questions.</p>
            <Link href="/learn" className={buttonClass({ className: "mt-6" })}>
              Watch a reel <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-violet-soft px-3 py-1 text-xs font-semibold text-[#6b46d6]">
              <Sparkles className="size-3.5" />
              {topic ? `On: ${topic.title}` : `From the ${lessonsCovered} lesson${lessonsCovered === 1 ? "" : "s"} you've watched`}
            </p>
            <div className="mb-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white p-3 ring-1 ring-hairline">
                <p className="text-[11px] font-medium text-muted">Points</p>
                <p className="text-lg font-extrabold tabular">{state.learning.points}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 ring-1 ring-hairline">
                <p className="text-[11px] font-medium text-muted">Correct</p>
                <p className="text-lg font-extrabold tabular">
                  {correctCount}/{total}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 ring-1 ring-hairline">
                <p className="text-[11px] font-medium text-muted">Streak</p>
                <p className="flex items-center justify-center gap-1 text-lg font-extrabold">
                  <Flame className="size-4 text-[#f97316]" /> {effectiveLearningStreak(state.learning)}
                </p>
              </div>
            </div>

            {finished ? (
              <Card className="animate-fade-up p-6 text-center">
                <Art name="char-celebrate" className="mx-auto h-32 w-auto" />
                <h2 className="mt-3 text-2xl font-extrabold">Quiz complete!</h2>
                <p className="mt-1 text-muted">
                  You got {correctCount} of {total} right and earned {correctCount * QUIZ_POINTS} points.
                </p>
                <p className="mt-3 text-sm text-ink-2">
                  {completed.length < lessons.length
                    ? "Watch more reels and new questions will appear here."
                    : "Learning is about consistency, not perfection."}
                </p>
                <div className="mt-6 grid gap-2">
                  <Link href="/learn" className={buttonClass({})}>
                    {completed.length < lessons.length ? "Watch another reel" : "Back to reels"} <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/explore" className={buttonClass({ variant: "outline" })}>
                    Explore
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      update((s) =>
                        resetQuiz(
                          s,
                          pool.map((x) => x.id),
                        ),
                      );
                      setIndex(0);
                    }}
                  >
                    <RotateCcw className="size-4" /> Retake
                  </Button>
                </div>
              </Card>
            ) : (
              q && (
                <Card key={q.id} className="animate-slide-next p-5" {...swipe}>
                  <div className="mb-5 flex items-center gap-3">
                    <ProgressBar value={((index + (answers[q.id] ? 1 : 0)) / total) * 100} className="flex-1" />
                    <span className="text-xs font-semibold text-muted tabular">
                      {index + 1}/{total}
                    </span>
                  </div>
                  {lesson && <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-700">{lesson.title}</p>}
                  <QuizCard key={q.id} question={q} answer={answers[q.id]} onAnswer={(choice) => update((s) => answerQuiz(s, q.id, choice))} />
                  {answers[q.id] && (
                    <div className="mt-4">
                      <SwipeHint text="Swipe left for the next question" />
                    </div>
                  )}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                      <ArrowLeft className="size-4" /> Previous
                    </Button>
                    {answers[q.id] ? (
                      <Button onClick={goNext}>
                        {index === total - 1 || answeredCount === total ? "See results" : "Next"} <ArrowRight className="size-4" />
                      </Button>
                    ) : (
                      lesson && (
                        <button onClick={() => router.push(`/learn?lesson=${lesson.id}`)} className="text-sm font-semibold text-muted hover:text-ink">
                          Rewatch the reel
                        </button>
                      )
                    )}
                  </div>
                </Card>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <QuizView />
    </Suspense>
  );
}
