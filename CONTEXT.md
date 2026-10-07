# Groww Gen Z prototype: project context and handoff

Read this first if you're a new agent (or person) continuing this project. It captures what was built,
why, the decisions made along the way, environment gotchas, and how to verify changes.

---

## 1. What this is

A **Product Intern case-study prototype** for Groww: a mobile-first PWA that helps Gen Z / first-time
investors go from *"I want to start investing"* to *"I understand what I'm doing and feel confident."*

Core principle (repeated by the user throughout):
> **"Make investing feel understandable before making it feel actionable."**
> "Finance can be complex. The interface does not have to be."
> "We are not trying to make investing look more exciting. We are trying to make it feel less intimidating."

It is **a working prototype, not a production financial app**: dummy auth, mock market data, demo
investments, everything persisted in `localStorage`. No real payments, orders, KYC, bank links or advice.
Copy says "demo", "illustrative", "example" where appropriate. Don't call anything financial advice.

Journey that must always work end to end:
Splash → Phone login → OTP → Onboarding → Personalised Home → Recommended Learn reel → complete reel →
Quiz → Explore → Investment details → Guided investing / amount (select ₹500) → Review → Swipe to
confirm demo investment → Success → Portfolio updated → Goal progress updated.

### Regulatory rule (SEBI): do not break this
Recommending **specific securities** (stocks, funds, ETFs) to someone **based on a questionnaire/profile**
is investment advice in India and needs SEBI registration (Investment Adviser / Research Analyst). The
user confirmed this with an industry contact. Therefore:
- **Personalise learning only**: lessons, learning level, quiz, plain-English explanations of investment
  *types*, the user's goal.
- **Never rank or pick securities from the profile.** Lists of stocks/funds/ETFs are the same for
  everyone (`popularInstruments()` = mock popularity on the app) and are labelled "not a recommendation".
  The user chooses for themselves.
- No "Great fit / Why this fits / Picked for you / Matched to your profile / Why might this matter to
  you" style copy on securities. Details pages show neutral "Things to consider" and a disclaimer.
- Removed in this pass: `recommendInstruments`, `scoreInstrument`, `categoryFits`, `whyAmISeeing`,
  `profileSentence`, `whyItMatters`. Replacements: `popularInstruments`, `investmentTypes`,
  `thingsToConsider` (all in `src/lib/personalise.ts`).

---

## 2. How to run

```bash
npm install
npm run dev            # http://localhost:3000 (this session used --port 3100)
npm run build && npm start
```

Demo shortcuts:
- OTP is always **123456**. Google / ChatGPT sign-in are visual-only demos (no OAuth, no SDKs).
- Onboarding welcome → **"Skip with the demo profile"** loads Ayaan (completely new · explain everything ·
  early career · Laptop/Gadget goal · ₹500/month · 3–5 yrs · moderate risk).
- Profile (header avatar) → **Reset Demo Data** restarts everything; **Start with an empty portfolio**
  shows first-time / empty states.

### Environment gotchas (important)
- **The project lives in an iCloud-synced Desktop with "Optimize Mac Storage" and a nearly full disk.**
  iCloud evicted ~10,000 files from `node_modules`, making tools hang. Fix in place:
  - real deps in `deps.nosync/node_modules`, build output in `deps.nosync/next-build`
    (iCloud ignores `*.nosync`), with **symlinks** `node_modules → deps.nosync/node_modules` and
    `.next → deps.nosync/next-build`.
  - `tsconfig.json` and `eslint.config.mjs` exclude `deps.nosync`. `.gitignore` ignores it.
  - If the project is moved out of iCloud (or unzipped elsewhere): delete the `node_modules` / `.next`
    symlinks if present and just `npm install`.
  - iCloud also created a stray empty `node_modules 2` folder once; delete such duplicates.
- **Don't run `next build` while `next dev` is running** (they share the build folder; dev ends up serving
  stale/broken files). Stop dev → build → `rm -rf deps.nosync/next-build/dev` → restart dev.
- In the Claude desktop app, launching the dev server via the preview tool hung (npm/node stuck at
  start-up, likely a macOS Desktop-folder permission prompt). Running `./node_modules/.bin/next dev
  --port 3100` from a shell works.
- `devIndicators: false` in `next.config.ts`: the floating Next badge sat over the phone UI's bottom
  controls (it blocked the swipe-to-confirm knob and the Home tab).

---

## 3. Tech stack and conventions

- **Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript, Tailwind CSS v4**, `lucide-react` icons.
  No other runtime deps. Prettier was run with `--print-width 160` (match that style).
- `AGENTS.md` (from create-next-app) says: this Next version has breaking changes; read
  `node_modules/next/dist/docs/` before using unfamiliar APIs.
- **Cache Components / partialPrefetching are OFF** (they produced dev-only "instant navigation"
  console errors and add nothing for a client-only app). Routes are static; all state is client-side.
- `useSearchParams` consumers are wrapped in `<Suspense>`. `/explore/[id]` uses `generateStaticParams`.
- Design tokens live in `src/app/globals.css` `@theme`: brand `#00D09C`, ink `#111827`, canvas
  `#F8FAFC`, `hairline` border `#eceef2`, pastel surfaces (`sky-soft`, `violet-soft`, `amber-soft`,
  `rose-soft`), animations (fade-up, pop, shake, sheet-up, slide-next/prev, reel-fill/reel-span).
  `prefers-reduced-motion` is respected globally.
- `Card` and `ProgressBar` only apply their default background if the caller didn't pass a `bg-*` class
  (avoids Tailwind class conflicts). Keep that pattern for other primitives.

---

## 4. Architecture

```
src/
  app/
    layout.tsx            root: phone-frame shell (.app-stage/.app-frame/#app-scroll/#modal-root), store provider, SW
    page.tsx              splash (~1s) → routes by saved state
    login/, login/otp/    dummy phone + OTP auth (6 boxes, paste, resend timer)
    onboarding/           7 questions + summary, swipe navigation, contextual character tips
    manifest.ts           PWA manifest
    (app)/                authenticated group, AppShell guard (auth → onboarding → app) + BottomNav
      home, learn, learn/quiz, explore, explore/[id], compare,
      invest (guided steps via ?step=), invest/amount, invest/review, invest/success,
      portfolio, goals, profile
  components/             by feature: auth, charts, explore, goals, home, invest, layout, learn,
                          onboarding, portfolio, ui (Art, Button, Modal, Tabs, primitives, SwipeToConfirm…)
  data/                   instruments (19 mock: 10 stocks, 5 MFs, 4 ETFs), lessons (12, 3 levels), quiz (13 Qs),
                          profileOptions, concepts (visual explainers), art (lesson/goal → art mapping)
  hooks/                  useAppStore (context + localStorage), useReelPlayback, useLessonCompletion,
                          usePortfolio, useSwipe, useCountUp, useAuthRedirect
  lib/                    types, actions (ALL pure state transitions), personalise (ALL rules),
                          seed, format, series (deterministic mock charts), projection, storage
scripts/                  build-reel-covers.mjs, extract-art.py (see §7)
qa/                       headless Chrome end-to-end checks (see §9)
public/                   art/ (3D cut-outs), brand/, icons/ (PWA + supplied nav SVGs), reels/, reference/, sw.js
```

### State
- One `AppState` in `src/hooks/useAppStore.tsx`, persisted under localStorage key **`groww-genz:state`**
  (`version: 1`). Mutations go through **pure functions in `src/lib/actions.ts`** via `update(fn)`.
- Server render uses a date-free placeholder seed (`createSeedState(false)`); the real seed is created
  in the browser (avoids prerender `new Date()` errors). Pages show a loader until hydrated.
- Seeded demo values: learning streak 5 days (last active yesterday → completing a reel makes it 6),
  investing streak 2 months, sample holdings ₹11,000 invested / ₹12,480 current, watchlist, goal created
  at onboarding with ₹1,500 saved (target by goal type, e.g. Laptop ₹10,000).
- Streaks: learning = consecutive days with any reel/quiz activity (once per day, never re-counted);
  investing = consecutive months with a demo investment. Displayed streak drops to 0 if broken.
- Demo investment (`confirmInvestment`): adds transaction, upserts holding (current = invested at buy),
  adds SIP if monthly, adds amount to the linked goal, updates investing streak, records `lastInvestment`
  for the success screen.

### Personalisation (deterministic rules, `src/lib/personalise.ts`), learning only
- **Level-based Learn feed.** 12 lessons in 3 levels (`level` on each lesson in `src/data/lessons.ts`):
  - Basics: What is a SIP?, Why diversification matters, Risk vs return, Investing for a goal
  - Intermediate: What is an ETF?, CAGR in 30 seconds, SIP vs lump sum, Index vs active funds
  - Advanced: Reading P/E like a pro, Asset allocation & rebalancing, How your gains are taxed,
    Drawdowns & volatility (tax lesson intentionally avoids quoting rates; they change with budgets)
- `profileLevel(profile)`: experience (0–3) + knowledge (0–3) → 0–1 Basics, 2–3 Intermediate,
  4–6 Advanced. `learnerLevel(profile, completed)` moves up once every lesson at a level is watched.
- `learnFeed(profile, completed)`: your level first (personally ranked by `scoreLesson`), then the next
  level tagged "Next level", then one level below tagged "Refresher" (intermediate/advanced only).
  Advanced users don't get "What is a SIP?"; beginners don't get advanced topics until they level up.
  Demo profile (new + explain) → Basics, **"What is a SIP?" first**; experienced + advanced + high risk →
  "Drawdowns & volatility" first.
- Learn page snapshots the feed on open (no reshuffling mid-session); a linked lesson outside the feed
  (e.g. from an "Explain simply" sheet) is placed first. Reels show a level chip (●●○ Intermediate ·
  Next level / Refresher). Profile shows "Learning level"; onboarding summary shows level + first lesson.
- `nextStep` drives Home's hero: next unwatched lesson in the feed → quiz → invest.
- `exploreDiscoveries` (today's mover, a level-appropriate lesson, "3 companies worth understanding").
- Onboarding goal "Other" was renamed **"Not sure yet"** (value stays `other`); Goals' create form still
  labels it "Other".

---

## 5. Product/UX decisions (chronological, with the user's reasons)

1. **Initial build**: full app per a long spec (auth, onboarding, personalised Home, reels Learn,
   quiz, Explore, details, compare, guided investing, amount, review, success, portfolio, goals,
   profile, reset demo).
2. **Onboarding fixes**: "Other" → "Not sure yet"; amount reassurance copy now matches the amount
   (≤₹500 "great place to start…₹100", ₹1,000 "solid monthly habit", ₹2,500+ "strong commitment…
   spread across funds…emergency savings first") instead of always saying "SIPs begin at ₹100".
3. **Investing flow**: "Invest" on a details page goes **straight to the amount screen** (profile already
   knows goal/amount/horizon/risk), with a "Not sure this fits? Get guided help" link. Guided steps use
   `router.replace` (no history stacking) and Back on step 1 exits to origin (fixes a Back-button loop).
4. **Swipe gestures on mobile** (inspired by Trackk): onboarding & guided steps (swipe left/right),
   quiz (next question), Explore category switch, **swipe-to-confirm** on Review. Swipes ignore inputs,
   horizontal scrollers and `[data-no-swipe]`.
5. **Declutter passes**: Home reduced to the essentials; progressive disclosure everywhere ("Read
   more", "See all", "Why this?"); plain-English labels ("Your money", "Where your money is invested",
   "How long can your money stay invested?", "How comfortable are you with ups & downs?", "Gain" not
   "P/L", "Timeline").
6. **Learning embedded across the app**: `ExplainLink` + `ConceptVisual` show visual explainers (SIP,
   compounding ₹500→₹620→₹770→₹950, diversification buckets, risk lines, P/E, returns, valuation,
   expense ratio) on details, portfolio, guided investing, amount screen; each links to its reel.
7. **Mobile-first PWA (current direction)**: ONE mobile shell (~390px). On desktop the same app sits
   in a centred phone frame with a caption beside it. **No desktop layouts/sidebar**; all `sm:/md:/lg:`
   classes were removed. Profile is reached from the header avatar; bottom nav = Home, Learn, Explore,
   Goals, Portfolio. The frame has `transform` so `position: fixed` UI stays inside it; modals portal
   into `#modal-root` inside the frame and lock `#app-scroll` (not `body`).
8. **3D characters** from the user's visual pack, used where meaningful: splash, onboarding tips, Home
   hero (per-lesson character), reels, Explore discovery card, goal objects, success/celebration,
   profile, empty portfolio.
9. **Learn reels behaviour**:
   - full-screen vertical snap reels, light stage with the lesson's character, one caption at a time,
     side rail (like, save, share, quiz, sound), single CTA;
   - **loop**: when a reel ends it restarts immediately; swiping to a reel (or back) starts it from the
     beginning; completion is counted once per viewing;
   - **celebration card only at milestones** (first reel of the day / every 3rd reel / all 6 done); other
     completions show a small "Watched · +10 pts · Next" toast; card is dismissible and pauses the loop;
   - **sound on by default** (browser speech synthesis reads captions; mute on the rail). Browsers need a
     prior interaction for audio: arriving by tap plays immediately; a cold open shows "Tap for sound";
   - **quiz is curated from watched lessons** ("From the N lessons you've watched"); rail Quiz button
     quizzes just that lesson; empty state before any reel is watched.

10. **Level-based learning** (latest): see §4 Personalisation. Beginners vs experienced users now get
    different feeds and Home heroes; the quiz covers whatever they've watched, including advanced lessons.
11. **SEBI compliance pass** (latest): see the regulatory rule in §1. Explore "For you" became
    "Popular" (same list for everyone); guided investing step 5 became "Understand your options"
    (investment types explained + neutral "Browse" lists the user chooses from); details show "Things to
    consider"; Compare quick-add is "popular on the app".

---

## 6. Bugs found and fixed (don't reintroduce)

- **Learn screen froze buttons/navigation**: infinite loop: page rebuilt the lesson array every render →
  IntersectionObserver re-attached → `history.replaceState` → search params changed → re-render.
  Fix: `useMemo` the ordered lessons, observer keyed on lesson ids, URL updated only when the visible
  reel changes. Also **no per-frame React state** for reel progress: progress bars are CSS animations
  (`reel-fill`, `reel-span`) whose play-state follows `running`; one `setTimeout` per caption.
- Reel side rail was covered by the bottom text panel → rail moved up (z-index above), panel is
  `pointer-events-none` except its CTA.
- Service worker used to serve cached JS first and could shadow the dev server with stale code. Now
  **network-first for everything**, cache only offline, old caches deleted on activate; in development
  the app unregisters any worker. SW registers only in production builds.
- A whitespace-cleanup script once stripped spaces before every `"` in 38 files; repaired (`{" "}`
  spacers, `split(" ")`) and Prettier-formatted. Be careful with broad regex edits.
- New lessons showed "NaN" likes (counts were hard-coded for the first six); `likesFor()` now falls back
  to a stable value derived from the lesson id.
- The brand mark's green wave overflowed the circle (clipped now); the supplied home icon's roof was
  asymmetric (redrawn in `NavIcon.tsx` and `public/icons/home.svg`).

---

## 7. Assets

- Original pack 1 (`~/Downloads/groww_case_assets`): approximate Groww wordmark, Google "G" and ChatGPT
  marks (used on sign-in, labelled DEMO), nav icons (inlined in `NavIcon.tsx`), 6 reel cover SVGs
  (regenerated without baked text by `scripts/build-reel-covers.mjs`), reference images.
- Pack 2 (`~/Downloads/groww_mobile_pwa_visual_assets`): master concept, **3D character reference
  sheet**, mobile UI reference. The "3D Assets ZIP" shown inside the image was **not included**, so the 9
  characters + 9 objects (+ splash scene) were **cropped from `02_mobile_pwa_ui_reference.png`** with
  backgrounds removed: `python3 scripts/extract-art.py <path>/02_mobile_pwa_ui_reference.png` →
  `public/art/*.png`. They're small/soft and seated characters are cut at the waist in the source (reels
  fade that edge). **If real high-res transparent PNGs become available, replace files 1:1**; mappings
  live in `src/data/art.ts`.
- These are prototype/reference assets, **not official Groww brand assets**; don't claim otherwise.
- Cleanup candidates: `public/reels/*.svg` covers are no longer displayed (still referenced as
  `lesson.cover`), `public/reference/*.png` aren't used by code.

---

## 8. Known limitations / ideas not yet done

- Narration uses browser text-to-speech (voice varies by device); real reel audio/video could replace it.
- Art resolution is limited by the reference sheet (see §7).
- No real backend; data is per browser. Reset via Profile.
- Possible next steps the user hinted at or that fit the direction: richer per-segment reel visuals,
  more lessons/quiz questions (quiz grows automatically with lessons watched), dark mode, a proper
  notifications page, offline page polish.

---

## 9. Verification (do this after changes)

```bash
./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint src   # both must be clean
./node_modules/.bin/next build                                        # stop dev first (see §2)
cd qa && npm install && npm run journey && npm run learn-buttons && npm run learn-loop-sound && npm run learn-levels
```

Last known results: **journey 59/59**, **learn-buttons 20/20 at 390px and 1440px**, **learn-long 8/8**,
**learn-loop-sound 18/18**, **learn-levels 18/18**, zero console errors, no horizontal overflow at 375/390/414/430/768/1440,
production build OK (38 static routes), service worker active in production.

Test tips: the scripts seed `localStorage`; on a production server seed → wait → reload (the app's own
first save can otherwise overwrite the seed). Warm routes first on a cold dev server. Headless can't
play audio; `loopsound.mjs` stubs `speechSynthesis` to record what would be spoken.

---

## 10. Working preferences observed from the user

- Wants a **real working prototype**, not static screens; every button must work.
- Strong preference for **simple, uncluttered, approachable** UI; mobile-first; Gen-Z friendly but
  credible (no gimmicks, neon, memes, leaderboards, reward-heavy UI). Subtle gamification only.
- Likes **visual explanations over paragraphs**, conversational copy, progressive disclosure.
- Expects issues they report to be **reproduced and verified**, not assumed fixed.
- Cares about **regulatory correctness** (SEBI): personalised education yes, personalised stock picks no.
- Use the supplied assets; don't invent a different visual style.
