"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { formatINR } from "@/lib/format";

export function CountUpINR({ value, className }: { value: number; className?: string }) {
  const v = useCountUp(value);
  return <span className={`tabular ${className ?? ""}`}>{formatINR(v)}</span>;
}
