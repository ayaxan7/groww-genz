"use client";

import { useEffect } from "react";

/**
 * Registers the offline-capable service worker in production builds. In development it
 * removes any worker left over from a production run, so the dev server is never shadowed
 * by cached files.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      if ("caches" in window) caches.keys().then((keys) => keys.filter((k) => k.startsWith("groww-genz")).forEach((k) => caches.delete(k)));
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // offline support is a progressive enhancement; ignore failures
    });
  }, []);
  return null;
}
