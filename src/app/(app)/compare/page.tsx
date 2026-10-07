"use client";

import { ChevronDown, GitCompareArrows, Lightbulb, Plus } from "lucide-react";
import { compareSummary, ComparisonTable } from "@/components/explore/ComparisonTable";
import { MobileHeader } from "@/components/layout/TopBar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { getInstrument, instruments } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { MAX_COMPARE, toggleCompare } from "@/lib/actions";
import { popularInstruments } from "@/lib/personalise";
import type { Instrument } from "@/lib/types";

export default function ComparePage() {
  const { state, update } = useAppStore();
  const items = state.compare.map((id) => getInstrument(id)).filter((i): i is Instrument => !!i);
  // the same popular list for everyone (never ranked against the user's profile)
  const suggestions = popularInstruments(6)
    .filter((i) => !state.compare.includes(i.id))
    .slice(0, 4);
  const canAdd = items.length < MAX_COMPARE;
  const add = (id: string) => id && update((s) => toggleCompare(s, id));

  return (
    <>
      <MobileHeader title="Compare" back />
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="hidden text-[28px] font-extrabold tracking-tight">Compare</h1>
            <p className="text-sm text-muted">Line up 2–3 investments side by side, in plain English.</p>
          </div>
          {canAdd && (
            <label className="relative ml-auto w-full">
              <span className="sr-only">Add an investment to compare</span>
              <Plus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <select
                value=""
                onChange={(e) => add(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-line bg-white pl-9 pr-8 text-sm font-semibold outline-none focus:border-brand"
              >
                <option value="">
                  Add investment ({items.length}/{MAX_COMPARE})
                </option>
                {instruments
                  .filter((i) => !state.compare.includes(i.id))
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </label>
          )}
        </div>

        {items.length >= 2 ? (
          <>
            <ComparisonTable items={items} onRemove={(id) => update((s) => toggleCompare(s, id))} />
            <Card className="mt-5 p-5">
              <p className="flex items-center gap-2 text-[15px] font-bold">
                <Lightbulb className="size-4 text-[#f59e0b]" /> What this tells you
              </p>
              <ul className="mt-3 space-y-2">
                {compareSummary(items).map((t) => (
                  <li key={t} className="flex gap-2.5 text-sm text-ink-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">A comparison helps you understand differences. It isn&apos;t a recommendation to buy or sell.</p>
            </Card>
          </>
        ) : (
          <EmptyState
            icon={<GitCompareArrows className="size-6" />}
            title={items.length === 1 ? `Add one more to compare with ${items[0].name}` : "Pick at least two investments"}
            body="Compare price, risk, valuation and past returns side by side."
            action={<ButtonLink href="/explore">Browse investments</ButtonLink>}
          />
        )}

        {canAdd && suggestions.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold text-ink-2">Quick add: popular on the app</h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => add(s.id)}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-brand"
                >
                  <Plus className="size-3.5" /> {s.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
