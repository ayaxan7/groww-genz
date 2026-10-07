"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { buildSeries, rangeChange, ranges, type Range } from "@/lib/series";
import type { Instrument } from "@/lib/types";
import { Change } from "../ui/primitives";
import { AreaChart } from "./AreaChart";

const rangeLabel: Record<Range, string> = { "1D": "today", "1W": "past week", "1M": "past month", "1Y": "past year", "5Y": "past 5 years" };

export function StockChart({ instrument, height = 220 }: { instrument: Instrument; height?: number }) {
  const [range, setRange] = useState<Range>("1D");
  const change = rangeChange(range, instrument.changePct, instrument.returns);
  const points = buildSeries(instrument.id, instrument.price, change, range, instrument.risk === "high" ? 1.8 : 1);

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        {range === "1D" ? (
          "Intraday"
        ) : (
          <>
            <Change value={change} /> {rangeLabel[range]}
          </>
        )}{" "}
        <span className="text-subtle">· illustrative mock data</span>
      </p>
      <AreaChart points={points} height={height} positive={change >= 0} />
      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Chart range">
        {ranges.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={r === range}
            onClick={() => setRange(r)}
            className={cn("press rounded-lg px-3 py-1.5 text-xs font-bold", r === range ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-line-2")}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
