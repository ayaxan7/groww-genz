"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/format";

/** Six segmented digit inputs with auto-advance, backspace navigation and paste support. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setAt = (i: number, d: string) => {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, length));
  };

  const handleInput = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;
    if (clean.length > 1) {
      // autofill/paste into a single box
      const merged = (digits.slice(0, i).join("") + clean).slice(0, length);
      onChange(merged);
      focus(merged.length);
      return;
    }
    setAt(i, clean);
    focus(i + 1);
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div className={cn("flex justify-between gap-2", error && "animate-shake")} role="group" aria-label="One-time password">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "aspect-square w-full min-w-0 max-w-14 rounded-xl border bg-white text-center text-2xl font-bold tabular outline-none transition",
            "focus:ring-4",
            error
              ? "border-down text-down focus:ring-down/10"
              : d
                ? "border-ink/40 focus:border-brand focus:ring-brand/10"
                : "border-line focus:border-brand focus:ring-brand/10",
          )}
        />
      ))}
    </div>
  );
}
