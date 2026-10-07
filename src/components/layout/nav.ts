import type { NavIconName } from "../ui/NavIcon";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
}

/** Five primary destinations. Profile lives behind the avatar in the header. */
export const bottomNav: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/goals", label: "Goals", icon: "goal" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
];

export function isActive(pathname: string, href: string) {
  if (href === "/explore") return pathname.startsWith("/explore") || pathname.startsWith("/compare");
  return pathname === href || pathname.startsWith(`${href}/`);
}
