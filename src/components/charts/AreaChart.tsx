"use client";

import { useId, useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { toPath } from "./path";

/**
 * Simple responsive area chart with a hover/touch crosshair.
 * Deliberately minimal: no axes clutter, just the shape of the movement.
 */
export function AreaChart({
  points,
  height = 200,
  positive = true,
  labels,
  className,
}: {
  points: number[];
  height?: number;
  positive?: boolean;
  labels?: string[];
  className?: string;
}) {
  const id = useId();
  const W = 600;
  const [hover, setHover] = useState<number | null>(null);
  const color = positive ? "var(--color-up)" : "var(--color-down)";
  const line = useMemo(() => toPath(points, W, height, 8), [points, height]);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const yOf = (p: number) => 8 + (1 - (p - min) / span) * (height - 16);

  const onMove = (clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * (points.length - 1);
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(x))));
  };

  const hx = hover !== null ? (hover / (points.length - 1)) * W : 0;

  return (
    <div className={className}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${height}`}
          preserveAspectRatio="none"
          className="block w-full touch-pan-y"
          style={{ height }}
          onMouseMove={(e) => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
          onMouseLeave={() => setHover(null)}
          onTouchMove={(e) => onMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          onTouchEnd={() => setHover(null)}
          role="img"
          aria-label={`Chart from ${formatINR(points[0])} to ${formatINR(points[points.length - 1])}`}
        >
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L${W} ${height} L0 ${height} Z`} fill={`url(#${id})`} />
          <path d={line} fill="none" stroke={color} strokeWidth={2.2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {hover !== null && (
            <>
              <line x1={hx} x2={hx} y1={0} y2={height} stroke="var(--color-subtle)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
              <circle cx={hx} cy={yOf(points[hover])} r={4} fill={color} vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-2 rounded-lg bg-ink px-2 py-1 text-xs font-semibold text-white tabular"
            style={{ left: `clamp(0px, calc(${(hover / (points.length - 1)) * 100}% - 36px), calc(100% - 80px))` }}
          >
            {formatINR(points[hover], { decimals: points[hover] < 1000 })}
          </div>
        )}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-[11px] text-subtle">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
