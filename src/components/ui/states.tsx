import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { Logo } from "./Logo";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-2xl text-brand-700">{icon}</span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      {body && <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-line-2", className)} />;
}

export function FullScreenLoader({ label = "Loading your journey…" }: { label?: string }) {
  return (
    <div className="grid min-h-full place-items-center bg-white" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <Logo size={32} />
        <div className="h-1 w-24 overflow-hidden rounded-full bg-line-2">
          <div className="h-full w-1/2 animate-[fade-in_0.8s_ease-in-out_infinite_alternate] rounded-full bg-brand" />
        </div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4" role="status" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
