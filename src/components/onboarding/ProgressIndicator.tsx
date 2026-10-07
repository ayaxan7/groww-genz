/** Thin animated progress bar for multi-step flows. */
export function ProgressIndicator({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Onboarding progress"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-muted tabular">
        {Math.min(step, total)}/{total}
      </span>
    </div>
  );
}
