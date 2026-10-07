"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brain, CalendarCheck, Eraser, Flame, LogOut, Pencil, PlayCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { MobileHeader } from "@/components/layout/TopBar";
import { profileRows } from "@/components/onboarding/ProfileSummary";
import { Art } from "@/components/ui/Art";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, SectionTitle } from "@/components/ui/primitives";
import { lessons, levelLabel } from "@/data/lessons";
import { quizQuestions } from "@/data/quiz";
import { useAppStore } from "@/hooks/useAppStore";
import { learnerLevel } from "@/lib/personalise";
import { clearSampleData, effectiveInvestingStreak, effectiveLearningStreak, freshState, logout } from "@/lib/actions";

const methodLabel = { phone: "Phone (OTP)", google: "Google (demo)", chatgpt: "ChatGPT (demo)" } as const;

export default function ProfilePage() {
  const { state, update, replace } = useAppStore();
  const router = useRouter();
  const [confirm, setConfirm] = useState<"reset" | "clear" | null>(null);
  const profile = state.profile!;
  const answered = Object.keys(state.quiz.answers).length;

  const reset = () => {
    replace(freshState());
    router.replace("/");
  };

  return (
    <>
      <MobileHeader title="Profile" />
      <div className="space-y-7 px-5 pb-10 pt-4">
        <section className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-[#5367FF] text-2xl font-extrabold text-white">
            {profile.name[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-extrabold">{profile.name}</p>
            <p className="truncate text-sm text-muted">
              {state.auth.phone ? `+91 ${state.auth.phone.slice(0, 5)} ${state.auth.phone.slice(5)} · ` : ""}
              {state.auth.method ? methodLabel[state.auth.method] : ""}
            </p>
          </div>
          <Art name="char-phone" className="h-20 w-auto" />
        </section>

        <section>
          <SectionTitle
            title="Your investing style"
            action={
              <Link href="/onboarding" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                <Pencil className="size-3.5" /> Edit
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "Learning level", value: levelLabel[learnerLevel(profile, state.learning.completed)], emoji: "🎓" },
              ...profileRows(profile).filter((r) => r.key !== "Knowledge"),
            ].map((r) => (
              <div key={r.key} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-hairline">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas text-lg" aria-hidden>
                  {r.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{r.value}</span>
                  <span className="block text-[11px] text-muted">{r.key}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">This shapes what you see on Home, Learn and Explore.</p>
        </section>

        <section>
          <SectionTitle title="Your progress" />
          <div className="grid grid-cols-4 gap-2 rounded-3xl bg-white p-4 ring-1 ring-hairline">
            {(
              [
                [Flame, "text-[#f97316] bg-amber-soft", `${effectiveLearningStreak(state.learning)} days`, "Learning"],
                [PlayCircle, "text-[#6b46d6] bg-violet-soft", `${state.learning.completed.length}/${lessons.length}`, "Reels"],
                [Brain, "text-[#3559c7] bg-sky-soft", `${answered}/${quizQuestions.length}`, "Quizzes"],
                [CalendarCheck, "text-brand-700 bg-brand-50", `${effectiveInvestingStreak(state)} mo`, "Investing"],
              ] as const
            ).map(([Icon, tint, value, label]) => (
              <div key={label} className="flex flex-col items-center text-center">
                <span className={`grid size-10 place-items-center rounded-full ${tint}`}>
                  <Icon className="size-5" />
                </span>
                <span className="mt-2 text-sm font-bold">{value}</span>
                <span className="text-[11px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6 pt-6">
          <section>
            <SectionTitle title="Demo controls" />
            <Card className="divide-y divide-line">
              <button onClick={() => setConfirm("reset")} className="flex w-full items-center gap-3 p-4 text-left hover:bg-canvas">
                <RotateCcw className="size-5 text-down" />
                <span>
                  <span className="block text-sm font-bold">Reset Demo Data</span>
                  <span className="block text-xs text-muted">Clear everything and restart from the launch screen</span>
                </span>
              </button>
              <button onClick={() => setConfirm("clear")} className="flex w-full items-center gap-3 p-4 text-left hover:bg-canvas">
                <Eraser className="size-5 text-muted" />
                <span>
                  <span className="block text-sm font-bold">Start with an empty portfolio</span>
                  <span className="block text-xs text-muted">Remove sample holdings and goals to see first-time states</span>
                </span>
              </button>
              <button
                onClick={() => {
                  update(logout);
                  router.replace("/login");
                }}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-canvas"
              >
                <LogOut className="size-5 text-muted" />
                <span className="block text-sm font-bold">Log out</span>
              </button>
            </Card>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-canvas p-4 text-xs leading-relaxed text-muted">
              <ShieldCheck className="size-4 shrink-0 text-brand-700" />
              <p>
                This is a product case-study prototype. All data is mock and stored only in this browser (localStorage). There are no real payments, orders,
                KYC, bank connections or financial advice.
              </p>
            </div>
          </section>
        </div>
      </div>

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === "reset" ? "Reset all demo data?" : "Clear sample portfolio?"}>
        <p className="text-sm text-muted">
          {confirm === "reset"
            ? "You'll be signed out and the journey restarts from the launch screen. Learning progress, quiz answers, goals and demo investments are cleared."
            : "Sample holdings, goals and demo investments will be removed. Your learning progress and preferences stay."}
        </p>
        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="dark"
            className="flex-1"
            onClick={() => {
              if (confirm === "reset") reset();
              else {
                update(clearSampleData);
                setConfirm(null);
              }
            }}
          >
            {confirm === "reset" ? "Reset" : "Clear"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
