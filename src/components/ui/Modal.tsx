"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/format";

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // lock the app's scroll area (the phone frame), not the browser page
    const scroller = document.getElementById("app-scroll") ?? document.body;
    const prev = scroller.style.overflow;
    scroller.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      scroller.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  // portal into the phone frame so the sheet covers the app, not the whole browser
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 animate-fade-in bg-ink/40" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn(
          "relative max-h-[90%] w-full animate-sheet-up overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] outline-none",
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        {title && (
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="press grid size-9 place-items-center rounded-full hover:bg-line-2" aria-label="Close dialog">
              <X className="size-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") ?? document.body,
  );
}
