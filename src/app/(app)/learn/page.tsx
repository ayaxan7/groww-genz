"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ReelFeed } from "@/components/learn/ReelFeed";
import { PageSkeleton } from "@/components/ui/states";
import { getLesson } from "@/data/lessons";
import { useAppStore } from "@/hooks/useAppStore";
import { learnFeed, type FeedItem } from "@/lib/personalise";

function LearnView() {
  const { state } = useAppStore();
  const params = useSearchParams();
  const requested = getLesson(params.get("lesson"));

  // Snapshot the level-based feed when Learn opens, so it doesn't reshuffle while you watch
  // (finishing a level re-levels the feed next time). A linked lesson outside your level
  // (e.g. from an "Explain simply" sheet) is placed first so the link always works.
  const [feed] = useState(() => {
    const f = learnFeed(state.profile, state.learning.completed);
    if (requested && !f.items.some((i) => i.lesson.id === requested.id)) {
      const tag: FeedItem["tag"] = requested.level > f.level ? "next" : requested.level < f.level ? "refresher" : "level";
      f.items.unshift({ lesson: requested, reason: "You opened this lesson", tag });
    }
    return f;
  });

  return <ReelFeed items={feed.items} initialId={requested?.id} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LearnView />
    </Suspense>
  );
}
