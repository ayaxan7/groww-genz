"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ChevronsRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

const KNOB = 52;

/** Mobile slide-to-confirm. The knob is also a button, so tap + keyboard still work. */
export function SwipeToConfirm({ label, onConfirm, loading }: { label: string; onConfirm: () => void; loading?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [x, setXState] = useState(0);
  const xRef = useRef(0); // latest position, so pointer-up never reads a stale render
  const setX = (v: number) => {
    xRef.current = v;
    setXState(v);
  };
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [travel, setTravel] = useState(300); // measured on drag start, used for the label fade

  const max = () => (track.current?.clientWidth ?? 300) - KNOB - 8;

  const finish = () => {
    setDone(true);
    setX(max());
    onConfirm();
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (done || loading) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX - xRef.current;
    setTravel(max());
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (startX.current === null) return;
    setX(Math.max(0, Math.min(max(), e.clientX - startX.current)));
  };
  const onUp = () => {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (xRef.current >= max() * 0.85) finish();
    else setX(0);
  };

  const progress = Math.min(1, x / Math.max(1, travel));

  return (
    <div ref={track} className="relative h-[60px] w-full select-none overflow-hidden rounded-2xl bg-brand-50 p-1" data-no-swipe>
      <div className="absolute inset-y-0 left-0 rounded-2xl bg-brand/25" style={{ width: x + KNOB + 4 }} aria-hidden />
      <span
        className="pointer-events-none absolute inset-0 grid place-items-center pl-10 text-[15px] font-bold text-brand-700 transition-opacity"
        style={{ opacity: done ? 0 : 1 - progress * 0.9 }}
      >
        {label}
      </span>
      {done && (
        <span className="pointer-events-none absolute inset-0 grid animate-fade-in place-items-center pr-12 text-[15px] font-bold text-brand-700">
          Confirming…
        </span>
      )}
      <button
        type="button"
        aria-label={label}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !done && finish()}
        className={cn(
          "relative z-10 grid touch-none place-items-center rounded-xl bg-brand text-white shadow-md",
          !dragging && "transition-transform duration-300 ease-out",
        )}
        style={{ width: KNOB, height: KNOB, transform: `translateX(${x}px)` }}
      >
        {loading || done ? <Loader2 className="size-5 animate-spin" /> : <ChevronsRight className="size-6" />}
      </button>
    </div>
  );
}
