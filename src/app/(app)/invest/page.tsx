"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Info } from "lucide-react";
import { AmountPicker } from "@/components/invest/AmountPicker";
import { FlowFooter, FlowHeader } from "@/components/invest/FlowHeader";
import { GuidedInvestingStep } from "@/components/invest/GuidedInvestingStep";
import { ExplainLink } from "@/components/learn/ExplainLink";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { Button } from "@/components/ui/Button";
import { Badge, Card, Change, InstrumentLogo, RiskBadge } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/ui/states";
import { SwipeHint } from "@/components/ui/SwipeHint";
import { Segmented } from "@/components/ui/Tabs";
import { getInstrument } from "@/data/instruments";
import { goalOptions, horizonOptions, labelOf, riskOptions } from "@/data/profileOptions";
import { useAppStore } from "@/hooks/useAppStore";
import { useSwipe } from "@/hooks/useSwipe";
import { startDraft, updateDraft } from "@/lib/actions";
import { cn, formatINR } from "@/lib/format";
import { investmentTypes, popularInstruments } from "@/lib/personalise";
import type { Frequency, GoalType, Instrument, InstrumentType, InvestDraft, Profile } from "@/lib/types";

const TOTAL = 5;

function draftProfile(base: Profile, d: InvestDraft): Profile {
  return { ...base, goal: d.goalType, amount: d.amount, horizon: d.horizon, risk: d.risk };
}

function OptionRow({ item, selected, onSelect }: { item: Instrument; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      className={cn(
        "press flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left",
        selected ? "border-brand ring-4 ring-brand/10" : "border-line hover:border-ink/25",
      )}
    >
      <InstrumentLogo name={item.name} color={item.logoColor} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{item.name}</span>
        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <RiskBadge risk={item.risk} short /> from {formatINR(Math.max(100, item.minAmount))}
        </span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-bold tabular">{formatINR(item.price, { decimals: true })}</span>
        <Change value={item.changePct} className="text-xs" />
      </span>
      <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border-2", selected ? "border-brand bg-brand text-white" : "border-line")}>
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

function GuidedView() {
  const { state, update } = useAppStore();
  const router = useRouter();
  const params = useSearchParams();
  const step = Math.min(TOTAL, Math.max(1, Number(params.get("step")) || 1));
  const from = params.get("from");
  const goalParam = params.get("goal");
  const initKey = useRef<string | null>(null);

  // forget the last entry when this (kept-alive) page is hidden
  useEffect(() => () => void (initKey.current = null), []);

  // start a fresh draft when entering the flow (keeps an instrument chosen on its detail page)
  useEffect(() => {
    const key = `${from ?? ""}|${goalParam ?? ""}`;
    if (state.draft && (initKey.current === key || step !== 1)) return;
    initKey.current = key;
    if (from) update((s) => startDraft(s, { instrumentId: from }));
    else if (goalParam) {
      const g = state.goals.find((x) => x.id === goalParam);
      update((s) => startDraft(s, g ? { goalId: g.id, goalType: g.type, amount: g.monthly, horizon: g.horizon } : {}));
    } else update((s) => startDraft(s));
  }, [from, goalParam, step, state.draft, state.goals, update]);

  // Steps replace the URL instead of stacking history entries, so Back never loops.
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [openType, setOpenType] = useState<InstrumentType | null>(null);
  const keep = `${from ? `&from=${from}` : ""}${goalParam ? `&goal=${goalParam}` : ""}`;
  const go = (n: number) => {
    setDir(n > step ? "next" : "prev");
    router.replace(`/invest?step=${n}${keep}`);
  };
  const exit = () => router.replace(from ? `/explore/${from}` : goalParam ? "/goals" : "/home");
  const back = () => (step > 1 ? go(step - 1) : exit());
  const forward = () => {
    const dr = state.draft;
    if (!dr) return;
    if (step < TOTAL) {
      if (step !== 2 || dr.amount >= 100) go(step + 1);
    } else if (getInstrument(dr.instrumentId)) router.push("/invest/amount");
  };
  // mobile: swipe left = next, right = back
  const swipe = useSwipe({ onLeft: forward, onRight: back });

  const d = state.draft;
  if (!d || !state.profile) return <PageSkeleton />;

  const set = (patch: Partial<InvestDraft>) => update((s) => updateDraft(s, patch));
  const pinned = getInstrument(from ?? undefined) ?? (d.instrumentId ? getInstrument(d.instrumentId) : undefined);
  const prof = draftProfile(state.profile, d);
  const selectGoalType = (t: GoalType) => {
    const existing = state.goals.find((g) => g.type === t);
    set({ goalType: t, goalId: existing?.id ?? null });
  };
  const chosen = getInstrument(d.instrumentId);

  return (
    <>
      <FlowHeader title="Guided investing" step={step} total={TOTAL} back={back} />
      <div
        key={step}
        {...swipe}
        className={`mx-auto min-h-[60dvh] max-w-3xl px-4 pb-32 pt-6   ${dir === "next" ? "animate-slide-next" : "animate-slide-prev"}`}
      >
        {step === 1 && (
          <GuidedInvestingStep step={1} title="What are you investing for?" subtitle="This helps us show you the most relevant options.">
            <div className="grid gap-2.5" role="radiogroup">
              {goalOptions.map((o) => {
                const g = state.goals.find((x) => x.type === o.value);
                return (
                  <OptionCard
                    key={o.value}
                    label={o.label}
                    emoji={o.emoji}
                    compact
                    hint={g ? `Your goal · ${formatINR(g.saved)} of ${formatINR(g.target)}` : undefined}
                    selected={d.goalType === o.value}
                    onSelect={() => selectGoalType(o.value)}
                  />
                );
              })}
            </div>
          </GuidedInvestingStep>
        )}

        {step === 2 && (
          <GuidedInvestingStep step={2} title="How much would you like to invest?" subtitle="₹100 is a perfectly good start.">
            <Segmented<Frequency>
              value={d.frequency}
              onChange={(frequency) => set({ frequency })}
              items={[
                { value: "monthly", label: "Monthly SIP" },
                { value: "one-time", label: "One-time" },
              ]}
            />
            <div className="mt-5">
              <AmountPicker
                value={d.amount}
                onChange={(amount) => set({ amount })}
                hint={d.frequency === "monthly" ? "You can pause or stop a SIP anytime." : undefined}
              />
            </div>
            <ExplainLink
              concept={d.frequency === "monthly" ? "sip" : "compounding"}
              label={d.frequency === "monthly" ? "What's a SIP?" : "How could this grow?"}
              cta="See it"
              className="mt-5"
            />
          </GuidedInvestingStep>
        )}

        {step === 3 && (
          <GuidedInvestingStep step={3} title="How long can your money stay invested?" subtitle="Longer timelines can ride out more ups and downs.">
            <div className="space-y-2.5" role="radiogroup">
              {horizonOptions.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  hint={o.hint}
                  emoji={o.emoji}
                  selected={d.horizon === o.value}
                  onSelect={() => set({ horizon: o.value })}
                />
              ))}
            </div>
          </GuidedInvestingStep>
        )}

        {step === 4 && (
          <GuidedInvestingStep step={4} title="How comfortable are you with ups & downs?" subtitle="Pre-filled from your profile.">
            <div className="space-y-2.5" role="radiogroup">
              {riskOptions.map((o) => (
                <OptionCard key={o.value} label={o.label} hint={o.hint} emoji={o.emoji} selected={d.risk === o.value} onSelect={() => set({ risk: o.value })} />
              ))}
            </div>
            <ExplainLink concept="risk" cta="Explain it" className="mt-5" />
          </GuidedInvestingStep>
        )}

        {step === 5 && (
          <GuidedInvestingStep step={5} title="Understand your options" subtitle="Learn what each type is, then pick one yourself.">
            <Card className="bg-canvas p-4 shadow-none">
              <p className="text-sm font-bold">Your plan</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  labelOf(goalOptions, d.goalType),
                  `${formatINR(d.amount)}${d.frequency === "monthly" ? "/month" : " once"}`,
                  labelOf(horizonOptions, d.horizon),
                  `${labelOf(riskOptions, d.risk)} risk`,
                ].map((t) => (
                  <Badge key={t} tone="gray" className="bg-white">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>

            {pinned && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">You were looking at</p>
                <OptionRow item={pinned} selected={d.instrumentId === pinned.id} onSelect={() => set({ instrumentId: pinned.id })} />
              </div>
            )}

            <div className="mt-6 space-y-4">
              {investmentTypes(prof).map((t) => {
                const open = openType === t.type;
                // a neutral list: same for everyone, sorted by popularity on the app, never by the user's answers
                const options = popularInstruments(4, t.type).filter((i) => i.id !== pinned?.id);
                return (
                  <section key={t.type} className="rounded-2xl bg-white p-4 ring-1 ring-hairline">
                    <h2 className="text-[17px] font-bold">{t.title}</h2>
                    <p className="mt-0.5 text-sm text-ink-2">{t.summary}</p>
                    <p className="mt-2 flex gap-1.5 text-xs text-muted">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-brand-700" />
                      <span>
                        <strong className="text-ink-2">Good to know:</strong> {t.note}
                      </span>
                    </p>
                    <button
                      onClick={() => setOpenType(open ? null : t.type)}
                      aria-expanded={open}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
                    >
                      {open ? "Hide" : `Browse ${t.type === "etf" ? t.title : t.title.toLowerCase()}`}
                      <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && (
                      <div className="mt-3 animate-fade-in">
                        <p className="mb-2 text-[11px] font-medium text-subtle">Popular on the app · same list for everyone</p>
                        <div className="space-y-2" role="radiogroup" aria-label={t.title}>
                          {options.map((i) => (
                            <OptionRow key={i.id} item={i} selected={d.instrumentId === i.id} onSelect={() => set({ instrumentId: i.id })} />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              We explain your options; we don&apos;t recommend specific stocks or funds. Compare and choose what suits you.{" "}
              <Link href="/explore" className="font-semibold text-brand-700">
                Browse everything
              </Link>
            </p>
          </GuidedInvestingStep>
        )}
      </div>

      <FlowFooter hint={<SwipeHint />}>
        {step > 1 && (
          <Button variant="ghost" onClick={() => go(step - 1)}>
            Back
          </Button>
        )}
        {step < TOTAL ? (
          <Button className="ml-auto flex-1" size="lg" onClick={() => go(step + 1)} disabled={step === 2 && d.amount < 100}>
            {step === 4 ? "See my options" : "Next"} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button className="ml-auto flex-1" size="lg" disabled={!chosen} onClick={() => router.push("/invest/amount")}>
            {chosen ? `Continue with ${chosen.name.split(" ")[0]}` : "Select an option"} <ArrowRight className="size-4" />
          </Button>
        )}
      </FlowFooter>
    </>
  );
}

export default function InvestPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GuidedView />
    </Suspense>
  );
}
