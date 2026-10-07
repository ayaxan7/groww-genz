import type { CSSProperties, ReactNode } from "react";
import type { ConceptId } from "@/data/concepts";
import { cn } from "@/lib/format";

/** Staggered reveal so the picture builds up step by step. */
function Step({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <div className={cn("animate-fade-up", className)} style={{ animationDelay: `${i * 140}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

const Arrow = ({ i }: { i: number }) => (
  <Step i={i} className="text-center text-lg leading-none text-subtle">
    ↓
  </Step>
);

function Sip() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {["Jan", "Feb", "Mar", "Apr"].map((m, i) => (
          <Step key={m} i={i} className="rounded-xl bg-brand-50 py-3 text-center">
            <p className="text-sm font-bold text-brand-700">₹500</p>
            <p className="text-[11px] text-muted">{m}</p>
          </Step>
        ))}
      </div>
      <Arrow i={4} />
      <Step i={5} className="rounded-xl bg-ink py-3 text-center text-sm font-semibold text-white">
        Invested automatically, every month
      </Step>
    </div>
  );
}

function Compounding() {
  const rows = [500, 620, 770, 950];
  return (
    <div className="space-y-1.5">
      {rows.map((v, i) => (
        <div key={v}>
          {i > 0 && <Arrow i={i * 2 - 1} />}
          <Step i={i * 2} className="flex items-center gap-3">
            <span className="h-8 rounded-lg bg-brand transition-all" style={{ width: `${(v / 950) * 70}%`, opacity: 0.45 + i * 0.18 }} />
            <span className="text-sm font-bold tabular">₹{v}</span>
          </Step>
        </div>
      ))}
      <Step i={8} className="pt-1 text-center text-[11px] text-subtle">
        Illustrative example, not a promise
      </Step>
    </div>
  );
}

function Diversification() {
  const buckets = [
    { label: "Banks", c: "bg-sky-soft", move: "+4%" },
    { label: "Tech", c: "bg-violet-soft", move: "−6%" },
    { label: "Energy", c: "bg-amber-soft", move: "+3%" },
    { label: "Gold", c: "bg-brand-50", move: "+2%" },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {buckets.map((b, i) => (
          <Step key={b.label} i={i} className={cn("rounded-2xl px-2 pb-3 pt-6 text-center", b.c)}>
            <p className="text-xs font-semibold text-ink-2">{b.label}</p>
            <p className={cn("mt-1 text-sm font-bold tabular", b.move.startsWith("−") ? "text-down" : "text-up")}>{b.move}</p>
          </Step>
        ))}
      </div>
      <Arrow i={4} />
      <Step i={5} className="rounded-xl bg-ink py-3 text-center text-sm font-semibold text-white">
        Overall: <span className="text-brand">+0.75%</span>, one dip didn&apos;t sink you
      </Step>
    </div>
  );
}

function Risk() {
  return (
    <div className="space-y-4">
      <Step i={0} className="rounded-2xl bg-rose-soft/70 p-4">
        <p className="text-xs font-semibold text-[#c2410c]">More ups &amp; downs</p>
        <svg viewBox="0 0 300 50" className="mt-2 h-12 w-full" aria-hidden>
          <path
            d="M0 25 L25 5 L50 45 L75 8 L100 40 L125 2 L150 46 L175 10 L200 38 L225 4 L250 30 L275 6 L300 12"
            fill="none"
            stroke="var(--color-down)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </Step>
      <Step i={1} className="text-center text-lg leading-none text-subtle">
        ↕
      </Step>
      <Step i={2} className="rounded-2xl bg-brand-50 p-4">
        <p className="text-xs font-semibold text-brand-700">Lower ups &amp; downs</p>
        <svg viewBox="0 0 300 50" className="mt-2 h-12 w-full" aria-hidden>
          <path d="M0 32 C50 28, 80 30, 120 26 S200 22, 240 20 S280 18, 300 16" fill="none" stroke="var(--color-up)" strokeWidth="2.5" />
        </svg>
      </Step>
    </div>
  );
}

function Pe() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
        <Step i={0} className="rounded-xl bg-canvas p-3">
          <p className="text-[11px] text-muted">Share price</p>
          <p className="text-sm font-bold">₹2,856</p>
        </Step>
        <Step i={1} className="text-subtle">
          ÷
        </Step>
        <Step i={2} className="rounded-xl bg-canvas p-3">
          <p className="text-[11px] text-muted">Yearly profit / share</p>
          <p className="text-sm font-bold">₹104</p>
        </Step>
        <Step i={3} className="text-subtle">
          =
        </Step>
        <Step i={4} className="rounded-xl bg-ink p-3 text-white">
          <p className="text-[11px] text-white/60">P/E</p>
          <p className="text-sm font-bold">27</p>
        </Step>
      </div>
      <Step i={5} className="rounded-xl bg-brand-50 p-3 text-center text-sm text-ink-2">
        You pay about <strong>₹27</strong> for every <strong>₹1</strong> it earns in a year
      </Step>
    </div>
  );
}

function Returns() {
  return (
    <div className="space-y-1.5">
      <Step i={0} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm">
        <span className="text-muted">You put in</span> <strong className="tabular">₹11,000</strong>
      </Step>
      <Arrow i={1} />
      <Step i={2} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm">
        <span className="text-muted">It&apos;s worth now</span> <strong className="tabular">₹12,480</strong>
      </Step>
      <Arrow i={3} />
      <Step i={4} className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 text-sm">
        <span className="text-brand-700">Your return</span> <strong className="tabular text-brand-700">+₹1,480 · +13.5%</strong>
      </Step>
    </div>
  );
}

function Valuation() {
  return (
    <div className="space-y-3">
      <Step i={0} className="relative h-3 rounded-full bg-gradient-to-r from-brand via-[#f5a524] to-down">
        <span className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-ink shadow" />
      </Step>
      <Step i={1} className="grid grid-cols-3 text-xs font-semibold text-muted">
        <span>Cheap</span>
        <span className="text-center text-ink">Usual</span>
        <span className="text-right">Pricey</span>
      </Step>
      <Step i={2} className="rounded-xl bg-canvas p-3 text-center text-sm text-ink-2">
        Today&apos;s price vs. its <strong>own</strong> usual range
      </Step>
    </div>
  );
}

function Expense() {
  return (
    <div className="space-y-1.5">
      <Step i={0} className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3 text-sm">
        <span className="text-muted">You invest</span> <strong>₹10,000</strong>
      </Step>
      <Arrow i={1} />
      <Step i={2} className="flex items-center justify-between rounded-xl bg-amber-soft px-4 py-3 text-sm">
        <span className="text-[#8a5300]">Fee at 0.18% a year</span> <strong>≈ ₹18</strong>
      </Step>
      <Step i={3} className="pt-1 text-center text-[11px] text-subtle">
        Lower is better. It&apos;s taken quietly from the fund&apos;s value.
      </Step>
    </div>
  );
}

const visuals: Record<ConceptId, () => ReactNode> = {
  sip: Sip,
  compounding: Compounding,
  diversification: Diversification,
  risk: Risk,
  pe: Pe,
  returns: Returns,
  valuation: Valuation,
  expense: Expense,
};

export function ConceptVisual({ id }: { id: ConceptId }) {
  const V = visuals[id];
  return <V />;
}
