"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { typeLabel } from "@/data/instruments";
import { cn, formatINR, formatPct } from "@/lib/format";
import type { Instrument } from "@/lib/types";
import { Change, InstrumentLogo, RiskBadge, ValuationBadge } from "../ui/primitives";

const ret = (v: number) => <span className={cn("font-bold tabular", v >= 0 ? "text-up" : "text-down")}>{formatPct(v, 0)}</span>;

const rows: { label: string; render: (i: Instrument) => ReactNode }[] = [
  { label: "Price", render: (i) => <span className="font-bold tabular">{formatINR(i.price, { decimals: true })}</span> },
  { label: "Today", render: (i) => <Change value={i.changePct} /> },
  {
    label: "Category",
    render: (i) => (
      <span className="text-ink-2">
        {typeLabel[i.type]} · {i.category.split("·").pop()?.trim()}
      </span>
    ),
  },
  { label: "Risk", render: (i) => <RiskBadge risk={i.risk} short /> },
  { label: "Valuation", render: (i) => <ValuationBadge value={i.valuation} /> },
  { label: "1Y return", render: (i) => ret(i.returns.y1) },
  { label: "5Y return", render: (i) => ret(i.returns.y5) },
  { label: "Start with", render: (i) => <span className="font-semibold tabular">{formatINR(Math.max(100, i.minAmount))}</span> },
  {
    label: "Key insights",
    render: (i) => (
      <ul className="space-y-1.5 text-xs leading-relaxed text-ink-2">
        {i.insights.slice(0, 2).map((t) => (
          <li key={t} className="flex gap-1.5">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
            {t}
          </li>
        ))}
      </ul>
    ),
  },
];

export function ComparisonTable({ items, onRemove }: { items: Instrument[]; onRemove: (id: string) => void }) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[560px] border-separate border-spacing-0 rounded-2xl border border-line bg-white text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-28 rounded-tl-2xl bg-white p-4 text-left align-bottom text-xs font-semibold text-muted">Compare</th>
            {items.map((i) => (
              <th key={i.id} className="p-4 text-left align-top font-normal">
                <div className="flex items-start gap-2">
                  <InstrumentLogo name={i.name} color={i.logoColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/explore/${i.id}`} className="line-clamp-2 text-sm font-bold hover:text-brand-700">
                      {i.name}
                    </Link>
                    <p className="text-xs text-muted">{i.type === "stock" ? i.ticker : typeLabel[i.type]}</p>
                  </div>
                  <button
                    onClick={() => onRemove(i.id)}
                    className="press grid size-7 shrink-0 place-items-center rounded-full hover:bg-line-2"
                    aria-label={`Remove ${i.name}`}
                  >
                    <X className="size-4 text-muted" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="sticky left-0 z-10 border-t border-line bg-white p-4 text-left align-top text-xs font-semibold text-muted">
                {r.label}
              </th>
              {items.map((i) => (
                <td key={i.id} className="border-t border-line p-4 align-top">
                  {r.render(i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Plain-English takeaways from the comparison. */
export function compareSummary(items: Instrument[]): string[] {
  if (items.length < 2) return [];
  const order = { low: 0, moderate: 1, high: 2 };
  const safest = [...items].sort((a, b) => order[a.risk] - order[b.risk])[0];
  const best5 = [...items].sort((a, b) => b.returns.y5 - a.returns.y5)[0];
  const cheapest = [...items].sort((a, b) => Math.max(100, a.minAmount) - Math.max(100, b.minAmount))[0];
  return [
    `${safest.name} has the lowest risk of the ${items.length}.`,
    `${best5.name} had the highest 5-year return (${formatPct(best5.returns.y5, 0)}) in this mock data, but past returns aren't a promise.`,
    `${cheapest.name} is the easiest to start with, from ${formatINR(Math.max(100, cheapest.minAmount))}.`,
  ];
}
