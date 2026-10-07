import type { HTMLAttributes, ReactNode } from "react";
import { cn, formatPct } from "@/lib/format";
import type { Risk, Valuation } from "@/lib/types";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-hairline",
        // let callers choose their own background without class conflicts
        !/(^|\s)bg-/.test(className ?? "") && "bg-white",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export type Tone = "green" | "blue" | "purple" | "amber" | "red" | "gray";

const toneClass: Record<Tone, string> = {
  green: "bg-brand-50 text-brand-700",
  blue: "bg-sky-soft text-[#3559c7]",
  purple: "bg-violet-soft text-[#6b46d6]",
  amber: "bg-amber-soft text-[#a15c00]",
  red: "bg-rose-soft text-[#c2410c]",
  gray: "bg-line-2 text-ink-2",
};

export function Badge({ tone = "gray", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", toneClass[tone], className)}>{children}</span>;
}

export function Change({ value, className, suffix }: { value: number; className?: string; suffix?: ReactNode }) {
  return (
    <span className={cn("tabular font-semibold", value >= 0 ? "text-up" : "text-down", className)}>
      {formatPct(value, value !== 0 && Math.abs(value) < 1 ? 2 : 1)}
      {suffix}
    </span>
  );
}

const riskTone: Record<Risk, Tone> = { low: "green", moderate: "amber", high: "red" };
const riskText: Record<Risk, string> = { low: "Low risk", moderate: "Moderate risk", high: "High risk" };

export function RiskBadge({ risk, short }: { risk: Risk; short?: boolean }) {
  return <Badge tone={riskTone[risk]}>{short ? risk[0].toUpperCase() + risk.slice(1) : riskText[risk]}</Badge>;
}

const valTone: Record<Valuation, Tone> = { cheap: "green", usual: "blue", pricey: "red" };
export function ValuationBadge({ value }: { value: Valuation }) {
  return <Badge tone={valTone[value]}>{value[0].toUpperCase() + value.slice(1)}</Badge>;
}

/** Three-step meter, e.g. Cheap · Usual · Pricey. */
export function Meter<T extends string>({ steps, value, label }: { steps: readonly T[]; value: T; label: string }) {
  const idx = steps.indexOf(value);
  const colors = ["bg-brand", "bg-[#f5a524]", "bg-down"];
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="text-base font-bold capitalize">{value}</p>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1" role="img" aria-label={`${label}: ${value}`}>
        {steps.map((s, i) => (
          <span key={s} className={cn("h-1.5 rounded-full", i === idx ? colors[i] : "bg-line")} />
        ))}
      </div>
      <div className="mt-1 grid grid-cols-3 text-[11px] text-subtle">
        {steps.map((s, i) => (
          <span key={s} className={cn("capitalize", i === 1 && "text-center", i === 2 && "text-right", i === idx && "font-semibold text-ink-2")}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className, barClass }: { value: number; className?: string; barClass?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full", !/(^|\s)bg-/.test(className ?? "") && "bg-line-2", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full bg-brand transition-[width] duration-700 ease-out", barClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SectionTitle({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-xl bg-amber-soft px-3 py-2 text-xs leading-relaxed text-[#8a5300]", className)}>
      <span aria-hidden>ⓘ</span>
      <span>{children}</span>
    </p>
  );
}

export function InstrumentLogo({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .replace(/\(.*\)/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
