"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Brain, Heart, Volume2, VolumeX } from "lucide-react";
import type { Lesson } from "@/data/lessons";
import { useAppStore } from "@/hooks/useAppStore";
import { toggleBookmark, toggleLike } from "@/lib/actions";
import { cn } from "@/lib/format";
import { NavIcon } from "../ui/NavIcon";

const baseLikes: Record<string, number> = { sip: 1240, diversification: 860, cagr: 640, "risk-return": 910, etf: 720, goal: 530 };

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

/** Mock like count: fixed for the original lessons, a stable value derived from the id otherwise. */
const likesFor = (id: string) => baseLikes[id] ?? 200 + ([...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7) % 500);

const btn = "press grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-[0_6px_16px_-8px_rgb(17_24_39/0.35)] ring-1 ring-black/5";

function Action({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <span className="text-[11px] font-semibold text-ink-2">{label}</span>
    </div>
  );
}

/** Vertical action rail on a reel: like, save, share, quiz, sound. */
export function ReelActions({ lesson, sound, onToggleSound }: { lesson: Lesson; sound: boolean; onToggleSound: () => void }) {
  const { state, update } = useAppStore();
  const liked = state.learning.liked.includes(lesson.id);
  const saved = state.learning.bookmarked.includes(lesson.id);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const share = async () => {
    const url = `${window.location.origin}/learn?lesson=${lesson.id}`;
    try {
      if (navigator.share) await navigator.share({ title: lesson.title, text: lesson.description, url });
      else {
        await navigator.clipboard.writeText(url);
        flash("Link copied");
      }
    } catch {
      // share sheet dismissed
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-3">
      <Action label={compact(likesFor(lesson.id) + (liked ? 1 : 0))}>
        <button className={btn} onClick={() => update((s) => toggleLike(s, lesson.id))} aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"}>
          <Heart className={cn("size-5", liked && "animate-pop fill-[#ff4d6d] text-[#ff4d6d]")} />
        </button>
      </Action>
      <Action label={saved ? "Saved" : "Save"}>
        <button
          className={btn}
          onClick={() => {
            update((s) => toggleBookmark(s, lesson.id));
            flash(saved ? "Removed from saved" : "Saved for later");
          }}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark"}
        >
          <NavIcon name="bookmark" size={20} strokeWidth={2} className={cn(saved && "animate-pop fill-ink")} />
        </button>
      </Action>
      <Action label="Share">
        <button className={btn} onClick={share} aria-label="Share">
          <NavIcon name="share" size={20} strokeWidth={2} />
        </button>
      </Action>
      <Action label="Quiz">
        <Link href={`/learn/quiz?topic=${lesson.id}`} className={btn} aria-label="Quiz me on this">
          <Brain className="size-5" />
        </Link>
      </Action>
      <Action label={sound ? "Sound" : "Muted"}>
        <button className={btn} onClick={onToggleSound} aria-pressed={sound} aria-label={sound ? "Mute narration" : "Play narration"}>
          {sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </Action>
      {toast && (
        <span
          role="status"
          className="absolute right-14 top-14 animate-fade-in whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
        >
          {toast}
        </span>
      )}
    </div>
  );
}
