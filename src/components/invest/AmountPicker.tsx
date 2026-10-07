"use client";

import { useState } from "react";
import { amountOptions } from "@/data/profileOptions";
import { cn, formatINR } from "@/lib/format";

/** ₹100 / ₹500 / ₹1,000 / ₹2,500 / Custom. Small amounts are first-class options. */
export function AmountPicker({ value, onChange, min = 100, hint }: { value: number; onChange: (v: number) => void; min?: number; hint?: string }) {
  const isPreset = (amountOptions as readonly number[]).includes(value);
  const [custom, setCustom] = useState(!isPreset);
  const [text, setText] = useState(isPreset ? "" : String(value));
  const tooLow = custom && text !== "" && Number(text) < min;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Amount">
        {amountOptions.map((a) => {
          const selected = !custom && value === a;
          const below = a < min;
          return (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={below}
              onClick={() => {
                setCustom(false);
                onChange(a);
              }}
              className={cn(
                "press h-12 rounded-xl border text-[15px] font-bold tabular disabled:cursor-not-allowed disabled:opacity-40",
                selected ? "border-brand bg-brand-50 text-brand-700 ring-4 ring-brand/10" : "border-line bg-white hover:border-ink/25",
              )}
            >
              {formatINR(a)}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => setCustom(true)}
          className={cn(
            "press h-12 rounded-xl border text-[15px] font-bold",
            custom ? "border-brand bg-brand-50 text-brand-700 ring-4 ring-brand/10" : "border-line bg-white hover:border-ink/25",
          )}
        >
          Custom
        </button>
      </div>
      {custom && (
        <div className="mt-3 animate-fade-up">
          <label className="flex h-13 items-center rounded-xl border border-line bg-white px-4 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
            <span className="text-lg font-bold text-muted">₹</span>
            <input
              autoFocus
              inputMode="numeric"
              value={text}
              placeholder={`Enter amount (min ${formatINR(min)})`}
              aria-label="Custom amount"
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, "").slice(0, 7);
                setText(clean);
                const n = Number(clean);
                if (n >= min) onChange(n);
              }}
              className="ml-2 h-full w-full bg-transparent text-lg font-bold tabular outline-none placeholder:text-sm placeholder:font-normal placeholder:text-subtle"
            />
          </label>
          {tooLow && <p className="mt-2 text-sm font-medium text-down">Minimum is {formatINR(min)} for this option.</p>}
        </div>
      )}
      {hint && <p className="mt-3 text-sm text-muted">{hint}</p>}
    </div>
  );
}
