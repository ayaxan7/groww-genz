import { buildSeries } from "@/lib/series";
import { toPath } from "./path";

/** Tiny trend line for rows and summary cards (mock, deterministic). */
export function Sparkline({
  seed,
  end,
  changePct,
  width = 88,
  height = 30,
  fill,
}: {
  seed: string;
  end: number;
  changePct: number;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const d = toPath(buildSeries(seed, end, changePct, "1D"), width, height);
  const color = changePct >= 0 ? "var(--color-up)" : "var(--color-down)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0 overflow-visible">
      {fill && <path d={`${d} L${width} ${height} L0 ${height} Z`} fill={color} opacity={0.1} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
