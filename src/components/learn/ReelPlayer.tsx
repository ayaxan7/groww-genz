"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronLeft, Clock, Flame, Play, Volume2 } from "lucide-react";
import { lessonArt } from "@/data/art";
import { levelLabel, type Lesson } from "@/data/lessons";
import type { FeedTag } from "@/lib/personalise";
import { REEL_POINTS } from "@/data/quiz";
import { useReelPlayback } from "@/hooks/useReelPlayback";
import { Art } from "../ui/Art";
import { CompletionOverlay, type CompletionResult } from "./CompletionOverlay";
import { ReelActions } from "./ReelActions";

interface Props {
  lesson: Lesson;
  /** where this lesson sits relative to the learner's level */
  tag: FeedTag;
  index: number;
  total: number;
  streak: number;
  active: boolean;
  completed: boolean;
  onComplete: () => CompletionResult;
  onNext?: () => void;
  hasNext: boolean;
  /** user preference: narration on/off */
  sound: boolean;
  /** false until the browser allows audio (first interaction with the page) */
  soundReady: boolean;
  onToggleSound: () => void;
}

/** CSS-animated fill for the current caption; pauses with playback. */
function fillStyle(segMs: number, running: boolean, keyframes = "reel-fill"): CSSProperties {
  return {
    animationName: keyframes,
    animationDuration: `${segMs}ms`,
    animationPlayState: running ? "running" : "paused",
    ["--d" as string]: `${segMs}ms`,
  };
}

function SegmentBars({ pb }: { pb: ReturnType<typeof useReelPlayback> }) {
  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: pb.count }).map((_, i) => (
        <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
          {i < pb.segment ? (
            <span className="block h-full w-full rounded-full bg-ink" />
          ) : i === pb.segment ? (
            <span key={pb.runKey} className="reel-progress block h-full rounded-full bg-ink" style={fillStyle(pb.segMs, pb.running)} />
          ) : null}
        </span>
      ))}
    </div>
  );
}

/** Level of the lesson (dots) plus whether it's a stretch or a refresher for this learner. */
function LevelChip({ level, tag }: { level: Lesson["level"]; tag: FeedTag }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-hairline" aria-label={`${levelLabel[level]} lesson`}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((d) => (
          <span key={d} className={d <= level ? "size-1.5 rounded-full bg-brand" : "size-1.5 rounded-full bg-line"} />
        ))}
      </span>
      {levelLabel[level]}
      {tag === "next" && <span className="text-[#6b46d6]">· Next level</span>}
      {tag === "refresher" && <span className="text-subtle">· Refresher</span>}
    </span>
  );
}

/** One full-screen lesson: a 3D character stage, one caption at a time, one CTA. */
export function ReelPlayer({ lesson, tag, index, total, streak, active, completed, onComplete, onNext, hasNext, sound, soundReady, onToggleSound }: Props) {
  const router = useRouter();
  const [result, setResult] = useState<CompletionResult | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const handleComplete = useCallback(() => {
    const r = onComplete();
    setResult(r);
    if (r.celebrate) setOverlayOpen(true);
    else setToast(true);
  }, [onComplete]);
  // the milestone card holds playback; closing it resumes the loop from the start
  const pb = useReelPlayback(lesson, active && !overlayOpen, handleComplete, sound && soundReady);

  // the small "watched" toast hides itself
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const replay = () => {
    setResult(null);
    setOverlayOpen(false);
    setToast(false);
    pb.restart();
  };

  const n = pb.count;
  const overallStyle: CSSProperties = {
    ...fillStyle(pb.segMs, pb.running, "reel-span"),
    ["--from" as string]: `${(pb.segment / n) * 100}%`,
    ["--to" as string]: `${((pb.segment + 1) / n) * 100}%`,
  };
  // the character drifts forward one step per caption
  const artScale = 1 + ((pb.segment + (pb.running ? 1 : 0)) / n) * 0.06;

  return (
    <div
      className="relative size-full overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${lesson.accent}2e 0%, ${lesson.accent}12 45%, #ffffff 78%)` }}
    >
      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-[4] px-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/home")}
            className="press grid size-9 place-items-center rounded-full bg-white/80 ring-1 ring-black/5"
            aria-label="Back to Home"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold ring-1 ring-black/5">{lesson.category}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold ring-1 ring-black/5">
              <Flame className="size-3.5 text-[#f97316]" /> {streak}
            </span>
          )}
          <span className="ml-auto rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white tabular">
            {index + 1}/{total}
          </span>
        </div>
        <div className="mt-3">
          <SegmentBars pb={pb} />
        </div>
      </div>

      {/* character stage */}
      <div className="absolute inset-x-0 top-16 bottom-[44%] z-[1] grid place-items-center">
        <span className="absolute size-56 rounded-full bg-white/70 blur-[2px]" aria-hidden />
        <Art
          name={lessonArt[lesson.id] ?? "char-idea"}
          alt=""
          className="relative h-full max-h-[300px] w-auto origin-bottom [mask-image:linear-gradient(to_bottom,black_78%,transparent)] motion-reduce:transform-none"
          style={{ transform: `scale(${artScale})`, transition: `transform ${pb.running ? pb.segMs : 300}ms linear` }}
        />
      </div>

      {/* tap zones over the stage: back · pause · forward */}
      <div className="absolute inset-x-0 top-16 bottom-[44%] z-[2] grid grid-cols-[30%_40%_30%]">
        <button aria-label="Previous part" onClick={pb.prev} />
        <button aria-label={pb.paused ? "Play" : "Pause"} onClick={() => pb.setPaused(!pb.paused)} />
        <button aria-label="Next part" onClick={pb.next} />
      </div>
      {sound && !soundReady && active && (
        <button
          className="press absolute left-1/2 top-[72px] z-[5] inline-flex -translate-x-1/2 animate-fade-in items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg"
          aria-label="Tap for sound"
        >
          <Volume2 className="size-3.5" /> Tap for sound
        </button>
      )}
      {pb.paused && (
        <span className="pointer-events-none absolute left-1/2 top-[30%] z-[2] grid size-16 -translate-x-1/2 animate-pop place-items-center rounded-full bg-ink/60 text-white">
          <Play className="size-7 fill-white" />
        </span>
      )}

      {/* action rail: sits above the text panel so nothing covers it */}
      <div className="absolute right-3 top-[88px] z-[5]">
        <ReelActions lesson={lesson} sound={sound} onToggleSound={onToggleSound} />
      </div>

      {/* text + CTA (the panel itself lets taps through; only the CTA is interactive) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] px-5 pb-5">
        {toast && result && (
          <div className="pointer-events-auto mb-3 flex animate-sheet-up items-center gap-2 rounded-2xl bg-ink px-3.5 py-2.5 text-sm text-white" role="status">
            <CheckCircle2 className="size-4 shrink-0 text-brand" />
            <span className="flex-1">{result.firstTime ? `Watched · +${REEL_POINTS} pts` : "Watched again"}</span>
            {hasNext && onNext && (
              <button onClick={onNext} className="inline-flex items-center gap-1 font-semibold text-brand">
                Next <ChevronDown className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-hairline">
            <Clock className="size-3" /> {lesson.durationSec} sec
          </span>
          <LevelChip level={lesson.level} tag={tag} />
          {completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">
              <CheckCircle2 className="size-3.5" /> Watched
            </span>
          )}
        </div>
        <h2 className="mt-3 max-w-[85%] text-[30px] font-extrabold leading-[1.05] tracking-tight">{lesson.title}</h2>
        <p key={pb.segment} className="mt-2 min-h-[44px] animate-fade-up text-[15px] leading-snug text-ink-2" aria-live="polite">
          {lesson.segments[pb.segment]}
        </p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-line-2" aria-label="Lesson progress">
          <div key={pb.runKey} className="reel-progress h-full bg-brand" style={overallStyle} />
        </div>
        <Link
          href={lesson.cta.href}
          className="press pointer-events-auto mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-brand text-[15px] font-bold text-white"
        >
          {lesson.cta.label} <ArrowRight className="size-4" />
        </Link>
      </div>

      {result && overlayOpen && (
        <CompletionOverlay lesson={lesson} result={result} onReplay={replay} onNext={onNext} hasNext={hasNext} onClose={() => setOverlayOpen(false)} />
      )}
    </div>
  );
}
