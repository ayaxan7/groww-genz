"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, GitCompareArrows, Heart, Newspaper, SearchX, Sparkles } from "lucide-react";
import { getInstrument, typeLabel } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { MAX_COMPARE, startDraft, toggleCompare, toggleWatchlist } from "@/lib/actions";
import { cn, formatINR, formatPct } from "@/lib/format";
import { thingsToConsider } from "@/lib/personalise";
import type { Instrument } from "@/lib/types";
import { StockChart } from "../charts/StockChart";
import { ExplainLink } from "../learn/ExplainLink";
import { MobileHeader } from "../layout/TopBar";
import { Button, ButtonLink } from "../ui/Button";
import { Change, InstrumentLogo, Meter } from "../ui/primitives";
import { EmptyState } from "../ui/states";
import { UnderlineTabs } from "../ui/Tabs";
import { WatchButton } from "./InvestmentCard";

type Section = "overview" | "financials" | "news";

/** Text that shows a couple of lines first and expands on demand. */
function Expandable({ text, lines = 3 }: { text: string; lines?: 2 | 3 }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className={cn("text-sm leading-relaxed text-ink-2", !open && (lines === 2 ? "line-clamp-2" : "line-clamp-3"))}>{text}</p>
      {!open && text.length > 120 && (
        <button onClick={() => setOpen(true)} className="mt-1 text-sm font-semibold text-brand-700">
          Read more
        </button>
      )}
    </div>
  );
}

function Overview({ item }: { item: Instrument }) {
  const [allInsights, setAllInsights] = useState(false);
  const noun = item.type === "stock" ? "company" : item.type === "mf" ? "fund" : "ETF";
  const insights = allInsights ? item.insights : item.insights.slice(0, 2);
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-1.5 text-[15px] font-bold">What does this {noun} actually do?</h3>
        <Expandable text={item.about} />
      </section>
      <section>
        <h3 className="mb-1.5 text-[15px] font-bold">What&apos;s happening?</h3>
        <Expandable text={item.happening} lines={2} />
      </section>
      <section className="rounded-2xl bg-gradient-to-br from-[#e9fbf5] to-white p-4">
        <h3 className="text-[15px] font-bold">Things to consider</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{thingsToConsider(item)}</p>
      </section>
      <section>
        <h3 className="text-[15px] font-bold">Key numbers</h3>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-xs text-muted">{item.type === "stock" ? "P/E ratio" : "Expense ratio"}</p>
            <p className="mt-0.5 text-lg font-bold tabular">
              {item.financials.find((f) => f.label === (item.type === "stock" ? "P/E ratio" : "Expense ratio"))?.value}
            </p>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <p className="text-xs text-muted">1-year return</p>
            <p className={cn("mt-0.5 text-lg font-bold tabular", item.returns.y1 >= 0 ? "text-up" : "text-down")}>{formatPct(item.returns.y1, 0)}</p>
          </div>
        </div>
        <ExplainLink concept={item.type === "stock" ? "pe" : "expense"} className="mt-3" />
      </section>
      <section>
        <h3 className="text-[15px] font-bold">Key insights</h3>
        <ul className="mt-2 space-y-2">
          {insights.map((t) => (
            <li key={t} className="flex gap-2.5 text-sm text-ink-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              {t}
            </li>
          ))}
        </ul>
        {!allInsights && item.insights.length > 2 && (
          <button onClick={() => setAllInsights(true)} className="mt-2 text-sm font-semibold text-brand-700">
            See all {item.insights.length}
          </button>
        )}
      </section>
      <p className="rounded-xl bg-canvas p-3 text-xs leading-relaxed text-muted">
        For learning only. This isn&apos;t a recommendation to buy or sell; prices and figures are mock data. Do your own research.
      </p>
    </div>
  );
}

function Financials({ item }: { item: Instrument }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3">
        {item.financials.map((f) => (
          <div key={f.label} className="rounded-2xl bg-canvas p-4">
            <dt className="text-xs text-muted">{f.label}</dt>
            <dd className="mt-1 text-base font-bold tabular">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="text-[15px] font-bold">Past returns</h3>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {(
            [
              ["1 year", item.returns.y1],
              ["3 years", item.returns.y3],
              ["5 years", item.returns.y5],
            ] as const
          ).map(([l, v]) => (
            <div key={l} className="rounded-2xl border border-line p-3 text-center">
              <p className="text-xs text-muted">{l}</p>
              <p className={cn("mt-0.5 text-lg font-bold tabular", v >= 0 ? "text-up" : "text-down")}>{formatPct(v, 0)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Mock, illustrative figures. Past performance does not guarantee future returns.</p>
        <ExplainLink concept="compounding" label="How do returns add up over time?" cta="See it" className="mt-3" />
      </div>
    </div>
  );
}

function News({ item }: { item: Instrument }) {
  return (
    <ul className="space-y-2.5">
      {item.news.map((n) => (
        <li key={n.title} className="flex gap-3 rounded-2xl border border-line p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas">
            <Newspaper className="size-4 text-muted" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-snug">{n.title}</p>
            <p className="mt-1 text-xs text-muted">
              {n.source} · {n.ago} ago
            </p>
          </div>
        </li>
      ))}
      <li className="text-xs text-muted">Sample headlines for the prototype.</li>
    </ul>
  );
}

export function InstrumentDetail({ id }: { id: string }) {
  const item = getInstrument(id);
  const router = useRouter();
  const { state, update } = useAppStore();
  const [section, setSection] = useState<Section>("overview");

  if (!item) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="We couldn't find that investment"
          body="It may have been removed from the demo catalogue."
          action={<ButtonLink href="/explore">Back to Explore</ButtonLink>}
        />
      </div>
    );
  }

  const inCompare = state.compare.includes(item.id);
  const compareFull = !inCompare && state.compare.length >= MAX_COMPARE;

  const invest = () => {
    update((s) => startDraft(s, { instrumentId: item.id }));
    // the profile already knows goal, amount, horizon and risk, so skip the guided questions
    router.push("/invest/amount");
  };

  const compare = () => {
    if (!inCompare) update((s) => toggleCompare(s, item.id));
    router.push("/compare");
  };

  const watching = state.watchlist.includes(item.id);

  return (
    <>
      <MobileHeader
        title=""
        back
        right={
          <>
            <button
              onClick={compare}
              disabled={compareFull}
              className="press grid size-10 place-items-center rounded-full text-ink-2 hover:bg-line-2 disabled:opacity-40"
              aria-label={inCompare ? "View compare" : "Add to compare"}
            >
              <GitCompareArrows className="size-5" />
            </button>
            <WatchButton id={item.id} className="size-10" />
          </>
        }
      />
      <div className="space-y-6 px-5 pb-8 pt-2">
        <section>
          <div className="flex items-center gap-3">
            <InstrumentLogo name={item.name} color={item.logoColor} size={44} />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold leading-tight">{item.name}</h1>
              <p className="truncate text-xs text-muted">
                {item.type === "stock" ? item.ticker : typeLabel[item.type]} · {item.category}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[34px] font-extrabold leading-none tabular">{formatINR(item.price, { decimals: true })}</p>
          <p className="mt-1.5 text-sm">
            <Change value={item.changePct} /> <span className="text-muted">today</span>
          </p>
          <div className="mt-4">
            <StockChart instrument={item} height={180} />
          </div>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={() => update((s) => toggleWatchlist(s, item.id))} className="flex-1" aria-pressed={watching}>
              <Heart className={watching ? "size-4 fill-[#ff4d6d] text-[#ff4d6d]" : "size-4"} /> {watching ? "Watching" : "Watchlist"}
            </Button>
            <Button onClick={invest} className="flex-1">
              Invest <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-amber-soft/60 p-3">
              <Meter label="Risk" steps={["low", "moderate", "high"] as const} value={item.risk} />
            </div>
            <div className="rounded-2xl bg-sky-soft/70 p-3">
              <Meter label="Valuation" steps={["cheap", "usual", "pricey"] as const} value={item.valuation} />
            </div>
          </div>
          <ExplainLink concept="valuation" label="What do these mean?" className="mt-3" />
        </section>

        <section>
          <UnderlineTabs
            value={section}
            onChange={setSection}
            items={[
              { value: "overview", label: "Overview" },
              { value: "financials", label: "Financials" },
              { value: "news", label: "News" },
            ]}
          />
          <div className="mt-5 animate-fade-in" key={section}>
            {section === "overview" && <Overview item={item} />}
            {section === "financials" && <Financials item={item} />}
            {section === "news" && <News item={item} />}
          </div>
        </section>

        {state.learning.completed.length < 2 && (
          <Link
            href={item.type === "etf" ? "/learn?lesson=etf" : item.type === "mf" ? "/learn?lesson=sip" : "/learn?lesson=diversification"}
            className="flex items-center gap-2 text-sm text-muted hover:text-ink"
          >
            <Sparkles className="size-4 text-brand-700" /> New to this? <span className="font-semibold text-brand-700">Watch a 30-sec reel →</span>
          </Link>
        )}
      </div>
    </>
  );
}
