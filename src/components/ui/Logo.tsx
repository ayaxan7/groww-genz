/* eslint-disable @next/next/no-img-element -- static SVG brand assets */
import { cn } from "@/lib/format";

/** Brand mark + the supplied case-study wordmark (public/brand/groww-wordmark.svg). */
export function Logo({ className, size = 28, showWordmark = true }: { className?: string; size?: number; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img src="/brand/groww-mark.svg" alt="" width={size} height={size} />
      {showWordmark && (
        <img src="/brand/groww-wordmark.svg" alt="Groww" height={size} width={size * 3.2} className="-ml-1" style={{ height: size, width: "auto" }} />
      )}
    </span>
  );
}
