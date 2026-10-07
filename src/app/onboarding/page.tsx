"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { AmountPicker } from "@/components/invest/AmountPicker";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { OptionCard } from "@/components/onboarding/OptionCard";
import { ProfileSummary } from "@/components/onboarding/ProfileSummary";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { Art } from "@/components/ui/Art";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { SwipeHint } from "@/components/ui/SwipeHint";
import { FullScreenLoader } from "@/components/ui/states";
import {
  demoProfile,
  experienceOptions,
  goalOptions,
  horizonOptions,
  knowledgeOptions,
  lifeStageOptions,
  riskOptions,
  type Option,
} from "@/data/profileOptions";
import type { ArtName } from "@/data/art";
import { useAppStore } from "@/hooks/useAppStore";
import { useSwipe } from "@/hooks/useSwipe";
import { completeOnboarding } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import { nextLesson, profileLevel } from "@/lib/personalise";
import { levelLabel } from "@/data/lessons";
import type { Profile } from "@/lib/types";

type Draft = Partial<Profile> & { name: string; amount: number };

type ChoiceKey = "experience" | "knowledge" | "lifeStage" | "goal" | "horizon" | "risk";

interface ChoiceStep {
  kind: "choice";
  key: ChoiceKey;
  label: string;
  title: string;
  subtitle: string;
  options: Option<string>[];
  grid?: boolean;
}

const STEPS: ({ kind: "welcome" | "amount" | "summary"; label: string } | ChoiceStep)[] = [
  { kind: "welcome", label: "Welcome" },
  {
    kind: "choice",
    key: "experience",
    label: "Experience",
    title: "What's your investment experience?",
    subtitle: "There's no wrong answer. This helps us pitch things at the right level.",
    options: experienceOptions,
  },
  {
    kind: "choice",
    key: "knowledge",
    label: "Knowledge",
    title: "How familiar are you with investing terms?",
    subtitle: "We'll explain things in a way that suits you.",
    options: knowledgeOptions,
  },
  {
    kind: "choice",
    key: "lifeStage",
    label: "Life stage",
    title: "Which best describes you right now?",
    subtitle: "Gen Z isn't one-size-fits-all.",
    options: lifeStageOptions,
  },
  {
    kind: "choice",
    key: "goal",
    label: "Goal",
    title: "What's your primary goal?",
    subtitle: "Giving your money a job makes investing feel real.",
    options: goalOptions,
    grid: true,
  },
  { kind: "amount", label: "Amount" },
  {
    kind: "choice",
    key: "horizon",
    label: "Timeline",
    title: "How long can your money stay invested?",
    subtitle: "Your timeline shapes which options make sense.",
    options: horizonOptions,
  },
  {
    kind: "choice",
    key: "risk",
    label: "Ups & downs",
    title: "How comfortable are you with ups & downs?",
    subtitle: "All investments move. Pick what feels comfortable.",
    options: riskOptions,
  },
  { kind: "summary", label: "Your journey" },
];

const QUESTION_COUNT = STEPS.length - 2;

const tips: Record<string, { art: ArtName; title: string; body: string }> = {
  Welcome: { art: "char-phone", title: "Takes about a minute", body: "7 quick questions to personalise what you learn and explore." },
  Experience: { art: "char-thinking", title: "Everyone starts somewhere", body: "Most of our users began with zero experience." },
  Knowledge: { art: "char-idea", title: "No jargon, promise", body: "We'll explain terms like SIP in 30 seconds or less." },
  "Life stage": { art: "char-laptop", title: "Your life, your plan", body: "A student and a new parent need very different things." },
  Goal: { art: "el-target", title: "Goals keep you going", body: "People with a clear goal are more likely to stay consistent." },
  Amount: { art: "el-coin", title: "It's okay to start small", body: "₹100 or ₹500 a month is a completely normal place to begin." },
  Timeline: { art: "el-plant", title: "Time is your superpower", body: "Longer timelines can ride out short-term ups and downs." },
  "Ups & downs": { art: "char-growth", title: "Comfort matters", body: "The best plan is one you can stick with when markets wobble." },
  "Your journey": { art: "char-celebrate", title: "Personalised for you", body: "You can change these anytime from your profile." },
};

function canAdvance(step: number, d: Draft): boolean {
  const s = STEPS[step];
  if (s.kind === "welcome") return d.name.trim().length > 0;
  if (s.kind === "choice") return !!d[s.key];
  if (s.kind === "amount") return d.amount >= 100;
  return false; // the summary finishes with an explicit button
}

export default function OnboardingPage() {
  const { state, hydrated, update } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ name: "", amount: 500 });
  const [prefilled, setPrefilled] = useState(false);
  const [dir, setDir] = useState<"next" | "prev">("next");

  const goTo = (to: number) => {
    setDir(to > step ? "next" : "prev");
    setStep(Math.max(0, Math.min(STEPS.length - 1, to)));
  };
  // mobile: swipe left to continue, right to go back
  const swipe = useSwipe({ onLeft: () => canAdvance(step, draft) && goTo(step + 1), onRight: () => step > 0 && goTo(step - 1) });

  useEffect(() => {
    if (!hydrated) return;
    if (!state.auth.isAuthed) router.replace("/login");
    else if (state.profile && !prefilled) {
      // editing preferences: start from the saved profile
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill once after hydration
      setDraft(state.profile);
      setPrefilled(true);
    }
  }, [hydrated, state.auth.isAuthed, state.profile, prefilled, router]);

  if (!hydrated || !state.auth.isAuthed) return <FullScreenLoader />;

  const current = STEPS[step];
  const isComplete = (d: Draft): d is Profile => !!(d.name && d.experience && d.knowledge && d.lifeStage && d.goal && d.amount >= 100 && d.horizon && d.risk);

  const canNext = canAdvance(step, draft);
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const finish = (profile: Profile) => {
    update((s) => completeOnboarding(s, { ...profile, name: profile.name.trim() }));
    router.replace("/home");
  };

  const tip = tips[current.label];

  return (
    <div className="min-h-full bg-white">
      <main className="flex min-h-full flex-col overflow-x-clip" {...swipe}>
        <div className="sticky top-0 z-10 bg-white/95 px-5 pb-3 pt-4 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <Logo size={24} />
            {step > 0 && step < STEPS.length - 1 && (
              <span className="text-xs font-semibold text-muted">
                Step {step} of {QUESTION_COUNT}
              </span>
            )}
          </div>
          {step > 0 && <ProgressIndicator step={Math.min(step, QUESTION_COUNT)} total={QUESTION_COUNT} />}
        </div>

        <div className={`mx-auto w-full max-w-xl flex-1 px-5 pb-32 pt-4 ${dir === "next" ? "animate-slide-next" : "animate-slide-prev"}`} key={step}>
          {current.kind === "welcome" && (
            <OnboardingStep
              title="Let's build your investing journey"
              subtitle="A personalised experience to help you learn, explore and start investing with confidence."
            >
              <div className="mb-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-ink-2">
                {[
                  ["🎬", "Learn in 30s"],
                  ["🧭", "Guided steps"],
                  ["🪙", "Start at ₹100"],
                ].map(([e, l]) => (
                  <div key={l} className="rounded-2xl bg-canvas px-2 py-4">
                    <div className="text-2xl">{e}</div>
                    <div className="mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <label htmlFor="name" className="text-sm font-semibold text-ink-2">
                What should we call you?
              </label>
              <input
                id="name"
                autoFocus
                value={draft.name}
                maxLength={24}
                placeholder="Your first name"
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && canNext && next()}
                className="mt-2 h-13 w-full rounded-xl border border-line px-4 text-[17px] font-semibold outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
              <button
                onClick={() => finish(demoProfile)}
                className="press mt-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-line p-4 text-left hover:border-brand hover:bg-brand-50/40"
              >
                <Sparkles className="size-5 shrink-0 text-brand-700" />
                <span>
                  <span className="block text-sm font-bold">Skip with the demo profile</span>
                  <span className="block text-xs text-muted">Ayaan · completely new · laptop goal · ₹500/month · 3–5 yrs · moderate risk</span>
                </span>
              </button>
            </OnboardingStep>
          )}

          {current.kind === "choice" && (
            <OnboardingStep eyebrow={current.label} title={current.title} subtitle={current.subtitle}>
              <div role="radiogroup" aria-label={current.title} className={current.grid ? "grid gap-2.5" : "space-y-2.5"}>
                {current.options.map((o) => (
                  <OptionCard
                    key={o.value}
                    label={o.label}
                    hint={o.hint}
                    emoji={o.emoji}
                    compact={current.grid}
                    selected={draft[current.key] === o.value}
                    onSelect={() => setDraft((d) => ({ ...d, [current.key]: o.value }))}
                  />
                ))}
              </div>
            </OnboardingStep>
          )}

          {current.kind === "amount" && (
            <OnboardingStep
              eyebrow="Amount"
              title="How much feels comfortable each month?"
              subtitle="Pick what fits your budget today. You can always change it later."
            >
              <AmountPicker value={draft.amount} onChange={(amount) => setDraft((d) => ({ ...d, amount }))} />
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-50/70 p-4">
                <span className="text-2xl" aria-hidden>
                  🌱
                </span>
                <p className="text-sm text-ink-2">{amountMessage(draft.amount)}</p>
              </div>
            </OnboardingStep>
          )}

          {current.kind === "summary" && isComplete(draft) && <Summary profile={draft} />}

          <div key={current.label} className="mt-8 flex animate-fade-up items-center gap-3 rounded-2xl bg-canvas p-3">
            <Art name={tip.art} className="size-14 shrink-0" />
            <div>
              <p className="text-sm font-bold">{tip.title}</p>
              <p className="text-xs leading-snug text-muted">{tip.body}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          {step > 0 && current.kind !== "summary" && <SwipeHint />}
          <div className="mx-auto flex w-full max-w-xl items-center gap-3">
            {step > 0 && (
              <Button variant="ghost" onClick={back} aria-label="Back">
                <ArrowLeft className="size-4" /> Back
              </Button>
            )}
            {current.kind === "summary" ? (
              <Button size="lg" className="ml-auto flex-1" disabled={!isComplete(draft)} onClick={() => isComplete(draft) && finish(draft)}>
                Continue to Groww <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button size="lg" className="ml-auto flex-1" disabled={!canNext} onClick={next}>
                {step === 0 ? "Get started" : "Next"} <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Reassurance that fits the chosen amount instead of one generic line. */
function amountMessage(amount: number) {
  const a = <strong>{formatINR(amount)}/month</strong>;
  if (amount <= 500) return <>{a} is a great place to start. Many mutual fund SIPs begin at just ₹100, and consistency matters more than size.</>;
  if (amount <= 1500) return <>{a} is a solid monthly habit. It&apos;s enough to start a SIP and still keep a buffer for everyday expenses.</>;
  return <>{a} is a strong commitment. You could spread it across two or three funds to diversify, and make sure your emergency savings are covered first.</>;
}

function Summary({ profile }: { profile: Profile }) {
  const lesson = nextLesson(profile, []);
  return (
    <OnboardingStep
      eyebrow="All set"
      title={`Here's your personalised investing journey, ${profile.name.trim()}`}
      subtitle="Based on your answers, this is where we'll start."
    >
      <div className="grid gap-3">
        {[
          { emoji: "🎓", label: "Your learning level", value: levelLabel[profileLevel(profile)] },
          { emoji: "🎬", label: "First lesson", value: lesson.lesson.title },
          { emoji: "🎯", label: "Your goal", value: `${formatINR(profile.amount)}/month` },
        ].map((c, i) => (
          <div key={c.label} className="animate-fade-up rounded-2xl border border-line bg-white p-4" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="text-2xl">{c.emoji}</span>
            <p className="mt-2 text-xs font-medium text-muted">{c.label}</p>
            <p className="text-sm font-bold">{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-7 text-sm font-bold text-ink-2">Your answers</h2>
      <ProfileSummary profile={profile} />
      <p className="mt-4 text-xs text-muted">
        Your answers shape what you learn. We explain investments in plain English but never recommend specific stocks or funds.
      </p>
    </OnboardingStep>
  );
}
