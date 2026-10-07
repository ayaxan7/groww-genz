"use client";

import { useRef, type TouchEvent } from "react";

/**
 * Horizontal swipe detection for touch input (mouse clicks are unaffected).
 * Touches that start on inputs, horizontally
 * scrollable areas or anything marked `data-no-swipe` are ignored.
 */
export function useSwipe({ onLeft, onRight, threshold = 60 }: { onLeft?: () => void; onRight?: () => void; threshold?: number }) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);

  return {
    onTouchStart: (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [data-no-swipe], [role=tablist]")) {
        start.current = null;
        return;
      }
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() };
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Date.now() - s.t > 700 || Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) onLeft?.();
      else onRight?.();
    },
  };
}
