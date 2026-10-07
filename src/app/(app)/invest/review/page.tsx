"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FlowFooter, FlowHeader } from "@/components/invest/FlowHeader";
import { useDraftGuard } from "@/components/invest/useDraftGuard";
import { SwipeToConfirm } from "@/components/ui/SwipeToConfirm";
import { Card, InstrumentLogo, RiskBadge } from "@/components/ui/primitives";
import { PageSkeleton } from "@/components/ui/states";
import { typeLabel } from "@/data/instruments";
import { goalOptions, horizonOptions, labelOf } from "@/data/profileOptions";
import { useAppStore } from "@/hooks/useAppStore";
import { confirmInvestment } from "@/lib/actions";
import { formatINR } from "@/lib/format";

export default function InvestmentReviewPage() {
  const guard = useDraftGuard("/invest/success");
  const { state, update } = useAppStore();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  if (!guard) return <PageSkeleton />;
  const { draft: d, instrument: inst } = guard;
  const goal = state.goals.find((g) => g.id === d.goalId);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const rows: [string, React.ReactNode][] = [
    ["Investment", inst.name],
    ["Type", typeLabel[inst.type]],
    [
      "Amount",
      <span key="a" className="tabular">
        {formatINR(d.amount)}
      </span>,
    ],
    ["Frequency", d.frequency === "monthly" ? "Monthly SIP" : "One-time"],
    ["Start date", today],
    ["Goal", goal ? `${goal.name} (${formatINR(goal.saved)} → ${formatINR(goal.saved + d.amount)})` : labelOf(goalOptions, d.goalType)],
    ["Timeline", labelOf(horizonOptions, d.horizon)],
    ["Risk", <RiskBadge key="r" risk={inst.risk} />],
  ];

  const confirm = () => {
    setConfirming(true);
    setTimeout(() => {
      update(confirmInvestment);
      router.replace("/invest/success");
    }, 700);
  };

  return (
    <>
      <FlowHeader title="Review" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 pb-32 pt-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Review your investment</h1>
          <p className="mt-1 text-sm text-muted">Check the details before you confirm.</p>
        </div>
        <Card className="p-5">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <InstrumentLogo name={inst.name} color={inst.logoColor} size={44} />
            <div>
              <p className="font-bold">{inst.name}</p>
              <p className="text-xs text-muted">{inst.descriptor}</p>
            </div>
          </div>
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-[#f5a524]/50 bg-amber-soft p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#a15c00]" />
          <p className="text-sm text-[#7a4500]">
            <strong>Demo investment.</strong> This prototype does not place real orders, connect a bank or move money. Confirming updates your demo portfolio
            and goal only.
          </p>
        </div>
      </div>
      <FlowFooter>
        {/* slide to confirm: a deliberate gesture for a money action (the knob also works with tap/keyboard) */}
        <div className="w-full">
          <SwipeToConfirm label="Swipe to Confirm Investment" onConfirm={confirm} loading={confirming} />
        </div>
      </FlowFooter>
    </>
  );
}
