import { marketIndices } from "@/data/instruments";
import { Change } from "../ui/primitives";

/** Slim, scrollable index ticker (mock values). Moved here from Home. */
export function MarketStrip() {
  return (
    <div className="no-scrollbar -mx-5 mb-4 flex gap-5 overflow-x-auto px-5 text-xs" data-no-swipe aria-label="Market today (mock data)">
      {marketIndices.map((m) => (
        <span key={m.name} className="shrink-0 whitespace-nowrap">
          <span className="font-semibold text-muted">{m.name}</span>{" "}
          <span className="font-semibold tabular">{m.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span> <Change value={m.changePct} />
        </span>
      ))}
    </div>
  );
}
