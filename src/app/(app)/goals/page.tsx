"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";
import { MobileHeader } from "@/components/layout/TopBar";
import { Button, buttonClass } from "@/components/ui/Button";
import { Art } from "@/components/ui/Art";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/states";
import { getInstrument } from "@/data/instruments";
import { horizonOptions, labelOf } from "@/data/profileOptions";
import { useAppStore } from "@/hooks/useAppStore";
import { addGoal, deleteGoal, effectiveInvestingStreak, updateGoal } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { horizonYears } from "@/lib/projection";

type Dialog = { kind: "create" } | { kind: "view"; id: string } | { kind: "adjust"; id: string } | null;

export default function GoalsPage() {
  const { state, update } = useAppStore();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const active = dialog && dialog.kind !== "create" ? state.goals.find((g) => g.id === dialog.id) : undefined;
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const primary = state.goals.find((g) => g.type === state.profile?.goal) ?? state.goals[0];
  const others = state.goals.filter((g) => g.id !== primary?.id);

  return (
    <>
      <MobileHeader title="Goals" />
      <div className="space-y-6 px-5 pb-8 pt-4">
        {state.goals.length > 0 && (
          <p className="text-sm text-muted">
            {formatINR(totalSaved)} saved so far · 🔥 {effectiveInvestingStreak(state)}-month streak
          </p>
        )}

        {primary ? (
          <GoalCard
            goal={primary}
            featured
            onView={() => setDialog({ kind: "view", id: primary.id })}
            onAdjust={() => setDialog({ kind: "adjust", id: primary.id })}
          />
        ) : (
          <EmptyState
            icon={<Art name="el-target" className="size-10" />}
            title="No goals yet"
            body="A laptop, a trip or a safety net. Goals make investing feel real and help you stay consistent."
            action={<Button onClick={() => setDialog({ kind: "create" })}>Create a new goal</Button>}
          />
        )}

        {primary && (
          <section>
            <h2 className="mb-3 text-lg font-bold tracking-tight">Other goals</h2>
            <div className="space-y-3">
              {others.map((g) => (
                <GoalCard key={g.id} goal={g} onView={() => setDialog({ kind: "view", id: g.id })} onAdjust={() => setDialog({ kind: "adjust", id: g.id })} />
              ))}
              <button
                onClick={() => setDialog({ kind: "create" })}
                className="press flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-sm font-semibold text-muted hover:border-brand hover:text-brand-700"
              >
                <Plus className="size-4" /> Create a new goal
              </button>
            </div>
          </section>
        )}
      </div>

      <Modal open={dialog?.kind === "create"} onClose={close} title="Create a new goal">
        <GoalForm
          submitLabel="Create goal"
          onSubmit={(g) => {
            update((s) => addGoal(s, { ...g, saved: 0 }));
            close();
          }}
        />
      </Modal>

      <Modal open={dialog?.kind === "adjust" && !!active} onClose={close} title="Adjust goal">
        {active && (
          <GoalForm
            initial={active}
            submitLabel="Save changes"
            onSubmit={(g) => {
              update((s) => updateGoal(s, active.id, g));
              close();
            }}
            onDelete={() => {
              update((s) => deleteGoal(s, active.id));
              close();
            }}
          />
        )}
      </Modal>

      <Modal open={dialog?.kind === "view" && !!active} onClose={close} title={active?.name}>
        {active && <GoalDetail goalId={active.id} />}
      </Modal>
    </>
  );
}

function GoalDetail({ goalId }: { goalId: string }) {
  const { state } = useAppStore();
  const g = state.goals.find((x) => x.id === goalId)!;
  const pct = Math.min(100, (g.saved / g.target) * 100);
  const remaining = Math.max(0, g.target - g.saved);
  const months = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : 0;
  const sips = state.sips.filter((s) => s.goalId === g.id);
  const txs = state.transactions.filter((t) => t.goalId === g.id);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-2xl font-extrabold tabular">
          {formatINR(g.saved)} <span className="text-base font-medium text-muted">/ {formatINR(g.target)}</span>
        </p>
        <ProgressBar value={pct} className="mt-2" />
        <p className="mt-2 text-sm text-muted">{Math.round(pct)}% complete</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-canvas p-3">
          <dt className="text-xs text-muted">Monthly</dt>
          <dd className="font-bold">{formatINR(g.monthly)}</dd>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <dt className="text-xs text-muted">Timeline</dt>
          <dd className="font-bold">{labelOf(horizonOptions, g.horizon)}</dd>
        </div>
      </dl>
      <p className="rounded-xl bg-brand-50 p-3 text-sm text-ink-2">
        At {formatINR(g.monthly)}/month you&apos;d add the remaining {formatINR(remaining)} in about <strong>{months} months</strong> (before any returns)
        {months > horizonYears[g.horizon] * 12 ? ", a little beyond your timeline. Consider adjusting the amount." : ", within your timeline."}
      </p>
      <div>
        <p className="mb-2 text-sm font-bold">Linked demo investments</p>
        {txs.length === 0 && sips.length === 0 ? (
          <p className="text-sm text-muted">
            {g.saved > 0
              ? `Nothing linked yet. Sample savings of ${formatINR(g.saved)} are pre-loaded for the demo.`
              : "Nothing linked yet. Use Add money to start."}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {txs.map((t) => (
              <li key={t.id} className="flex justify-between gap-3">
                <span className="truncate">{getInstrument(t.instrumentId)?.name}</span>
                <span className="shrink-0 font-semibold tabular">
                  {formatINR(t.amount)} {t.frequency === "monthly" ? "· SIP" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href={`/invest?goal=${g.id}`} className={buttonClass({ full: true })}>
        Add money
      </Link>
    </div>
  );
}
