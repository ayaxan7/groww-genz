const COLORS = ["#00D09C", "#5367FF", "#FFB547", "#FF7A8A", "#9B7BFF"];

/** Lightweight CSS confetti. Deterministic layout, hidden for reduced motion. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }).map((_, i) => {
        const left = (i * 37) % 100;
        const dx = ((i * 53) % 120) - 60;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                left: `${left}%`,
                background: COLORS[i % COLORS.length],
                animationDelay: `${(i % 9) * 70}ms`,
                "--dx": `${dx}px`,
                "--rot": `${360 + ((i * 97) % 360)}deg`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
