"use client";

import { useCallback } from "react";
import type { CompletionResult } from "@/components/learn/CompletionOverlay";
import { lessons } from "@/data/lessons";
import { completeLesson, effectiveLearningStreak, isLearningMilestone } from "@/lib/actions";
import { useAppStore } from "./useAppStore";

/** Marks a lesson complete (once) and reports what changed for the celebration UI. */
export function useLessonCompletion() {
  const { getState, update } = useAppStore();
  return useCallback(
    (lessonId: string): CompletionResult => {
      const r = completeLesson(getState(), lessonId);
      if (r.firstTime) update(() => r.state);
      const learnedCount = r.state.learning.completed.length;
      return {
        firstTime: r.firstTime,
        streakUp: r.streakUp,
        streak: effectiveLearningStreak(r.state.learning),
        celebrate: r.firstTime && isLearningMilestone(learnedCount, lessons.length, r.streakUp),
        learnedCount,
      };
    },
    [getState, update],
  );
}
