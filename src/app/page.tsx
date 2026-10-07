"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useAppStore } from "@/hooks/useAppStore";
import { cn } from "@/lib/format";

/** Launch screen: ~1s brand moment with the supplied hero character, then route based on saved state. */
export default function SplashPage() {
  const { state, hydrated } = useAppStore();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const dest = !state.auth.isAuthed ? "/login" : !state.profile ? "/onboarding" : "/home";
    const t1 = setTimeout(() => setLeaving(true), 800);
    const t2 = setTimeout(() => router.replace(dest), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hydrated, state.auth.isAuthed, state.profile, router]);

  return (
    <div className={cn("flex min-h-full flex-col items-center bg-white px-6 pb-10 pt-16 transition-opacity duration-250", leaving && "opacity-0")}>
      <div className="splash-logo flex flex-col items-center text-center">
        <Logo size={40} />
        <p className="mt-6 text-[26px] font-extrabold leading-tight tracking-tight">
          Investing
          <br />
          made simple
        </p>
      </div>
      <div className="splash-logo mt-10 w-full max-w-[300px] overflow-hidden rounded-[36px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- supplied reference art */}
        <img src="/art/scene-splash.png" alt="" className="block w-full" />
      </div>
      <p className="mt-auto pt-8 text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">Gen Z edition · Prototype</p>
    </div>
  );
}
