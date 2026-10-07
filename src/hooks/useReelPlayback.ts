"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lesson } from "@/data/lessons";

/**
 * Drives a reel like a short video on loop: captions advance on a timer (≈30s total) and can be
 * skipped by tapping. When the last caption ends the reel immediately starts again. `onComplete`
 * fires once per viewing (the first time it reaches the end after becoming active), and a reel
 * always starts from the beginning when it scrolls into view.
 *
 * Only discrete events (next caption, pause, loop) touch React state. Progress bars are CSS
 * animations of `segMs` that pause with `running`, so playback never floods React with
 * per-frame updates (which previously starved navigation and button taps).
 */
export function useReelPlayback(lesson: Lesson, active: boolean, onComplete: () => void, sound: boolean) {
  const count = lesson.segments.length;
  const segMs = (lesson.durationSec * 1000) / count;
  const [segment, setSegment] = useState(0);
  const [paused, setPaused] = useState(false);
  const [runId, setRunId] = useState(0); // bumps on every (re)start so animations restart
  const remaining = useRef(segMs);
  const completeRef = useRef(onComplete);
  const firedRef = useRef(false);
  const running = active && !paused;

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const restart = useCallback(() => {
    setPaused(false);
    setSegment(0);
    setRunId((r) => r + 1);
  }, []);

  /** Reaching the end: count it once for this viewing, then loop back to the start. */
  const finish = useCallback(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      completeRef.current();
    }
    setSegment(0);
    setRunId((r) => r + 1);
  }, []);

  const next = useCallback(() => {
    if (segment >= count - 1) finish();
    else setSegment(segment + 1);
  }, [segment, count, finish]);

  const prev = useCallback(() => setSegment((s) => Math.max(0, s - 1)), []);

  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  // every time the reel comes into view it plays from the beginning
  useEffect(() => {
    if (!active) return;
    firedRef.current = false;
    /* eslint-disable react-hooks/set-state-in-effect -- reset playback when the reel becomes active */
    setPaused(false);
    setSegment(0);
    setRunId((r) => r + 1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [active]);

  // a new caption always starts with its full duration
  useEffect(() => {
    remaining.current = segMs;
  }, [segment, runId, segMs]);

  // one timeout per caption; pausing banks the time left
  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const t = setTimeout(() => nextRef.current(), remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt));
    };
  }, [running, segment, runId]);

  // narration via the browser's speech synthesis (on by default; the reel's sound button mutes it)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (!running || !sound) {
      if (active) synth.cancel();
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(lesson.segments[segment]);
    u.lang = "en-IN";
    u.rate = 1.05;
    synth.speak(u);
    return () => synth.cancel();
  }, [running, active, sound, segment, runId, lesson.segments]);

  return { segment, count, segMs, paused, setPaused, running, runKey: `${runId}-${segment}`, next, prev, restart };
}
