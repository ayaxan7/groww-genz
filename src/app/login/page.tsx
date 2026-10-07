"use client";

import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/Button";
import { useAuthFlow } from "@/hooks/useAuthRedirect";
import { setPendingPhone } from "@/lib/actions";
import { cn } from "@/lib/format";
import type { AuthMethod } from "@/lib/types";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function LoginPage() {
  const { update, router, finish } = useAuthFlow();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState<AuthMethod | null>(null);

  const valid = PHONE_RE.test(phone);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) {
      setError(phone.length < 10 ? "Enter your 10-digit mobile number" : "Indian mobile numbers start with 6, 7, 8 or 9");
      return;
    }
    setPending("phone");
    update((s) => setPendingPhone(s, phone));
    router.push("/login/otp");
  };

  const social = (method: AuthMethod) => {
    setPending(method);
    // simulate a short provider round-trip; no real OAuth happens
    setTimeout(() => finish(method), 700);
  };

  return (
    <AuthLayout>
      <div className="mt-10 animate-fade-up">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">Let&apos;s get you started</h1>
        <p className="mt-2 text-muted">Log in or sign up with your mobile number.</p>

        <form onSubmit={submit} className="mt-8" noValidate>
          <label htmlFor="phone" className="text-sm font-semibold text-ink-2">
            Mobile number
          </label>
          <div
            className={cn(
              "mt-2 flex h-13 items-center rounded-xl border bg-white transition focus-within:ring-4",
              touched && error ? "border-down focus-within:ring-down/10" : "border-line focus-within:border-brand focus-within:ring-brand/10",
            )}
          >
            <span className="flex h-full items-center gap-1.5 border-r border-line px-3.5 text-[15px] font-semibold text-ink-2">
              <span aria-hidden>🇮🇳</span> +91
            </span>
            <input
              id="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError(null);
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "phone-error" : undefined}
              className="h-full w-full bg-transparent px-3.5 text-[17px] font-semibold tracking-wide tabular outline-none placeholder:font-normal placeholder:text-subtle"
            />
          </div>
          {error && (
            <p id="phone-error" role="alert" className="mt-2 text-sm font-medium text-down">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" full className="mt-5" loading={pending === "phone"} disabled={!!pending && pending !== "phone"}>
            Continue
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-medium text-subtle">
          <span className="h-px flex-1 bg-line" /> or continue with <span className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-3">
          <SocialButton
            icon="/brand/google-g.svg"
            label="Continue with Google"
            onClick={() => social("google")}
            loading={pending === "google"}
            disabled={!!pending}
          />
          <SocialButton
            icon="/brand/chatgpt-mark.svg"
            label="Continue with ChatGPT"
            onClick={() => social("chatgpt")}
            loading={pending === "chatgpt"}
            disabled={!!pending}
          />
        </div>

        <p className="mt-6 rounded-xl bg-canvas p-3 text-xs leading-relaxed text-muted">
          <strong className="text-ink-2">Prototype:</strong> sign-in is simulated. No Google or OpenAI account is connected, no SMS is sent and no data leaves
          your browser.
        </p>
        <p className="mt-4 text-center text-xs text-subtle">By continuing you agree this is a demo case study, not a real brokerage.</p>
      </div>
    </AuthLayout>
  );
}
