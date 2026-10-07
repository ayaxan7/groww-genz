"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, TrendingUp } from "lucide-react";
import { AmountPicker } from "@/components/invest/AmountPicker";
import { FlowFooter, FlowHeader } from "@/components/invest/FlowHeader";
import { useDraftGuard } from "@/components/invest/useDraftGuard";
import { ExplainLink } from "@/components/learn/ExplainLink";
import { Button } from "@/components/ui/Button";
import { Card, Change, DemoNote, InstrumentLogo } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/ui/states";
import { Segmented } from "@/components/ui/Tabs";
import { typeLabel } from "@/data/instruments";
import { goalOptions, horizonOptions, labelOf, riskOptions } from "@/data/profileOptions";
import { useAppStore } from "@/hooks/useAppStore";
import { updateDraft } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { project } from "@/lib/projection";
import type { Frequency } from "@/lib/types";

export default function InvestmentAmountPage() {
  const guard = useDraftGuard();
  const { state, update } = useAppStore();
  const router = useRouter();
  if (!guard) return <PageSkeleton />;
  const { draft: d, instrument: inst } = guard;

  const min = Math.max(100, inst.minAmount);
  const tooLow = d.amount < min;
  const units = d.amount / inst.price;
  const proj = project(d.amount, d.frequency, d.horizon, d.risk);
  const set = (patch: Parameters<typeof updateDraft>[1]) => update((s) => updateDraft(s, patch));
  const goal = state.goals.find((g) => g.id === d.goalId);

  return (
    <>
      <FlowHeader title="Investment amount" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 pb-32 pt-6">
        <Card className="flex items-center gap-3 p-4">
          <InstrumentLogo name={inst.name} color={inst.logoColor} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{inst.name}</p>
            <p className="text-xs text-muted">
              {typeLabel[inst.type]} · {inst.category}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tabular">{formatINR(inst.price, { decimals: true })}</p>
            <Change value={inst.changePct} className="text-xs" />
          </div>
        </Card>

        <Card className="p-5">
          <Segmented<Frequency>
            value={d.frequency}
            onChange={(frequency) => set({ frequency })}
            items={[
              { value: "monthly", label: "Monthly SIP" },
              { value: "one-time", label: "One-time" },
            ]}
          />
          <p className="mb-3 mt-5 text-sm font-semibold text-ink-2">Amount</p>
          <AmountPicker key={min} value={d.amount} onChange={(amount) => set({ amount })} min={min} />
          <p className="mt-3 text-sm text-muted">
            {inst.type === "mf"
              ? `≈ ${units.toFixed(2)} units at today's NAV. Funds accept any amount from ₹100.`
              : `${inst.type === "etf" ? "ETF units" : "Shares"} are bought whole: ${formatINR(d.amount)} buys about ${Math.floor(units)} at ${formatINR(inst.price)} each.`}
          </p>
          {tooLow && (
            <p className="mt-2 text-sm font-medium text-down">
              One unit costs {formatINR(inst.price)}. Increase the amount, or pick a fund that starts at ₹100.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-sm font-bold">Your plan</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted">Amount</dt>
              <dd className="font-bold tabular">
                {formatINR(d.amount)}
                {d.frequency === "monthly" && <span className="font-medium text-muted">/mo</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Risk</dt>
              <dd className="font-bold">{labelOf(riskOptions, d.risk)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Timeline</dt>
              <dd className="font-bold">{labelOf(horizonOptions, d.horizon)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Goal</dt>
              <dd className="font-bold">{goal?.name ?? labelOf(goalOptions, d.goalType)}</dd>
            </div>
          </dl>
          <label className="mt-4 block">
            <span className="text-xs font-semibold text-muted">Count this towards</span>
            <span className="relative mt-1 block">
              <select
                value={d.goalId ?? ""}
                onChange={(e) => set({ goalId: e.target.value || null })}
                className="h-11 w-full appearance-none rounded-xl border border-line bg-white px-3 pr-9 text-sm font-semibold outline-none focus:border-brand"
              >
                {state.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({formatINR(g.saved)} of {formatINR(g.target)})
                  </option>
                ))}
                <option value="">{state.goals.length ? "Not linked to a goal" : "No goals yet. Create one on the Goals page"}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            </span>
          </label>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-bold">
            <TrendingUp className="size-4 text-brand-700" /> Illustrative projection
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-canvas p-3">
              <p className="text-xs text-muted">You invest</p>
              <p className="text-lg font-extrabold tabular">{formatINR(proj.invested)}</p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3">
              <p className="text-xs text-muted">Could grow to</p>
              <p className="text-lg font-extrabold text-brand-700 tabular">{formatINR(proj.value)}</p>
            </div>
          </div>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-line-2" aria-hidden>
            <span className="bg-ink/70" style={{ width: `${(proj.invested / proj.value) * 100}%` }} />
            <span className="flex-1 bg-brand" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Example only: assumes a steady {Math.round(proj.rate * 100)}% a year over {proj.years} year{proj.years > 1 ? "s" : ""}. Real returns go up and down
            and are not guaranteed.
          </p>
          <ExplainLink concept="compounding" label="How does growth work?" cta="See it" className="mt-3" />
        </Card>

        <Link href={`/invest?from=${inst.id}`} className="block rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2 hover:border-brand">
          <strong>Not sure where to start?</strong> Answer 4 quick questions and we&apos;ll explain the main options in plain English.{" "}
          <span className="font-semibold text-brand-700">Get guided help →</span>
        </Link>

        <DemoNote>This is a prototype. Nothing is bought and no money moves.</DemoNote>
      </div>
      <FlowFooter>
        <Button size="lg" full disabled={tooLow} onClick={() => router.push("/invest/review")}>
          Review investment <ArrowRight className="size-4" />
        </Button>
      </FlowFooter>
    </>
  );
}
