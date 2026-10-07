import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => {
  window.__speech = [];
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak: (u) => window.__speech.push(u.text), cancel: () => window.__speech.push("·cancel"), getVoices: () => [] } });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, l) => console.log(`${c ? "PASS" : "FAIL"}  ${l}`);
const spoken = () => p.evaluate(() => window.__speech.filter((x) => x !== "·cancel"));
const caption = (id) => p.evaluate((id) => document.querySelector(`[data-lesson="${id}"] p[aria-live]`)?.innerText, id);
const tap = async (sel) => { const el = await p.$(sel); const bx = await el.boundingBox(); await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(350); };
const swipeUp = async () => { await p.touchscreen.touchStart(150, 600); for (let k = 1; k <= 6; k++) await p.touchscreen.touchMove(150, 600 - k * 90); await p.touchscreen.touchEnd(); await sleep(1500); };
const swipeDown = async () => { await p.touchscreen.touchStart(150, 150); for (let k = 1; k <= 6; k++) await p.touchscreen.touchMove(150, 150 + k * 90); await p.touchscreen.touchEnd(); await sleep(1500); };

await p.goto(BASE_URL + "/login"); await sleep(800);
await p.evaluate(() => localStorage.setItem("groww-genz:state", JSON.stringify({ version: 1, auth: { isAuthed: true, method: "google", phone: null }, profile: { name: "Ayaan", experience: "new", knowledge: "explain", lifeStage: "early-career", goal: "gadget", amount: 500, horizon: "3-5", risk: "moderate" } })));

// 1. cold open of a Learn link: no interaction yet → "Tap for sound", nothing spoken
await p.goto(BASE_URL + "/learn"); await sleep(2000);
ok(await p.evaluate(() => document.body.innerText.includes("Tap for sound")), "cold open shows 'Tap for sound'");
ok((await spoken()).length === 0, "nothing spoken before the first interaction");
await tap('button[aria-label="Tap for sound"]'); await sleep(300);
const s1 = await spoken();
ok(s1.length > 0 && s1[0] === (await caption("sip")), `first tap starts narration ("${(s1[0] || "").slice(0, 40)}…")`);
ok(!(await p.evaluate(() => document.body.innerText.includes("Tap for sound"))), "pill disappears");
ok(await p.$('[data-lesson="sip"] button[aria-label="Mute narration"]'), "sound is on by default (button offers Mute)");

// 2. arriving by tapping (in-app navigation): sound plays immediately, no pill
await tap('nav[aria-label="Main"] a[href="/home"]'); await sleep(1500);
await p.evaluate(() => (window.__speech = []));
await tap('nav[aria-label="Main"] a[href="/learn"]'); await sleep(2000);
ok(!(await p.evaluate(() => document.body.innerText.includes("Tap for sound"))), "no pill when arriving by tap");
ok((await spoken()).length > 0, "narration starts immediately when arriving by tap");

// 3. loop: the reel restarts right after its last caption and keeps playing
const first = await caption("sip");
for (let i = 0; i < 4; i++) await tap('[data-lesson="sip"] button[aria-label="Next part"]');
await sleep(600);
if (await p.$('[data-lesson="sip"] [role="dialog"]')) await tap('[data-lesson="sip"] [role="dialog"] button[aria-label="Close"]');
await sleep(400);
ok((await caption("sip")) === first, "after the last caption the reel starts again from the beginning");
ok(await p.$('[data-lesson="sip"] button[aria-label="Pause"]'), "and keeps playing (not stopped or paused)");
const playState = await p.evaluate(() => getComputedStyle(document.querySelector('[data-lesson="sip"] .reel-progress')).animationPlayState);
ok(playState === "running", `progress bar animating again (${playState})`);
await p.evaluate(() => (window.__speech = []));
await sleep(8000); // let a caption advance on its own after the loop
ok((await caption("sip")) !== first, "loop continues to the next caption by itself");
ok((await spoken()).length > 0, "narration continues on the loop");

// 4. swiping to another reel starts it from the beginning; coming back restarts too
await tap('[data-lesson="sip"] button[aria-label="Next part"]');
const mid = await caption("sip");
await swipeUp();
const nextId = await p.evaluate(() => new URLSearchParams(location.search).get("lesson"));
const nextFirst = await p.evaluate((id) => document.querySelector(`[data-lesson="${id}"] p[aria-live]`).innerText, nextId);
ok(nextId !== "sip", `swipe moved to the next reel (${nextId})`);
ok(nextFirst && !nextFirst.includes(mid), `next reel starts at its first caption ("${nextFirst.slice(0, 40)}…")`);
await swipeDown();
ok((await caption("sip")) === first, "swiping back restarts the previous reel from the beginning");

// 5. mute stops narration and nothing new is spoken
await tap('[data-lesson="sip"] button[aria-label="Mute narration"]');
await p.evaluate(() => (window.__speech = []));
await tap('[data-lesson="sip"] button[aria-label="Next part"]'); await sleep(500);
ok((await spoken()).length === 0, "muted: next caption is not spoken");
ok(await p.$('[data-lesson="sip"] button[aria-label="Play narration"]'), "mute toggles back to 'Play narration'");
await tap('[data-lesson="sip"] button[aria-label="Play narration"]'); await sleep(300);
ok((await spoken()).length > 0, "unmute resumes narration");
console.log("errors:", errors.length ? [...new Set(errors)].join(" | ") : "none");
await b.close();
