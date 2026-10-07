"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { toggleWatchlist } from "@/lib/actions";
import { cn, formatINR } from "@/lib/format";
import type { Instrument } from "@/lib/types";
import { Change, InstrumentLogo } from "../ui/primitives";

export function WatchButton({ id, className }: { id: string; className?: string }) {
  const { state, update } = useAppStore();
  const on = state.watchlist.includes(id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        update((s) => toggleWatchlist(s, id));
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from watchlist" : "Add to watchlist"}
      className={cn("press grid size-9 place-items-center rounded-full hover:bg-line-2", className)}
    >
      <Heart className={cn("size-[18px]", on ? "animate-pop fill-[#ff4d6d] text-[#ff4d6d]" : "text-subtle")} />
    </button>
  );
}

const riskDot = { low: "bg-brand", moderate: "bg-[#f5a524]", high: "bg-down" } as const;

/** Compact investment row: name, one short insight, risk, price and today's move. Details on tap. */
export function InvestmentCard({ item }: { item: Instrument }) {
  return (
    <Link href={`/explore/${item.id}`} className="lift press flex items-center gap-3 rounded-2xl border border-hairline bg-white p-4">
      <InstrumentLogo name={item.name} color={item.logoColor} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{item.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
          <span className={cn("size-1.5 shrink-0 rounded-full", riskDot[item.risk])} aria-hidden />
          <span className="shrink-0">{item.risk[0].toUpperCase() + item.risk.slice(1)} risk</span>
          <span className="truncate">· {item.descriptor}</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[15px] font-semibold tabular">{formatINR(item.price, { decimals: true })}</p>
        <Change value={item.changePct} className="text-xs" />
      </div>
      <WatchButton id={item.id} className="-mr-1 shrink-0" />
    </Link>
  );
}
