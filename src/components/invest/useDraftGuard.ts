"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getInstrument } from "@/data/instruments";
import { useAppStore } from "@/hooks/useAppStore";

/** Amount/review screens need a draft with a chosen instrument; otherwise restart the flow. */
export function useDraftGuard(fallback = "/invest") {
  const { state } = useAppStore();
  const router = useRouter();
  const draft = state.draft;
  const instrument = getInstrument(draft?.instrumentId);
  const ok = !!draft && !!instrument;

  useEffect(() => {
    if (!ok) router.replace(fallback);
  }, [ok, router, fallback]);

  return ok ? { draft: draft!, instrument: instrument! } : null;
}
