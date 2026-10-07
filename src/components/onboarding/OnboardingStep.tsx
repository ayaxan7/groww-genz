import type { ReactNode } from "react";

export function OnboardingStep({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="animate-fade-up">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{eyebrow}</p>}
      <h1 className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}
