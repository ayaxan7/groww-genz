/* eslint-disable @next/next/no-img-element -- static SVG brand marks */
import { Loader2 } from "lucide-react";

export function SocialButton({
  icon,
  label,
  onClick,
  loading,
  disabled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="press flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white text-[15px] font-semibold text-ink hover:border-ink/30 hover:bg-canvas disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : <img src={icon} alt="" width={22} height={22} />}
      {label}
      <span className="rounded-md bg-line-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Demo</span>
    </button>
  );
}
