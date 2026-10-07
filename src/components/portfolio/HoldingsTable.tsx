"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { typeLabel } from "@/data/instruments";
import type { HoldingRow } from "@/hooks/usePortfolio";
import { cn, formatINR, formatSigned } from "@/lib/format";
import { Change, InstrumentLogo } from "../ui/primitives";

type SortKey = "value" | "pl" | "name";

const sorters: Record<SortKey, (a: HoldingRow, b: HoldingRow) => number> = {
  value: (a, b) => b.current - a.current,
  pl: (a, b) => b.pl - a.pl,
  name: (a, b) => a.instrument.name.localeCompare(b.instrument.name),
};

export function HoldingsTable({ rows, total }: { rows: HoldingRow[]; total: number }) {
  const [sort, setSort] = useState<SortKey>("value");
  const sorted = [...rows].sort(sorters[sort]);

  return (
    <div className="animate-fade-in">
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-1 rounded-xl bg-line-2 p-1" role="radiogroup" aria-label="Sort holdings">
          <ArrowDownUp className="mx-1 size-3.5 text-muted" aria-hidden />
          {(
            [
              ["value", "Value"],
              ["pl", "Gain"],
              ["name", "Name"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              role="radio"
              aria-checked={sort === k}
              onClick={() => setSort(k)}
              className={cn("press rounded-lg px-2.5 py-1 text-xs font-semibold", sort === k ? "bg-white shadow-[var(--shadow-card)]" : "text-muted")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-hairline rounded-3xl bg-white ring-1 ring-hairline">
        {sorted.map((r) => (
          <li key={r.instrumentId}>
            <Link href={`/explore/${r.instrumentId}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas">
              <InstrumentLogo name={r.instrument.name} color={r.instrument.logoColor} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{r.instrument.name}</p>
                <p className="text-xs text-muted">
                  {typeLabel[r.instrument.type]} · {((r.current / total) * 100).toFixed(0)}% of total
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular">{formatINR(r.current)}</p>
                <p className={cn("text-xs font-semibold tabular", r.pl >= 0 ? "text-up" : "text-down")}>
                  {formatSigned(r.pl)} <Change value={r.plPct} className="text-xs" />
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
