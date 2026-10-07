// Turns the supplied reel cover placeholders into text-free covers with a topic
// illustration, so the in-app reel overlay can render titles/captions itself.
// Usage: node scripts/build-reel-covers.mjs <source-reels-dir>
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const src = process.argv[2];
const out = new URL("../public/reels/", import.meta.url).pathname;
const F = 'font-family="Inter, Arial, Helvetica, sans-serif"';
const G = "#00D09C";

const art = {
  "01-sip": () => {
    const bars = [140, 210, 290, 370, 460, 560];
    return `
      <g>${bars
        .map((h, i) => {
          const x = 190 + i * 125;
          return `<rect x="${x}" y="${1010 - h}" width="86" height="${h}" rx="18" fill="${G}" opacity="${0.35 + i * 0.13}"/>
          <circle cx="${x + 43}" cy="${975 - h}" r="30" fill="#FFC94A" stroke="#E9A912" stroke-width="6"/>
          <text x="${x + 43}" y="${986 - h}" text-anchor="middle" ${F} font-size="30" font-weight="700" fill="#8A5A00">₹</text>`;
        })
        .join("")}</g>
      <path d="M200 860 C 420 820, 620 640, 900 380" fill="none" stroke="#111827" stroke-width="6" stroke-dasharray="14 14" stroke-linecap="round"/>
      <rect x="170" y="1050" width="740" height="4" rx="2" fill="#CBD5E1"/>
      <rect x="170" y="300" width="300" height="84" rx="42" fill="#fff"/>
      <text x="320" y="355" text-anchor="middle" ${F} font-size="36" font-weight="700" fill="#111827">₹500 / month</text>`;
  },
  "02-diversification": () => {
    const C = 2 * Math.PI * 230;
    const segs = [
      [0.35, G],
      [0.25, "#5B8DEF"],
      [0.2, "#FFB547"],
      [0.2, "#9B7BFF"],
    ];
    let acc = 0;
    const rings = segs
      .map(([p, c]) => {
        const s = `<circle cx="540" cy="700" r="230" fill="none" stroke="${c}" stroke-width="120" stroke-dasharray="${p * C - 10} ${C}" stroke-dashoffset="${-acc * C}" transform="rotate(-90 540 700)"/>`;
        acc += p;
        return s;
      })
      .join("");
    return `${rings}
      <circle cx="540" cy="700" r="150" fill="#fff"/>
      <text x="540" y="690" text-anchor="middle" ${F} font-size="44" font-weight="800" fill="#111827">4 baskets</text>
      <text x="540" y="745" text-anchor="middle" ${F} font-size="32" fill="#64748B">not 1</text>`;
  },
  "03-cagr": () => `
      <rect x="160" y="320" width="760" height="720" rx="40" fill="#fff"/>
      <path d="M230 940 L300 880 L360 910 L430 790 L500 830 L570 700 L640 760 L710 600 L780 640 L850 470" fill="none" stroke="#94A3B8" stroke-width="7" stroke-linejoin="round" stroke-dasharray="2 0"/>
      <path d="M230 940 C 450 900, 650 720, 850 470" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="230" cy="940" r="18" fill="#111827"/><circle cx="850" cy="470" r="18" fill="${G}"/>
      <text x="230" y="1010" text-anchor="middle" ${F} font-size="32" font-weight="700" fill="#111827">₹10,000</text>
      <text x="830" y="420" text-anchor="middle" ${F} font-size="32" font-weight="700" fill="#111827">₹16,105</text>
      <rect x="220" y="370" width="270" height="70" rx="35" fill="#E6FAF5"/>
      <text x="355" y="417" text-anchor="middle" ${F} font-size="32" font-weight="700" fill="#00A47C">10% CAGR</text>`,
  "04-risk": () => `
      <rect x="160" y="320" width="760" height="720" rx="40" fill="#fff"/>
      <path d="M240 960 H860 M240 960 V400" stroke="#111827" stroke-width="6" stroke-linecap="round"/>
      <path d="M270 920 C 450 860, 650 660, 830 440" fill="none" stroke="#CBD5E1" stroke-width="5" stroke-dasharray="12 12"/>
      <circle cx="310" cy="900" r="34" fill="#93C5FD"/><circle cx="460" cy="810" r="44" fill="#86EFAC"/>
      <circle cx="610" cy="680" r="54" fill="${G}"/><circle cx="780" cy="500" r="66" fill="#FCA5A5"/>
      <text x="550" y="1010" text-anchor="middle" ${F} font-size="30" font-weight="600" fill="#64748B">Risk →</text>
      <text x="205" y="680" text-anchor="middle" ${F} font-size="30" font-weight="600" fill="#64748B" transform="rotate(-90 205 680)">Return →</text>`,
  "05-etf": () => {
    const dots = [
      [360, 560, G, "R"], [470, 520, "#5B8DEF", "T"], [580, 540, "#FFB547", "H"], [690, 560, "#9B7BFF", "I"],
      [410, 640, "#F472B6", "L"], [530, 620, "#22D3EE", "M"], [650, 640, "#111827", "A"],
    ];
    return `${dots
      .map(([x, y, c, l]) => `<circle cx="${x}" cy="${y}" r="52" fill="${c}"/><text x="${x}" y="${y + 16}" text-anchor="middle" ${F} font-size="44" font-weight="800" fill="#fff">${l}</text>`)
      .join("")}
      <path d="M250 660 H830 L770 1000 H310 Z" fill="#fff" stroke="#111827" stroke-width="8" stroke-linejoin="round"/>
      <path d="M300 760 H780 M320 860 H760" stroke="#E2E8F0" stroke-width="8"/>
      <text x="540" y="950" text-anchor="middle" ${F} font-size="40" font-weight="800" fill="#111827">1 ETF = many companies</text>`;
  },
  "06-goal": () => `
      <circle cx="540" cy="680" r="290" fill="#fff"/>
      <circle cx="540" cy="680" r="290" fill="none" stroke="#E2E8F0" stroke-width="30"/>
      <circle cx="540" cy="680" r="290" fill="none" stroke="${G}" stroke-width="30" stroke-linecap="round" stroke-dasharray="${0.15 * 2 * Math.PI * 290} 9999" transform="rotate(-90 540 680)"/>
      <circle cx="540" cy="680" r="200" fill="#FEE2E2"/><circle cx="540" cy="680" r="130" fill="#fff"/><circle cx="540" cy="680" r="60" fill="#F87171"/>
      <path d="M760 460 L560 660" stroke="#111827" stroke-width="12" stroke-linecap="round"/>
      <path d="M760 460 l10 -60 l40 30 z M760 460 l60 -10 l-30 40 z" fill="${G}"/>
      <rect x="290" y="1030" width="500" height="80" rx="40" fill="#fff"/>
      <text x="540" y="1083" text-anchor="middle" ${F} font-size="34" font-weight="700" fill="#111827">₹1,500 / ₹10,000</text>`,
};

for (const file of readdirSync(src).filter((f) => f.endsWith(".svg"))) {
  const key = file.replace(".svg", "");
  const raw = readFileSync(join(src, file), "utf8");
  // keep the supplied background + decorative circles, drop baked-in text & pill
  const keep = raw
    .split("\n")
    .filter((l) => /^<(svg|circle)/.test(l) || /^<rect width="1080"/.test(l))
    .map((l) => l.replace(' rx="56"', ""))
    .join("\n");
  writeFileSync(join(out, file), `${keep}\n${art[key]?.() ?? ""}\n</svg>\n`);
  console.log("wrote", file);
}
