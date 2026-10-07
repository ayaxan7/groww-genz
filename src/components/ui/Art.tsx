/* eslint-disable @next/next/no-img-element -- small static PNGs from public/art */
import type { CSSProperties } from "react";
import type { ArtName } from "@/data/art";
import { cn } from "@/lib/format";

/** Renders one of the supplied 3D character / element illustrations. */
export function Art({ name, className, alt = "", style }: { name: ArtName; className?: string; alt?: string; style?: CSSProperties }) {
  return <img src={`/art/${name}.png`} alt={alt} draggable={false} style={style} className={cn("pointer-events-none select-none object-contain", className)} />;
}
