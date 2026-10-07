"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { NavIcon } from "../ui/NavIcon";
import { bottomNav, isActive } from "./nav";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className={cn("fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)]", "border-hairline bg-white/95 backdrop-blur")}
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {bottomNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold",
                  active ? "text-brand-700" : "text-muted",
                )}
              >
                <NavIcon name={item.icon} size={22} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
