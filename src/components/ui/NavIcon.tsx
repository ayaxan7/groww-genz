import type { SVGProps } from "react";

/**
 * Inline versions of the supplied navigation icons (public/icons/*.svg),
 * rendered with currentColor so they can reflect active/inactive states.
 */
const paths = {
  // redrawn symmetric around x=16 (the supplied path had an off-centre roof)
  home: (
    <>
      <path d="m5 13 11-9 11 9" />
      <path d="M8 11v14a1 1 0 0 0 1 1h5v-7h4v7h5a1 1 0 0 0 1-1V11" />
    </>
  ),
  explore: (
    <>
      <circle cx="13" cy="13" r="8" />
      <path d="m19 19 6 6" />
    </>
  ),
  learn: (
    <>
      <path d="M4 6h24v16H4z" />
      <path d="m10 10 12 4-12 4z" />
    </>
  ),
  goal: (
    <>
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="5" />
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4" />
    </>
  ),
  portfolio: (
    <>
      <path d="M4 7h24v18H4z" />
      <path d="M10 7V5h12v2" />
    </>
  ),
  bookmark: <path d="M7 4h18v25l-9-6-9 6z" />,
  share: (
    <>
      <circle cx="7" cy="16" r="3" />
      <circle cx="25" cy="7" r="3" />
      <circle cx="25" cy="25" r="3" />
      <path d="m10 15 12-7M10 17l12 7" />
    </>
  ),
} as const;

export type NavIconName = keyof typeof paths;

export function NavIcon({ name, size = 22, strokeWidth = 1.8, ...rest }: { name: NavIconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
