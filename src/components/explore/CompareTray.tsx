"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { getInstrument } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { toggleCompare } from "@/lib/actions";
import { buttonClass } from "../ui/Button";
import { InstrumentLogo } from "../ui/primitives";

/** Floating tray that appears once something is added to compare. */
export function CompareTray() {
  const { state, update } = useAppStore();
  if (state.compare.length === 0) return null;
  const items = state.compare.map((id) => getInstrument(id)).filter((i) => i !== undefined);
  return (
    <div className="fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 animate-sheet-up">
      <div className="flex items-center gap-3 rounded-2xl bg-ink p-3 text-white shadow-[var(--shadow-lift)]">
        <div className="flex -space-x-2">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => update((s) => toggleCompare(s, i.id))}
              className="group relative rounded-xl ring-2 ring-ink"
              aria-label={`Remove ${i.name} from compare`}
            >
              <InstrumentLogo name={i.name} color={i.logoColor} size={34} />
              <span className="absolute -right-1 -top-1 hidden size-4 place-items-center rounded-full bg-white text-ink group-hover:grid">
                <X className="size-3" />
              </span>
            </button>
          ))}
        </div>
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-bold">{items.length} selected</span>
          <span className="block text-xs text-white/60">{items.length < 2 ? "Add one more to compare" : "Up to 3 side by side"}</span>
        </p>
        <Link
          href={`/compare`}
          aria-disabled={items.length < 2}
          className={buttonClass({ size: "sm", className: items.length < 2 ? "pointer-events-none opacity-50" : "" })}
        >
          Compare <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
