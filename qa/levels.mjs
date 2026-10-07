// Checks that the Learn feed adapts to the learner's level (beginner / intermediate / advanced),
// levels up after finishing a level, and still opens linked lessons outside the level.
import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ok = (c, l) => console.log(`${c ? "PASS" : "FAIL"}  ${l}`);
const LEVEL = { sip: 1, diversification: 1, "risk-return": 1, goal: 1, cagr: 2, etf: 2, "sip-vs-lumpsum": 2, "index-vs-active": 2, "pe-valuation": 3, rebalancing: 3, "capital-gains-tax": 3, drawdowns: 3 };

async function seed(profile, completed = []) {
  await p.goto(BASE_URL + "/login"); await sleep(700);
  await p.evaluate((profile, completed) => localStorage.setItem("groww-genz:state", JSON.stringify({ version: 1, auth: { isAuthed: true, method: "google", phone: null }, profile: { name: "Test", goal: "gadget", amount: 500, horizon: "3-5", risk: "moderate", lifeStage: "early-career", ...profile }, learning: { completed, liked: [], bookmarked: [], streak: 1, lastActiveDate: null, points: 0 } })), profile, completed);
  await p.reload(); await sleep(400);
}
async function feed(url = "/learn") {
  await p.goto(BASE_URL + url); await sleep(1800);
  return p.evaluate(() => [...document.querySelectorAll("[data-lesson]")].map((s) => s.dataset.lesson));
}
const levels = (ids) => ids.map((id) => LEVEL[id]).join("");

// Beginner: completely new + explain everything
await seed({ experience: "new", knowledge: "explain" });
let f = await feed();
console.log("  beginner feed:    ", f.join(", "), `[levels ${levels(f)}]`);
ok(f[0] === "sip", "beginner starts with 'What is a SIP?'");
ok(f.slice(0, 4).every((id) => LEVEL[id] === 1), "beginner sees Basics first");
ok(!f.some((id) => LEVEL[id] === 3), "beginner sees no Advanced lessons yet");
ok(await p.evaluate(() => document.querySelector('[data-lesson="sip"]').innerText.includes("Basics")), "reel shows its level chip (Basics)");
const nextChip = await p.evaluate((id) => document.querySelector(`[data-lesson="${id}"]`).innerText.includes("Next level"), f[4]);
ok(nextChip, "intermediate lessons are marked 'Next level' for a beginner");
await p.goto(BASE_URL + "/home"); await sleep(1500);
ok(await p.evaluate(() => document.body.innerText.includes("What is a SIP?")), "beginner Home hero: What is a SIP?");

// Intermediate: explored a little + knows basics
await seed({ experience: "explored", knowledge: "basics" });
f = await feed();
console.log("  intermediate feed:", f.join(", "), `[levels ${levels(f)}]`);
ok(f.slice(0, 4).every((id) => LEVEL[id] === 2), "intermediate sees Intermediate first");
ok(f.slice(4, 8).every((id) => LEVEL[id] === 3), "then Advanced as the next level");
ok(f.slice(8).every((id) => LEVEL[id] === 1), "basics only as refreshers at the end");

// Advanced: experienced + advanced knowledge, high risk
await seed({ experience: "experienced", knowledge: "advanced", risk: "high", horizon: "5plus" });
f = await feed();
console.log("  advanced feed:    ", f.join(", "), `[levels ${levels(f)}]`);
ok(f.slice(0, 4).every((id) => LEVEL[id] === 3), "advanced sees Advanced first");
ok(f[0] === "drawdowns", "high-risk advanced user starts with 'Drawdowns & volatility'");
ok(!f.includes("sip"), "advanced feed does not include 'What is a SIP?'");
await p.goto(BASE_URL + "/home"); await sleep(1500);
ok(await p.evaluate(() => document.body.innerText.includes("Drawdowns & volatility")), "advanced Home hero is an advanced lesson");
await p.goto(BASE_URL + "/profile"); await sleep(1200);
ok(await p.evaluate(() => document.body.innerText.includes("Advanced") && document.body.innerText.includes("Learning level")), "Profile shows learning level");

// Level up: beginner who finished all Basics
await seed({ experience: "new", knowledge: "explain" }, ["sip", "diversification", "risk-return", "goal"]);
f = await feed();
console.log("  levelled-up feed: ", f.join(", "), `[levels ${levels(f)}]`);
ok(f.slice(0, 4).every((id) => LEVEL[id] === 2), "finishing all Basics levels the feed up to Intermediate");

// Out-of-level link still opens (beginner taps 'Watch the 30-sec reel' on the P/E explainer)
await seed({ experience: "new", knowledge: "explain" });
f = await feed("/learn?lesson=pe-valuation");
ok(f[0] === "pe-valuation", "linked advanced lesson is placed first for a beginner");
const active = await p.evaluate(() => new URLSearchParams(location.search).get("lesson"));
ok(active === "pe-valuation", "and is the reel on screen");

// Curated quiz includes new lessons once watched
await seed({ experience: "experienced", knowledge: "advanced" }, ["drawdowns", "pe-valuation"]);
await p.goto(BASE_URL + "/learn/quiz"); await sleep(1500);
const qt = await p.evaluate(() => document.body.innerText);
ok(qt.includes("From the 2 lessons you've watched") && qt.includes("1/2"), "quiz covers the advanced lessons watched");
console.log("errors:", errors.length ? [...new Set(errors)].join(" | ") : "none");
await b.close();
