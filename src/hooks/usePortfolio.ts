"use client";

import { useMemo } from "react";
import { getInstrument } from "@/data/instruments";
import type { Holding, Instrument } from "@/lib/types";
import { useAppStore } from "./useAppStore";

export interface HoldingRow extends Holding {
  instrument: Instrument;
  pl: number;
  plPct: number;
  todayChange: number;
}

export function usePortfolio() {
  const { state } = useAppStore();
  return useMemo(() => {
    const rows: HoldingRow[] = state.holdings
      .map((h) => {
        const instrument = getInstrument(h.instrumentId);
        if (!instrument) return null;
        const pl = h.current - h.invested;
        // Mock daily move: the instrument's daily change applied to the held value.
        const todayChange = h.current - h.current / (1 + instrument.changePct / 100);
        return { ...h, instrument, pl, plPct: h.invested ? (pl / h.invested) * 100 : 0, todayChange };
      })
      .filter((r): r is HoldingRow => r !== null);

    const current = rows.reduce((a, r) => a + r.current, 0);
    const invested = rows.reduce((a, r) => a + r.invested, 0);
    const today = rows.reduce((a, r) => a + r.todayChange, 0);
    const returns = current - invested;
    return {
      rows,
      current,
      invested,
      returns,
      returnsPct: invested ? (returns / invested) * 100 : 0,
      today,
      todayPct: current ? (today / (current - today)) * 100 : 0,
      isEmpty: rows.length === 0,
    };
  }, [state.holdings]);
}
