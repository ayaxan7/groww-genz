"use client";

import { cn, formatINR, formatSigned } from "@/lib/format";
import { CountUpINR } from "../ui/CountUp";
import { Change } from "../ui/primitives";

interface Props {
  current: number;
  returns: number;
  returnsPct: number;
  today: number;
}

/** Total value and overall return first; today's move as a quiet footnote. */
export function PortfolioSummary({ current, returns, returnsPct, today }: Props) {
  return (
    <section>
      <p className="text-sm text-muted">Total value</p>
      <p className="mt-1 text-[36px] font-extrabold leading-none">
        <CountUpINR value={current} />
      </p>
      <p className="mt-2 text-sm">
        <span className={cn("font-semibold tabular", returns >= 0 ? "text-up" : "text-down")}>{formatSigned(returns)}</span>{" "}
        <Change value={returnsPct} className="text-sm" /> <span className="text-muted">overall</span>
      </p>
      <p className="mt-1 text-xs text-subtle">
        Today {formatSigned(today)} · <span className="tabular">{formatINR(current - returns)}</span> invested
      </p>
    </section>
  );
}
