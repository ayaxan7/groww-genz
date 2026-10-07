"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { cn } from "@/lib/format";
import { Logo } from "../ui/Logo";
import { NotificationsButton } from "./Notifications";

export function Avatar({ size = 36 }: { size?: number }) {
  const { state } = useAppStore();
  const name = state.profile?.name ?? "You";
  return (
    <Link
      href="/profile"
      aria-label="Profile"
      className="press grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-[#5367FF] font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase()}
    </Link>
  );
}

/** Mobile header. `variant="home"` shows the brand; otherwise a title with optional back. */
export function MobileHeader({
  title,
  back,
  variant = "page",
  right,
  className,
}: {
  title?: string;
  back?: string | boolean;
  variant?: "home" | "page";
  right?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line/70 bg-white/95 px-4 backdrop-blur", className)}>
      {variant === "home" ? (
        <Logo size={24} />
      ) : (
        <>
          {back && (
            <button
              onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
              className="press -ml-2 grid size-9 place-items-center rounded-full hover:bg-line-2"
              aria-label="Go back"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <h1 className="truncate text-[17px] font-bold">{title}</h1>
        </>
      )}
      <div className="ml-auto flex items-center gap-1">
        {right ?? (
          <>
            <NotificationsButton />
            <Avatar size={32} />
          </>
        )}
      </div>
    </header>
  );
}
