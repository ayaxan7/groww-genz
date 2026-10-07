"use client";

import { Logo } from "@/components/ui/Logo";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-full place-items-center bg-white px-6 text-center">
      <div>
        <Logo size={28} />
        <h1 className="mt-10 text-xl font-bold">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted">Don&apos;t worry, your demo data is safe in this browser.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="h-11 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600">
            Try again
          </button>
          <a href="/home" className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
