import type { ReactNode } from "react";

export function GuidedInvestingStep({ step, title, subtitle, children }: { step: number; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="animate-fade-up">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Step {step} of 5</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
