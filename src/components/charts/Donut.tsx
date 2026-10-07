export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function Donut({ slices, size = 140, stroke = 22 }: { slices: DonutSlice[]; size?: number; stroke?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const lengths = slices.map((s) => (s.value / total) * c);
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} className="-rotate-90 shrink-0" role="img" aria-label="Allocation chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line-2)" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(0, lengths[i] - 2)} ${c}`}
            strokeDashoffset={-offsets[i]}
          />
        ))}
      </svg>
      <ul className="space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-ink-2">{s.label}</span>
            <span className="ml-auto pl-4 font-semibold tabular">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
