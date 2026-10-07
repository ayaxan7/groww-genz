"use client";

import Link from "next/link";
import { useState } from "react";
import { AreaChart } from "@/components/charts/AreaChart";
import { Donut } from "@/components/charts/Donut";
import { MobileHeader } from "@/components/layout/TopBar";
import { ExplainLink } from "@/components/learn/ExplainLink";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { Art } from "@/components/ui/Art";
import { ButtonLink } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/primitives";
import { Segmented } from "@/components/ui/Tabs";
import { getInstrument, typeLabel } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { usePortfolio } from "@/hooks/usePortfolio";
import { cn, formatINR, formatPct } from "@/lib/format";
import { buildSeries, type Range } from "@/lib/series";

type ChartRange = "1M" | "6M" | "1Y" | "All";
type View = "own" | "allocation";

// map the visible ranges onto the mock series generator
const rangeConfig: Record<ChartRange, { key: Range; share: number }> = {
  "1M": { key: "1M", share: 1 / 6 },
  "6M": { key: "1Y", share: 0.6 },
  "1Y": { key: "1Y", share: 1 },
  All: { key: "5Y", share: 1 },
};

export default function PortfolioPage() {
  const { state } = useAppStore();
  const p = usePortfolio();
  const [range, setRange] = useState<ChartRange>("1Y");
  const [view, setView] = useState<View>("own");

  if (p.isEmpty) {
    return (
      <>
        <MobileHeader title="Your money" />
        <div className="flex flex-col items-center px-6 pb-10 pt-8 text-center">
          <Art name="char-saving" className="h-48 w-auto" />
          <h2 className="mt-4 text-xl font-extrabold">Your portfolio will appear here after your first investment.</h2>
          <p className="mt-2 text-sm text-muted">Start with as little as ₹100. We&apos;ll guide you step by step.</p>
          <ButtonLink href="/explore" className="mt-6">
            Explore investments
          </ButtonLink>
        </div>
      </>
    );
  }

  const cfg = rangeConfig[range];
  const seriesKey = p.rows.map((r) => r.instrumentId).join("-");
  const points = buildSeries(`pf-${seriesKey}-${range}`, p.current, p.returnsPct * cfg.share, cfg.key, 0.8);

  const typeColors = { stock: "#5367FF", mf: "#00D09C", etf: "#FFB547" } as const;
  const byType = (["stock", "mf", "etf"] as const)
    .map((t) => ({ label: `${typeLabel[t]}s`, value: p.rows.filter((r) => r.instrument.type === t).reduce((a, r) => a + r.current, 0), color: typeColors[t] }))
    .filter((s) => s.value > 0);

  return (
    <>
      <MobileHeader title="Your money" />
      <div className="space-y-6 px-5 pb-8 pt-4">
        <PortfolioSummary current={p.current} returns={p.returns} returnsPct={p.returnsPct} today={p.today} />

        <section>
          <AreaChart points={points} height={150} positive={p.returns >= 0} />
          <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Chart range">
            {(["1M", "6M", "1Y", "All"] as const).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn("press flex-1 rounded-full py-1.5 text-xs font-bold", range === r ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-line-2")}
              >
                {r}
              </button>
            ))}
          </div>
          <ExplainLink concept="returns" label={`Not sure what ${formatPct(p.returnsPct)} means?`} cta="Learn" className="mt-4" />
        </section>

        <Segmented<View>
          value={view}
          onChange={setView}
          items={[
            { value: "own", label: "What you own" },
            { value: "allocation", label: "Allocation" },
          ]}
        />

        {view === "own" ? (
          <HoldingsTable rows={p.rows} total={p.current} />
        ) : (
          <div className="animate-fade-in space-y-4">
            <section className="rounded-3xl bg-white p-5 ring-1 ring-hairline">
              <SectionTitle title="Where your money is invested" />
              <Donut slices={byType} size={110} stroke={18} />
            </section>
            <section className="rounded-3xl bg-white p-5 ring-1 ring-hairline">
              <SectionTitle title="Monthly SIPs" />
              {state.sips.length === 0 ? (
                <p className="text-sm text-muted">
                  None yet.{" "}
                  <Link href="/invest" className="font-semibold text-brand-700">
                    Start one from ₹100
                  </Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {state.sips.map((s) => {
                    const goal = state.goals.find((g) => g.id === s.goalId);
                    return (
                      <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{getInstrument(s.instrumentId)?.name}</span>
                          <span className="block text-xs text-muted">{goal ? `For ${goal.name}` : "Monthly"}</span>
                        </span>
                        <span className="font-semibold tabular">{formatINR(s.amount)}/mo</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
            <section className="rounded-3xl bg-white p-5 ring-1 ring-hairline">
              <SectionTitle title="Recent activity" />
              {state.transactions.length === 0 ? (
                <p className="text-sm text-muted">Sample holdings are pre-loaded. Your demo investments will show here.</p>
              ) : (
                <ul className="space-y-3">
                  {state.transactions.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{getInstrument(t.instrumentId)?.name}</span>
                        <span className="block text-xs text-muted">
                          {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                          {t.frequency === "monthly" ? "SIP" : "One-time"} · Demo
                        </span>
                      </span>
                      <span className="font-semibold tabular">{formatINR(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
