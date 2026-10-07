import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { window.__rs = 0; const o = History.prototype.replaceState; History.prototype.replaceState = function (...a) { window.__rs++; return o.apply(this, a); }; });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, l) => console.log(`${c ? "PASS" : "FAIL"}  ${l}`);
await p.goto(BASE_URL + "/login");
await p.evaluate(() => localStorage.setItem("groww-genz:state", JSON.stringify({ version: 1, auth: { isAuthed: true, method: "google", phone: null }, profile: { name: "Ayaan", experience: "new", knowledge: "explain", lifeStage: "early-career", goal: "gadget", amount: 500, horizon: "3-5", risk: "moderate" } })));

// leftover service worker from a production run is removed in dev
await p.evaluate(() => navigator.serviceWorker.register("/sw.js"));
await sleep(800);
await p.goto(BASE_URL + "/home"); await sleep(2500);
ok((await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)) === 0, "dev removes a leftover service worker");

const touchTap = async (sel) => { const el = await p.$(sel); if (!el) return false; const bx = await el.boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(400); return true; };
await p.goto(BASE_URL + "/learn"); await sleep(1500);
const before = await p.evaluate(() => window.__rs);
// long session: watch, scroll through reels with real touch swipes, watch again
await sleep(8000);
for (let i = 0; i < 3; i++) {
  await p.touchscreen.touchStart(150, 600);
  for (let k = 1; k <= 6; k++) await p.touchscreen.touchMove(150, 600 - k * 90);
  await p.touchscreen.touchEnd();
  await sleep(1500);
}
await sleep(8000);
const after = await p.evaluate(() => window.__rs);
const active = await p.evaluate(() => new URLSearchParams(location.search).get("lesson"));
ok(after - before <= 4, `URL updated only on reel changes (${after - before} updates over ~25s, 3 swipes)`);
ok(active && active !== "sip", `touch swipes moved to another reel (now on "${active}")`);
const sel = (l) => `[data-lesson="${active}"] [aria-label="${l}"]`;
await touchTap(sel("Like")); ok(await p.$(sel("Unlike")), "touch: like works after a long session");
await touchTap(sel("Play narration")); ok(await p.$(sel("Mute narration")), "touch: unmute works");
await touchTap(sel("Mute narration"));
await touchTap(sel("Bookmark")); ok(await p.$(sel("Remove bookmark")), "touch: save works");
const t0 = Date.now(); await touchTap('nav[aria-label="Main"] a[href="/portfolio"]');
while (Date.now() - t0 < 6000 && !p.url().includes("/portfolio")) await sleep(100);
ok(p.url().includes("/portfolio"), `touch: bottom nav works (${Date.now() - t0}ms)`);
await p.goto(BASE_URL + "/learn"); await sleep(6000);
const t1 = Date.now(); await touchTap('[data-lesson="sip"] [aria-label="Back to Home"]');
while (Date.now() - t1 < 6000 && !p.url().endsWith("/home")) await sleep(100);
ok(p.url().endsWith("/home"), "touch: reel back button works after 6s of playback");
console.log("errors:", errors.length ? [...new Set(errors)].join(" | ") : "none");
await b.close();
