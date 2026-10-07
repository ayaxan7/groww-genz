"use client";

import { cn } from "@/lib/format";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

/** Horizontally scrollable pill tabs. */
export function PillTabs<T extends string>({
  items,
  value,
  onChange,
  className,
  size = "md",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="tablist" className={cn("no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4", className)}>
      {items.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "press shrink-0 rounded-full border font-semibold",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/30",
            )}
          >
            {t.label}
            {t.count !== undefined && <span className={cn("ml-1.5", active ? "text-white/70" : "text-subtle")}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined section tabs, e.g. Overview / Financials / News. */
export function UnderlineTabs<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-line">
      {items.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={t.value === value}
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors",
            t.value === value ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Two/three-option segmented control. */
export function Segmented<T extends string>({ items, value, onChange }: { items: TabItem<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid rounded-xl bg-line-2 p-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }} role="radiogroup">
      {items.map((t) => (
        <button
          key={t.value}
          role="radio"
          aria-checked={t.value === value}
          onClick={() => onChange(t.value)}
          className={cn(
            "press rounded-lg py-2 text-sm font-semibold",
            t.value === value ? "bg-white text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
