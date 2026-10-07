"use client";

import { useState, type FormEvent } from "react";
import { goalOptions, goalTargets, horizonOptions } from "@/data/profileOptions";
import { goalName } from "@/lib/seed";
import { cn } from "@/lib/format";
import type { Goal, GoalType, Horizon } from "@/lib/types";
import { Button } from "../ui/Button";

export type GoalInput = Pick<Goal, "type" | "name" | "target" | "monthly" | "horizon">;

const field = "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand focus:ring-4 focus:ring-brand/10";

export function GoalForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  initial?: GoalInput;
  submitLabel: string;
  onSubmit: (g: GoalInput) => void;
  onDelete?: () => void;
}) {
  const [type, setType] = useState<GoalType>(initial?.type ?? "travel");
  const [name, setName] = useState(initial?.name ?? goalName("travel"));
  const [target, setTarget] = useState(String(initial?.target ?? goalTargets.travel));
  const [monthly, setMonthly] = useState(String(initial?.monthly ?? 500));
  const [horizon, setHorizon] = useState<Horizon>(initial?.horizon ?? "1-3");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = Number(target);
    const m = Number(monthly);
    if (!name.trim()) return setError("Give your goal a name");
    if (!t || t < 500) return setError("Target should be at least ₹500");
    if (!m || m < 100) return setError("Monthly amount should be at least ₹100");
    onSubmit({ type, name: name.trim(), target: t, monthly: m, horizon });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!initial && (
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">Type</p>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => {
                  setType(o.value);
                  setName(goalName(o.value));
                  setTarget(String(goalTargets[o.value]));
                }}
                className={cn(
                  "press rounded-full border px-3 py-1.5 text-xs font-semibold",
                  type === o.value ? "border-brand bg-brand-50 text-brand-700" : "border-line",
                )}
              >
                {o.value === "other" ? "🎯 Other" : `${o.emoji} ${o.label}`}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">Name</span>
        <input className={field} value={name} maxLength={32} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Target (₹)</span>
          <input
            className={cn(field, "tabular")}
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Monthly (₹)</span>
          <input
            className={cn(field, "tabular")}
            inputMode="numeric"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value.replace(/\D/g, "").slice(0, 7))}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">Timeline</span>
        <select className={field} value={horizon} onChange={(e) => setHorizon(e.target.value as Horizon)}>
          {horizonOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-down">
          {error}
        </p>
      )}
      <div className="flex gap-3 pt-1">
        {onDelete && (
          <Button variant="ghost" className="text-down" onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button type="submit" full className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
