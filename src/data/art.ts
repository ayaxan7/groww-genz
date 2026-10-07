import type { GoalType } from "@/lib/types";

/** 3D character + element art cropped from the supplied visual reference pack (public/art). */
export type ArtName =
  | "char-phone"
  | "char-coins"
  | "char-idea"
  | "char-growth"
  | "char-laptop"
  | "char-celebrate"
  | "char-thinking"
  | "char-insight"
  | "char-saving"
  | "el-coin"
  | "el-arrow"
  | "el-piggy"
  | "el-laptop"
  | "el-plant"
  | "el-target"
  | "el-cap"
  | "el-bulb"
  | "el-wallet";

export const lessonArt: Record<string, ArtName> = {
  sip: "char-coins",
  diversification: "char-insight",
  cagr: "char-growth",
  "risk-return": "char-thinking",
  etf: "char-idea",
  goal: "char-laptop",
  "sip-vs-lumpsum": "char-saving",
  "index-vs-active": "char-phone",
  "pe-valuation": "char-insight",
  rebalancing: "char-growth",
  "capital-gains-tax": "char-idea",
  drawdowns: "char-thinking",
};

export const goalArt: Record<GoalType, ArtName> = {
  gadget: "el-laptop",
  education: "el-cap",
  emergency: "el-wallet",
  wealth: "el-plant",
  retirement: "el-piggy",
  travel: "el-piggy",
  other: "el-target",
};
