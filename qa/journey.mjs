import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";

const BASE = BASE_URL;
const OUT = new URL("./shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-first-run", "--no-default-browser-check"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors = [];
page.on("console", async (m) => {
  if (m.type() !== "error") return;
  const parts = await Promise.all(m.args().map((a) => a.evaluate((v) => (v instanceof Error ? v.message : String(v))).catch(() => "?")));
  errors.push(`[console] ${new URL(page.url()).pathname} :: ${m.text().slice(0, 200)} | ${parts.join(" ").slice(0, 200)} @ ${m.location()?.url ?? ""}:${m.location()?.lineNumber ?? ""}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name) => page.screenshot({ path: `${OUT}${name}.png` });
const text = () => page.evaluate(() => document.body.innerText);
const expect = async (s, label) => {
  const t = await text();
  console.log(`${t.includes(s) ? "PASS" : "FAIL"}  ${label}: "${s}"`);
};
async function click(label, { exact = false } = {}) {
  const ok = await page.evaluate(
    (label, exact) => {
      const els = [...document.querySelectorAll("button, a, [role=radio], [role=tab]")].filter((e) => {
        const r = e.getBoundingClientRect();
        const st = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && !e.disabled;
      });
      const match = els.find((e) => {
        const t = (e.innerText || e.getAttribute("aria-label") || "").trim();
        return exact ? t === label : t.includes(label);
      });
      if (match) match.click();
      return !!match;
    },
    label,
    exact,
  );
  if (!ok) console.log(`FAIL  click "${label}" (not found)`);
  await sleep(350);
  return ok;
}
async function swipe(dir, y = 500) {
  const [x0, x1] = dir === "left" ? [320, 60] : [60, 320];
  await page.touchscreen.touchStart(x0, y);
  for (let i = 1; i <= 6; i++) await page.touchscreen.touchMove(x0 + ((x1 - x0) * i) / 6, y);
  await page.touchscreen.touchEnd();
  await sleep(450);
}
const heading = () => page.evaluate(() => document.querySelector("h1")?.innerText ?? "");
async function waitPath(p, timeout = 8000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (new URL(page.url()).pathname === p) return true;
    await sleep(150);
  }
  console.log(`FAIL  expected path ${p}, got ${page.url()}`);
  return false;
}

// 1. launch → login
await page.goto(BASE + "/");
await sleep(400);
await shot("01-splash");
await waitPath("/login");
await shot("02-login");

// 2. phone validation
await page.type("#phone", "12345");
await click("Continue", { exact: true });
await expect("10-digit", "invalid phone error");
await page.click("#phone", { clickCount: 3 });
await page.keyboard.press("Backspace");
await page.type("#phone", "9876543210");
await click("Continue", { exact: true });
await waitPath("/login/otp");
await sleep(300);
await shot("03-otp");

// 3. OTP wrong then right
await page.keyboard.type("111111");
await sleep(900);
await expect("doesn't match", "invalid OTP error");
await shot("03b-otp-error");
await page.keyboard.type("123456");
await waitPath("/onboarding");

// 4. onboarding
await page.type("#name", "Ayaan");
await shot("04-onb-welcome");
await click("Get started");
// swipe left without an answer must not advance
const h0 = await heading();
await swipe("left");
console.log(`${(await heading()) === h0 ? "PASS" : "FAIL"}  swipe blocked until answered`);
await click("Completely new");
await shot("05-onb-experience");
await swipe("left");
await expect("How familiar are you", "swipe left advances onboarding");
await swipe("right");
await expect("What's your investment experience?", "swipe right goes back");
await swipe("left");
for (const opt of ["Explain everything", "Early career"]) {
  await click(opt);
  await click("Next", { exact: true });
}
await expect("Not sure yet", "goal option renamed");
await click("Laptop / Gadget");
await click("Next", { exact: true });
await shot("06-onb-amount");
await expect("great place to start", "₹500 message");
await click("₹2,500");
await expect("strong commitment", "₹2,500 message tailored");
await click("₹1,000");
await expect("solid monthly habit", "₹1,000 message tailored");
await click("₹500");
await click("Next", { exact: true });
await click("3–5 years");
await click("Next", { exact: true });
await click("Moderate");
await click("Next", { exact: true });
await shot("07-onb-summary");
await expect("What is a SIP?", "summary recommends SIP");
await click("Continue to Groww");
await waitPath("/home");
await sleep(900);
await shot("08-home");
await expect("Good", "greeting");
await expect("5 day streak", "learning streak 5");
await expect("2 months investing", "investing streak 2");
await expect("₹1,500", "goal saved");
await expect("₹12,480", "portfolio value");
await expect("YOUR NEXT 30 SECONDS", "home next step");
await expect("You're building toward", "goal card");
await expect("What is a SIP?", "home recommends SIP");
const fullHome = await page.screenshot({ path: `${OUT}08b-home-full.png`, fullPage: true });

// 5. learn reel
await click("Watch now");
await waitPath("/learn");
await sleep(1200);
await shot("09-learn-reel");
const first = await page.evaluate(() => document.querySelector("[data-lesson]")?.dataset.lesson);
console.log(`${first === "sip" ? "PASS" : "FAIL"}  first reel is sip (${first})`);
for (let i = 0; i < 4; i++) {
  await page.evaluate(() => document.querySelector('[data-lesson="sip"] [aria-label="Next part"]').click());
  await sleep(300);
}
await sleep(500);
await shot("10-reel-complete");
await expect("Great!", "reel completion overlay");
await expect("6 days", "streak incremented");
// snap scroll check
await click("Next reel");
await sleep(1200);
const scrolled = await page.evaluate(() => document.querySelector(".reel-feed").scrollTop);
console.log(`${scrolled > 300 ? "PASS" : "FAIL"}  next reel scroll (${scrolled})`);
await shot("11-reel-2");

// 6. quiz
await page.goto(BASE + "/learn/quiz?topic=sip");
await sleep(1200);
await shot("12-quiz");
await click("Investing a fixed amount regularly");
await expect("Nice!", "quiz correct feedback");
await expect("150", "points updated");
await shot("13-quiz-feedback");
await click("Next");
await click("₹10,000");
await expect("Almost", "quiz incorrect feedback");

// 7. explore + details
await page.goto(BASE + "/explore");
await sleep(1200);
await shot("14-explore");
await expect("What's worth knowing today?", "explore discovery strip");
await expect("Popular right now", "neutral popular list");
await expect("not a recommendation", "explore list disclaimer");
await page.type('input[aria-label="Search investments"]', "zzz");
await sleep(300);
await expect("No matches", "empty search state");
await click("Clear filters");
await page.goto(BASE + "/explore/reliance");
await sleep(1200);
await shot("15-detail");
await expect("What does this company actually do?", "detail plain english");
await expect("Things to consider", "neutral things to consider");
await expect("isn't a recommendation", "details disclaimer");
await click("What does P/E mean?");
await expect("P/E in one picture", "P/E visual explainer opens");
await page.keyboard.press("Escape");
await sleep(300);
await expect("Key insights", "key insights");
await click("1Y", { exact: true });
await click("Financials", { exact: true });
await expect("Market cap", "financials tab");
await click("News", { exact: true });
await click("Add to compare");
await waitPath("/compare");
await click("Nifty 50 Index Fund");
await sleep(400);
await shot("16-compare");
await expect("What this tells you", "compare summary");

// 8a. details → Invest goes straight to the amount screen
await page.goto(BASE + "/explore/flexicap");
await sleep(1000);
await click("Invest", { exact: true });
await waitPath("/invest/amount");
await expect("Flexi Cap Fund", "details invest skips guided questions");
await click("Go back");
await waitPath("/explore/flexicap");

// 8b. guided flow: Back must walk 5→1 and then exit, never loop
await page.goto(BASE + "/home");
await sleep(800);
await page.goto(BASE + "/invest");
await sleep(800);
await shot("17-guided-1");
for (let s = 1; s <= 4; s++) await click(s === 4 ? "See my options" : "Next");
await expect("STEP 5 OF 5", "reached step 5");
for (let s = 5; s > 1; s--) await click("Go back");
await expect("STEP 1 OF 5", "back reaches step 1");
await click("Go back");
await sleep(600);
console.log(`${new URL(page.url()).pathname === "/home" ? "PASS" : "FAIL"}  back on step 1 exits (${page.url()})`);

// 8c. full guided path with swipes, nifty fund, ₹500
await page.goto(BASE + "/invest");
await sleep(800);
await swipe("left");
await expect("STEP 2 OF 5", "swipe advances guided step");
await swipe("right");
await expect("STEP 1 OF 5", "swipe back guided step");
for (let s = 1; s <= 3; s++) await click("Next");
await click("Not sure what risk means?");
await expect("Risk = how bumpy the ride is", "risk visual explainer");
await shot("18a-risk-explainer");
await page.keyboard.press("Escape");
await sleep(300);
await click("See my options");
await shot("18-guided-5");
await expect("Your plan", "guided plan summary");
await expect("Good to know", "investment types explained");
await expect("don't recommend specific stocks", "guided disclaimer");
await click("Browse mutual funds");
await click("Nifty 50 Index Fund");
await click("Continue with");
await waitPath("/invest/amount");
await sleep(500);
await shot("19-amount");
await expect("Illustrative projection", "projection labelled");
await click("Review investment");
await waitPath("/invest/review");
await shot("20-review");
await expect("Demo investment", "demo label on review");
// slide-to-confirm on mobile
await sleep(1000);
const knob = await page.$('button[aria-label="Swipe to Confirm Investment"]');
const box = await knob.boundingBox();
const ky = box.y + box.height / 2;
await page.touchscreen.touchStart(box.x + 20, ky);
for (let i = 1; i <= 8; i++) await page.touchscreen.touchMove(box.x + 20 + i * 42, ky);
await page.touchscreen.touchEnd();
await waitPath("/invest/success");
await sleep(1500);
await shot("21-success");
await expect("Your first investment is set up!", "success title");
await expect("₹2,000", "goal updated on success");

await click("View Portfolio");
await waitPath("/portfolio");
await sleep(1200);
await shot("22-portfolio");
await expect("₹12,980", "portfolio updated");
await page.goto(BASE + "/goals");
await sleep(800);
await shot("23-goals");
await expect("₹2,000", "goal progress updated");
await expect("₹8,000 to go", "goal remaining");

// persistence
await page.reload();
await sleep(1200);
await expect("₹2,000", "persists after reload");

// home reflects new state
await page.goto(BASE + "/home");
await sleep(1200);
await expect("6 day streak", "home learning streak 6");
await expect("3 months investing", "home investing streak 3");

// responsive tour
const widths = [375, 390, 414, 430, 768, 1440];
const pages = ["/home", "/learn", "/learn/quiz", "/explore", "/explore/reliance", "/compare", "/portfolio", "/goals", "/profile", "/invest"];
for (const w of widths) {
  await page.setViewport({ width: w, height: w < 600 ? 844 : 900, isMobile: w < 600, hasTouch: w < 600 });
  for (const p of pages) {
    await page.goto(BASE + p);
    await sleep(900);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) console.log(`FAIL  horizontal overflow ${overflow}px at ${w} ${p}`);
    await page.screenshot({ path: `${OUT}w${w}${p.replaceAll("/", "_")}.png` });
  }
}

// reset demo
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(BASE + "/profile");
await sleep(800);
await click("Reset Demo Data");
await click("Reset", { exact: true });
await sleep(2500);
console.log(`${page.url().endsWith("/login") ? "PASS" : "FAIL"}  reset → login (${page.url()})`);

// social login
await click("Continue with Google");
await waitPath("/onboarding");
console.log(`${page.url().endsWith("/onboarding") ? "PASS" : "FAIL"}  google demo login (${page.url()})`);
await click("Skip with the demo profile");
await waitPath("/home");
await page.goto(BASE + "/profile");
await sleep(600);
await click("Log out");
await sleep(800);
await click("Continue with ChatGPT");
await sleep(3000);
console.log(`${/\/(home|onboarding)$/.test(page.url()) ? "PASS" : "FAIL"}  chatgpt demo login (${page.url()})`);

console.log("\nERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
