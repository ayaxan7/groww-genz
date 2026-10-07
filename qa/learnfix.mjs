import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const W = Number(process.argv[2] || 390);
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.setViewport({ width: W, height: W < 600 ? 844 : 900, isMobile: W < 600, hasTouch: W < 600 });
await p.evaluateOnNewDocument(() => { window.__rs = 0; const o = History.prototype.replaceState; History.prototype.replaceState = function (...a) { window.__rs++; return o.apply(this, a); }; });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, l) => console.log(`${c ? "PASS" : "FAIL"}  ${l}`);
const seed = async () => {
  await p.goto(BASE_URL + "/login");
  await sleep(800); // let the app finish starting before overwriting its storage
  await p.evaluate(() => { const y = new Date(); y.setDate(y.getDate() - 1); const k = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
    localStorage.setItem("groww-genz:state", JSON.stringify({ version: 1, auth: { isAuthed: true, method: "google", phone: null }, profile: { name: "Ayaan", experience: "new", knowledge: "explain", lifeStage: "early-career", goal: "gadget", amount: 500, horizon: "3-5", risk: "moderate" }, learning: { completed: [], liked: [], bookmarked: [], streak: 5, lastActiveDate: k, points: 120 } })); });
  await p.reload();
  await sleep(500);
};
const tap = async (sel) => { const el = await p.$(sel); if (!el) return false; const bx = await el.boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(400); return true; };
const blocked = async (sel) => p.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return "missing"; const r = el.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el.contains(h) ? "" : h?.className?.toString().slice(0, 60); }, sel);
const navTo = async (href) => { const t0 = Date.now(); await tap(`nav[aria-label="Main"] a[href="${href}"]`); while (Date.now() - t0 < 6000 && !p.url().includes(href)) await sleep(100); return p.url().includes(href); };

await seed();
await p.goto(BASE_URL + "/explore"); await p.goto(BASE_URL + "/home"); await sleep(1000); // warm routes
await p.goto(BASE_URL + "/learn"); await sleep(2500);
const r0 = await p.evaluate(() => window.__rs); await sleep(2000); const r1 = await p.evaluate(() => window.__rs);
ok(r1 - r0 === 0, `no URL update loop while idle (+${r1 - r0} in 2s, ${r0} on load)`);
for (const lbl of ["Like", "Bookmark", "Share", "Quiz me on this", "Mute narration", "Back to Home"]) {
  const b2 = await blocked(`[data-lesson="sip"] [aria-label="${lbl}"]`);
  ok(b2 === "", `"${lbl}" not covered${b2 ? ` (covered by ${b2})` : ""}`);
}
await tap('[data-lesson="sip"] button[aria-label="Like"]');
ok(await p.$('[data-lesson="sip"] button[aria-label="Unlike"]'), "like works while playing");
await tap('[data-lesson="sip"] button[aria-label="Mute narration"]');
ok(await p.$('[data-lesson="sip"] button[aria-label="Play narration"]'), "mute toggle works while playing");
ok(await navTo("/explore"), "bottom nav works while a reel plays");
await p.goto(BASE_URL + "/learn"); await sleep(2000);
await tap('[data-lesson="sip"] button[aria-label="Pause"]');
ok(await p.$('[data-lesson="sip"] button[aria-label="Play"]'), "centre tap pauses");
const t0 = Date.now(); await tap('[data-lesson="sip"] button[aria-label="Back to Home"]');
while (Date.now() - t0 < 6000 && !p.url().endsWith("/home")) await sleep(100);
ok(p.url().endsWith("/home"), "reel back button works");

// completion: first reel today → celebration card; second reel → toast only
await p.goto(BASE_URL + "/learn"); await sleep(2000);
for (let i = 0; i < 4; i++) await tap('[data-lesson="sip"] button[aria-label="Next part"]');
await sleep(500);
ok(await p.evaluate(() => document.body.innerText.includes("You learned something new today")), "milestone card on first reel of the day");
ok(await p.evaluate(() => document.body.innerText.includes("Quiz me (1)")), "card offers quiz on what was learned");
await tap('[data-lesson="sip"] [role="dialog"] button[aria-label="Close"]');
ok(!(await p.$('[data-lesson="sip"] [role="dialog"]')), "card can be dismissed");
ok(await navTo("/goals"), "bottom nav works after a reel completes");
await p.goto(BASE_URL + "/learn?lesson=goal"); await sleep(2500);
for (let i = 0; i < 4; i++) await tap('[data-lesson="goal"] button[aria-label="Next part"]');
await sleep(500);
const second = await p.evaluate(() => ({ card: !!document.querySelector('[data-lesson="goal"] [role="dialog"]'), toast: document.body.innerText.includes("Watched · +10 pts") }));
ok(!second.card && second.toast, `2nd reel shows a toast, not the card (card=${second.card}, toast=${second.toast})`);
ok(await navTo("/home"), "bottom nav works after second reel");

// curated quiz
await p.goto(BASE_URL + "/learn/quiz"); await sleep(1500);
const qt = await p.evaluate(() => document.body.innerText);
ok(qt.includes("From the 2 lessons you've watched"), "quiz curated from watched lessons");
ok(qt.includes("1/3"), "quiz has the 3 questions from SIP + goal lessons");
console.log("errors:", errors.length ? [...new Set(errors)].join(" | ") : "none");
await b.close();
