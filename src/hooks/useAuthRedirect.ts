"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { login } from "@/lib/actions";
import type { AuthMethod } from "@/lib/types";
import { useAppStore } from "./useAppStore";

/** Shared auth completion + "already signed in" redirect for auth screens. */
export function useAuthFlow() {
  const store = useAppStore();
  const router = useRouter();
  const { hydrated, state } = store;

  useEffect(() => {
    if (hydrated && state.auth.isAuthed) router.replace(state.profile ? "/home" : "/onboarding");
  }, [hydrated, state.auth.isAuthed, state.profile, router]);

  const finish = useCallback(
    (method: AuthMethod, phone: string | null = null) => {
      store.update((s) => login(s, method, phone));
    },
    [store],
  );

  return { ...store, router, finish };
}
