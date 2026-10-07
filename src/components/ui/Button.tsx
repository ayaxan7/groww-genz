import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-600 disabled:bg-brand/40",
  dark: "bg-ink text-white hover:bg-ink-2 disabled:bg-ink/40",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline: "border border-line bg-white text-ink hover:border-ink/30 hover:bg-canvas",
  ghost: "text-ink-2 hover:bg-line-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-[15px] rounded-xl gap-2",
  lg: "h-13 px-6 text-base rounded-2xl gap-2",
};

interface Common {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function buttonClass({ variant = "primary", size = "md", full, className }: Omit<Common, "children">) {
  return cn(
    "press inline-flex select-none items-center justify-center font-semibold whitespace-nowrap disabled:cursor-not-allowed",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}

export function Button({ variant, size, full, className, loading, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass({ variant, size, full, className })} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ href, variant, size, full, className, children }: Common & { href: string }) {
  return (
    <Link href={href} className={buttonClass({ variant, size, full, className })}>
      {children}
    </Link>
  );
}
