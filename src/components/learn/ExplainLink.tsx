"use client";

import Link from "next/link";
import { useState } from "react";
import { PlayCircle, Sparkles } from "lucide-react";
import { concepts, type ConceptId } from "@/data/concepts";
import { cn } from "@/lib/format";
import { buttonClass } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { ConceptVisual } from "./ConceptVisual";

/**
 * Learning embedded in context: a small "question · Explain simply →" link that
 * opens a visual explanation, with an optional jump to the full 30-sec reel.
 */
export function ExplainLink({ concept, label, cta = "Explain simply", className }: { concept: ConceptId; label?: string; cta?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const c = concepts[concept];
  return (
    <>
      <button onClick={() => setOpen(true)} className={cn("inline-flex items-center gap-1.5 text-left text-sm text-muted hover:text-ink", className)}>
        <Sparkles className="size-4 shrink-0 text-brand-700" />
        <span>
          {label ?? c.question} <span className="font-semibold text-brand-700">{cta} →</span>
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={c.title}>
        <ConceptVisual id={concept} />
        <p className="mt-5 text-[15px] font-semibold leading-snug">{c.takeaway}</p>
        {c.lessonId && (
          <Link
            href={`/learn?lesson=${c.lessonId}`}
            onClick={() => setOpen(false)}
            className={buttonClass({ variant: "secondary", full: true, className: "mt-5" })}
          >
            <PlayCircle className="size-4" /> Watch the 30-sec reel
          </Link>
        )}
      </Modal>
    </>
  );
}
