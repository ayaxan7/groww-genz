"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Animates from the previous value to `target`. Respects prefers-reduced-motion. */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const first = useRef(true);

  useEffect(() => {
    const start = first.current ? target * 0.85 : from.current;
    first.current = false;
    if (prefersReducedMotion() || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(start + (target - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target, duration]);

  return value;
}
