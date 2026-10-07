"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

/** Focused header for the investing flow: back, title, step progress, close. */
export function FlowHeader({ title, step, total, back }: { title: string; step?: number; total?: number; back?: string | (() => void) }) {
  const router = useRouter();
  const goBack = () => {
    if (typeof back === "function") return back();
    if (back) return router.push(back);
    // opened directly (no in-app history): fall back to Home instead of leaving the app
    if (window.history.length <= 1) return router.push("/home");
    router.back();
  };
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <button onClick={goBack} className="press -ml-2 grid size-9 place-items-center rounded-full hover:bg-line-2" aria-label="Go back">
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-[15px] font-bold">{title}</p>
        <span className="ml-2 rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a5300]">Demo</span>
        <Link href="/home" className="press ml-auto grid size-9 place-items-center rounded-full hover:bg-line-2" aria-label="Exit investing flow">
          <X className="size-5" />
        </Link>
      </div>
      {step !== undefined && total !== undefined && (
        <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-3" aria-label={`Step ${step} of ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < step ? "bg-brand" : "bg-line-2"}`} />
          ))}
        </div>
      )}
    </header>
  );
}

export function FlowFooter({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {hint}
      <div className="mx-auto flex max-w-3xl gap-3">{children}</div>
    </div>
  );
}
