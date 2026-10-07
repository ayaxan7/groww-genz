import { Check } from "lucide-react";
import { cn } from "@/lib/format";

export function OptionCard({
  label,
  hint,
  emoji,
  selected,
  onSelect,
  compact,
}: {
  label: string;
  hint?: string;
  emoji?: string;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "press flex w-full items-center gap-3 rounded-2xl border bg-white text-left",
        compact ? "p-3" : "p-4",
        selected ? "border-brand bg-brand-50/50 ring-4 ring-brand/10" : "border-line hover:border-ink/25",
      )}
    >
      {emoji && (
        <span className={cn("grid shrink-0 place-items-center rounded-xl bg-canvas text-xl", compact ? "size-9" : "size-11")} aria-hidden>
          {emoji}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border-2 transition",
          selected ? "border-brand bg-brand text-white" : "border-line",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
