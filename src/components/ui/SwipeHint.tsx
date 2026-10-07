import { ChevronsLeft } from "lucide-react";

/** Mobile-only nudge that the screen supports swipe navigation. */
export function SwipeHint({ text = "Swipe left to continue, right to go back" }: { text?: string }) {
  return (
    <p className="mb-2 flex items-center justify-center gap-1 text-[11px] font-medium text-subtle">
      <ChevronsLeft className="size-3.5" /> {text}
    </p>
  );
}
