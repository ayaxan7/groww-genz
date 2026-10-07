"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getInstrument } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { effectiveLearningStreak } from "@/lib/actions";
import { cn, formatINR } from "@/lib/format";
import { nextLesson } from "@/lib/personalise";

interface Note {
  id: string;
  emoji: string;
  title: string;
  body: string;
  href: string;
}

function useNotes(): Note[] {
  const { state } = useAppStore();
  const notes: Note[] = [];
  const tx = state.transactions[0];
  const inst = getInstrument(tx?.instrumentId);
  if (tx && inst) {
    notes.push({
      id: "tx",
      emoji: "✅",
      title: "Demo investment confirmed",
      body: `${formatINR(tx.amount)} in ${inst.name}${tx.frequency === "monthly" ? " (monthly SIP)" : ""}`,
      href: "/portfolio",
    });
  }
  const next = nextLesson(state.profile, state.learning.completed);
  notes.push({ id: "lesson", emoji: "🎬", title: "New for you", body: `${next.lesson.title} · 30 sec`, href: `/learn?lesson=${next.lesson.id}` });
  notes.push({
    id: "streak",
    emoji: "🔥",
    title: `Learning streak: ${effectiveLearningStreak(state.learning)} days`,
    body: "Watch one 30-sec reel today to keep it going",
    href: "/learn",
  });
  notes.push({ id: "quiz", emoji: "🧠", title: "Today's quiz is ready", body: "Questions from the reels you have watched", href: "/learn/quiz" });
  return notes;
}

export function NotificationsButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const notes = useNotes();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="press relative grid size-10 place-items-center rounded-full text-ink-2 hover:bg-line-2"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-down ring-2 ring-white" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-24px))] animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-lift)]">
          <p className="px-3 pb-1 pt-2 text-sm font-bold">Notifications</p>
          <ul>
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={n.href} onClick={() => setOpen(false)} className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-canvas">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas text-lg">{n.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{n.title}</span>
                    <span className="block truncate text-xs text-muted">{n.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
