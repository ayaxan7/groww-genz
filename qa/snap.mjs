// usage: node snap.mjs "<route,route>" "<w,w>" prefix
import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const [routes, widths, prefix = "s"] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.setViewport({ width: 390, height: 844 });
await p.goto(BASE_URL + "/login");
await p.evaluate(() => {
  const today = new Date(); const y = new Date(today); y.setDate(y.getDate() - 1);
  const k = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const pm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  localStorage.setItem("groww-genz:state", JSON.stringify({
    version: 1, auth: { isAuthed: true, method: "google", phone: null },
    profile: { name: "Ayaan", experience: "new", knowledge: "explain", lifeStage: "early-career", goal: "gadget", amount: 500, horizon: "3-5", risk: "moderate" },
    learning: { completed: [], liked: [], bookmarked: [], streak: 5, lastActiveDate: k(y), points: 120 },
    goals: [{ id: "g1", type: "gadget", name: "Laptop / Gadget", target: 10000, saved: 1500, monthly: 500, horizon: "3-5", createdAt: today.toISOString() }],
    investingStreak: 2, lastInvestMonth: `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}`,
  }));
});
for (const w of widths.split(",").map(Number)) {
  await p.setViewport({ width: w, height: w < 600 ? 844 : 900, isMobile: w < 600, hasTouch: w < 600 });
  for (const r of routes.split(",")) {
    await p.goto(BASE_URL + r); await new Promise((res) => setTimeout(res, 1800));
    const of = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (of > 1) console.log(`OVERFLOW ${of}px @${w} ${r}`);
    await p.screenshot({ path: `shots/${prefix}-${w}${r.replaceAll("/", "_").replaceAll("?", "_")}.png` });
  }
}
console.log("errors:", errors.length ? [...new Set(errors)].join("\n") : "none");
await b.close();
