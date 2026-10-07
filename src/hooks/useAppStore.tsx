"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { STATE_VERSION, createSeedState } from "@/lib/seed";
import { STORAGE_KEY, loadJSON, saveJSON } from "@/lib/storage";
import type { AppState } from "@/lib/types";

type Updater = (s: AppState) => AppState;

interface Store {
  state: AppState;
  hydrated: boolean;
  /** Apply a pure transition from `lib/actions`. */
  update: (fn: Updater) => void;
  /** Synchronously read the latest state (useful right after an update). */
  getState: () => AppState;
  replace: (next: AppState) => void;
}

const StoreContext = createContext<Store | null>(null);

function loadInitial(): AppState {
  const saved = loadJSON<AppState>(STORAGE_KEY);
  if (saved && saved.version === STATE_VERSION) return { ...createSeedState(), ...saved };
  return createSeedState();
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createSeedState(false));
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(state);

  useEffect(() => {
    const initial = loadInitial();
    ref.current = initial;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setState(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(STORAGE_KEY, state);
  }, [state, hydrated]);

  // keep tabs in sync (e.g. reset demo in another tab)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = loadInitial();
      ref.current = next;
      setState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: Updater) => {
    const next = fn(ref.current);
    if (next === ref.current) return;
    ref.current = next;
    setState(next);
  }, []);

  const replace = useCallback((next: AppState) => {
    ref.current = next;
    setState(next);
    saveJSON(STORAGE_KEY, next);
  }, []);

  const getState = useCallback(() => ref.current, []);

  const value = useMemo(() => ({ state, hydrated, update, getState, replace }), [state, hydrated, update, getState, replace]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
