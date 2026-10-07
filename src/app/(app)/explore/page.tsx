"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ChevronDown, PlayCircle, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { CompareTray } from "@/components/explore/CompareTray";
import { InvestmentCard } from "@/components/explore/InvestmentCard";
import { MarketStrip } from "@/components/explore/MarketStrip";
import { MobileHeader } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Art } from "@/components/ui/Art";
import { EmptyState, PageSkeleton } from "@/components/ui/states";
import { PillTabs } from "@/components/ui/Tabs";
import { instruments } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";
import { useSwipe } from "@/hooks/useSwipe";
import { cn } from "@/lib/format";
import { exploreDiscoveries, popularInstruments } from "@/lib/personalise";
import type { Instrument, Risk } from "@/lib/types";

type Tab = "foryou" | "stocks" | "mf" | "etf" | "sip" | "watchlist";
type Sort = "popular" | "gainers" | "losers" | "price";
const TABS: Tab[] = ["foryou", "stocks", "mf", "etf", "sip", "watchlist"];

const sorters: Record<Sort, (a: Instrument, b: Instrument) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  gainers: (a, b) => b.changePct - a.changePct,
  losers: (a, b) => a.changePct - b.changePct,
  price: (a, b) => a.price - b.price,
};

function ExploreView() {
  const { state } = useAppStore();
  const profile = state.profile!;
  const params = useSearchParams();
  const initialTab = (TABS as string[]).includes(params.get("tab") ?? "") ? (params.get("tab") as Tab) : params.get("q") ? "stocks" : "foryou";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [risk, setRisk] = useState<Risk | "all">("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // react to new ?tab / ?q links while this page is kept alive between navigations
  const tabParam = params.get("tab");
  const qParam = params.get("q");
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- sync local UI state with the URL */
    if (tabParam && (TABS as string[]).includes(tabParam)) setTab(tabParam as Tab);
    if (qParam !== null) setQuery(qParam);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [tabParam, qParam]);

  const changeTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, "", `/explore?tab=${t}`);
  };

  // mobile: swipe the results sideways to move between categories
  const shiftTab = (by: number) => {
    const i = TABS.indexOf(tab) + by;
    if (i >= 0 && i < TABS.length) changeTab(TABS[i]);
  };
  const swipe = useSwipe({ onLeft: () => shiftTab(1), onRight: () => shiftTab(-1) });

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base: Instrument[];
    if (q)
      base = instruments; // search spans every category
    else if (tab === "foryou")
      base = popularInstruments(10); // same for everyone: not a recommendation
    else if (tab === "stocks") base = instruments.filter((i) => i.type === "stock");
    else if (tab === "mf") base = instruments.filter((i) => i.type === "mf");
    else if (tab === "etf") base = instruments.filter((i) => i.type === "etf");
    else if (tab === "sip") base = instruments.filter((i) => i.type === "mf" && i.sipEligible);
    else base = state.watchlist.map((id) => instruments.find((i) => i.id === id)).filter((i): i is Instrument => !!i);

    let out = base.filter((i) => (risk === "all" || i.risk === risk) && (!q || `${i.name} ${i.ticker} ${i.category}`.toLowerCase().includes(q)));
    if (tab !== "foryou" || q || sort !== "popular") out = [...out].sort(sorters[sort]);
    return out;
  }, [tab, query, risk, sort, state.watchlist]);

  const searching = query.trim().length > 0;

  return (
    <>
      <MobileHeader title="Explore" />
      <div className="px-5 pb-6 pt-4">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks, funds, ETFs"
              aria-label="Search investments"
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-line-2"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <PillTabs
          value={tab}
          onChange={changeTab}
          items={[
            { value: "foryou", label: "Popular" },
            { value: "stocks", label: "Stocks" },
            { value: "mf", label: "Mutual Funds" },
            { value: "etf", label: "ETFs" },
            { value: "sip", label: "SIPs" },
            { value: "watchlist", label: "Watchlist", count: state.watchlist.length },
          ]}
        />

        {tab === "foryou" && !searching && (
          <section className="mt-6" aria-label="What's worth knowing today">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">What&apos;s worth knowing today?</h2>
              <Link href="/learn" className="text-sm font-semibold text-brand-700">
                See all
              </Link>
            </div>
            <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1" data-no-swipe>
              {exploreDiscoveries(profile).map((d, i) => (
                <Link
                  key={d.id}
                  href={d.href}
                  className={cn(
                    "press relative flex shrink-0 snap-start flex-col overflow-hidden rounded-3xl p-4",
                    d.art ? "w-[78%]" : "w-[52%]",
                    [
                      "bg-gradient-to-br from-[#ece9ff] to-[#f7f6ff]",
                      "bg-gradient-to-br from-[#dff8ee] to-[#f4fdf9]",
                      "bg-gradient-to-br from-[#ffefd9] to-[#fffaf2]",
                    ][i],
                  )}
                >
                  <span className="text-xs font-semibold text-muted">{d.kicker}</span>
                  <span className={cn("mt-3 text-[17px] font-extrabold leading-snug", d.art && "max-w-[58%]")}>{d.title}</span>
                  <span className={cn("mt-1 text-xs leading-snug text-muted", d.art && "max-w-[58%]")}>{d.body}</span>
                  <span className="mt-auto pt-4 text-xs font-bold text-brand-700">{d.cta} →</span>
                  {d.art && <Art name={d.art} className="absolute -bottom-1 -right-2 h-[150px] w-auto" />}
                </Link>
              ))}
            </div>
          </section>
        )}

        {tab === "foryou" && !searching && (
          <div className="mt-7 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Popular right now</h2>
          </div>
        )}

        {tab === "foryou" && !searching && (
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Sorted by how often people explore them on the app. It&apos;s the same list for everyone, not a recommendation, so compare and decide for yourself.
          </p>
        )}

        {tab === "stocks" && !searching && (
          <div className="mt-4">
            <MarketStrip />
          </div>
        )}

        {tab === "sip" && !searching && (
          <Link href="/learn?lesson=sip" className="mt-4 flex items-center gap-2 text-sm text-muted hover:text-ink">
            <PlayCircle className="size-4 text-brand-700" /> New to SIPs? <span className="font-semibold text-brand-700">Watch the 30-sec explainer</span>
          </Link>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className={cn(
              "press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
              filtersOpen || risk !== "all" || sort !== "popular" ? "border-ink text-ink" : "border-hairline bg-white text-ink-2",
            )}
          >
            <SlidersHorizontal className="size-3.5" /> Filters{risk !== "all" || sort !== "popular" ? " · on" : ""}
          </button>
          {searching && (
            <span className="text-xs text-muted">
              {list.length} result{list.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {filtersOpen && (
          <div className="mt-3 flex animate-fade-in flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted">Risk</span>
            {(["all", "low", "moderate", "high"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                aria-pressed={risk === r}
                className={cn(
                  "press rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                  risk === r ? "border-brand bg-brand-50 text-brand-700" : "border-hairline bg-white text-ink-2",
                )}
              >
                {r}
              </button>
            ))}
            <label className="relative ml-auto">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-8 appearance-none rounded-lg border border-hairline bg-white pl-3 pr-8 text-xs font-semibold outline-none"
              >
                <option value="popular">{tab === "foryou" ? "Best match" : "Popular"}</option>
                <option value="gainers">Top gainers</option>
                <option value="losers">Top losers</option>
                <option value="price">Price: low to high</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            </label>
          </div>
        )}

        <section key={tab} className="mt-4 min-h-[50dvh] animate-fade-in space-y-2.5 pb-24" aria-live="polite" {...swipe}>
          {list.map((i) => (
            <InvestmentCard key={i.id} item={i} />
          ))}
          {list.length === 0 &&
            (tab === "watchlist" && !searching ? (
              <EmptyState
                icon="♡"
                title="Your watchlist is empty"
                body="Tap the heart on any stock, fund or ETF to keep an eye on it here."
                action={<Button onClick={() => changeTab("foryou")}>Browse recommendations</Button>}
              />
            ) : (
              <EmptyState
                icon={<SearchX className="size-6" />}
                title="No matches found"
                body={searching ? "Try a company name like “Reliance” or a ticker like “TCS”." : "Try a different risk filter."}
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setRisk("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ))}
        </section>
      </div>
      <CompareTray />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ExploreView />
    </Suspense>
  );
}
