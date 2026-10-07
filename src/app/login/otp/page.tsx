"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/ui/Button";
import { useAuthFlow } from "@/hooks/useAuthRedirect";

const DEMO_OTP = "123456";
const RESEND_SECONDS = 30;

export default function OtpPage() {
  const { state, hydrated, router, finish } = useAuthFlow();
  const phone = state.pendingPhone;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (hydrated && !phone && !state.auth.isAuthed) router.replace("/login");
  }, [hydrated, phone, state.auth.isAuthed, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = (code = otp) => {
    if (code.length < 6) {
      setError("Enter all 6 digits");
      setAttempt((a) => a + 1);
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      if (code === DEMO_OTP) {
        finish("phone", phone);
      } else {
        setVerifying(false);
        setError("That code doesn't match. Please try again.");
        setAttempt((a) => a + 1);
        setOtp("");
      }
    }, 600);
  };

  const onChange = (v: string) => {
    setOtp(v);
    setError(null);
    if (v.length === 6) verify(v);
  };

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setOtp("");
    setError(null);
    setResent(true);
  };

  const masked = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "";

  return (
    <AuthLayout>
      <div className="mt-6 animate-fade-up">
        <button
          onClick={() => router.push("/login")}
          className="press -ml-2 flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-muted hover:text-ink"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <h1 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight">Verify your number</h1>
        <p className="mt-2 text-muted">
          Enter the 6-digit code sent to <span className="font-semibold text-ink tabular">{masked}</span>
        </p>

        <div className="mt-8">
          <OtpInput key={attempt} value={otp} onChange={onChange} error={!!error} disabled={verifying} />
          <div className="mt-3 min-h-5" aria-live="polite">
            {error && (
              <p role="alert" className="text-sm font-medium text-down">
                {error}
              </p>
            )}
            {!error && resent && seconds > RESEND_SECONDS - 4 && <p className="text-sm font-medium text-brand-700">New code sent (demo).</p>}
          </div>
        </div>

        <Button size="lg" full className="mt-4" onClick={() => verify()} loading={verifying} disabled={otp.length < 6 && !error}>
          Verify &amp; continue
        </Button>

        <div className="mt-5 text-center text-sm text-muted">
          {seconds > 0 ? (
            <span>
              Resend code in <span className="font-semibold text-ink tabular">0:{String(seconds).padStart(2, "0")}</span>
            </span>
          ) : (
            <button onClick={resend} className="font-semibold text-brand-700 hover:underline">
              Resend OTP
            </button>
          )}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-dashed border-brand/40 bg-brand-50/60 p-3 text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" />
          <p className="text-ink-2">
            <strong>Demo mode:</strong> no SMS is sent. Use code <span className="font-bold tracking-widest tabular">{DEMO_OTP}</span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
