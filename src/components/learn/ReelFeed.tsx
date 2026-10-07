"use client";

import { useEffect, useRef, useState } from "react";
import type { FeedItem } from "@/lib/personalise";
import { useAppStore } from "@/hooks/useAppStore";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import { effectiveLearningStreak } from "@/lib/actions";
import { ReelPlayer } from "./ReelPlayer";

/** Full-screen vertical reels with CSS scroll snapping. */
export function ReelFeed({ items, initialId }: { items: FeedItem[]; initialId?: string }) {
  const lessons = items.map((i) => i.lesson);
  const { state } = useAppStore();
  const complete = useLessonCompletion();
  const feed = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(initialId ?? lessons[0]?.id);
  // narration is on by default; the sound button on each reel mutes it
  const [sound, setSound] = useState(true);
  // browsers only allow audio after the person has interacted with the page. Arriving here by
  // tapping counts; a cold open of a Learn link waits for the first tap.
  const [soundReady, setSoundReady] = useState(() => !("userActivation" in navigator) || navigator.userActivation.hasBeenActive);
  const reported = useRef<string | null>(null);

  // jump to a requested lesson (first render, or a new ?lesson= link)
  useEffect(() => {
    if (!initialId || initialId === reported.current) return;
    const el = feed.current?.querySelector<HTMLElement>(`[data-lesson="${initialId}"]`);
    el?.scrollIntoView({ block: "start" });
  }, [initialId]);

  // track which reel is on screen. Keyed on the lesson ids (not the array identity) so a
  // re-render never re-attaches the observer, and the URL only changes when the reel does;
  // otherwise URL → re-render → observer → URL loops and blocks navigation.
  const lessonKey = lessons.map((l) => l.id).join(",");
  useEffect(() => {
    const root = feed.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).dataset.lesson!;
          setActiveId(id);
          if (reported.current === id) continue;
          reported.current = id;
          if (new URLSearchParams(window.location.search).get("lesson") !== id) {
            window.history.replaceState(window.history.state, "", `/learn?lesson=${id}`);
          }
        }
      },
      { root, threshold: 0.65 },
    );
    root.querySelectorAll("[data-lesson]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lessonKey]);

  useEffect(() => {
    if (soundReady) return;
    const unlock = () => setSoundReady(true);
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true });
      document.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [soundReady]);

  const goNext = (i: number) => {
    const el = feed.current?.querySelectorAll<HTMLElement>("[data-lesson]")[i + 1];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const streak = effectiveLearningStreak(state.learning);

  return (
    <div className="fixed inset-x-0 top-[env(safe-area-inset-top)] bottom-[calc(64px+env(safe-area-inset-bottom))] z-0 bg-white">
      <div ref={feed} className="reel-feed no-scrollbar h-full overflow-y-scroll">
        {lessons.map((l, i) => (
          <section key={l.id} data-lesson={l.id} className="reel-slide h-full" aria-label={l.title}>
            <ReelPlayer
              lesson={l}
              tag={items[i].tag}
              index={i}
              total={lessons.length}
              streak={streak}
              active={activeId === l.id}
              completed={state.learning.completed.includes(l.id)}
              onComplete={() => complete(l.id)}
              onNext={() => goNext(i)}
              hasNext={i < lessons.length - 1}
              sound={sound}
              soundReady={soundReady}
              onToggleSound={() => setSound((s) => !s)}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
