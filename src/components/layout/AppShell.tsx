"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { FullScreenLoader } from "../ui/states";
import { BottomNav } from "./BottomNav";

/** Authenticated mobile app chrome + route guard (auth → onboarding → app). */
export function AppShell({ children }: { children: ReactNode }) {
  const { state, hydrated } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const ready = hydrated && state.auth.isAuthed && !!state.profile;
  const focusedFlow = pathname.startsWith("/invest");

  useEffect(() => {
    if (!hydrated) return;
    if (!state.auth.isAuthed) router.replace("/login");
    else if (!state.profile) router.replace("/onboarding");
  }, [hydrated, state.auth.isAuthed, state.profile, router]);

  if (!ready) return <FullScreenLoader />;

  return (
    <>
      <main className={focusedFlow ? "min-h-full" : "min-h-full pb-[calc(72px+env(safe-area-inset-bottom))]"}>{children}</main>
      {!focusedFlow && <BottomNav />}
    </>
  );
}
