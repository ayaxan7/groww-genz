# Groww Gen Z — investing confidence prototype

Product case-study prototype: **"Make investing feel understandable before making it feel actionable."**
Personalised onboarding → 30-sec learning reels → quiz → explore → guided investing → demo investment → portfolio & goals.

> Demo only. Mock data, simulated sign-in (OTP `123456`, Google/ChatGPT are visual-only), no real orders, payments or advice.
> All state lives in `localStorage`; use **Profile → Reset Demo Data** to restart the journey.

> **Continuing this project (human or agent)?** Read [`CONTEXT.md`](CONTEXT.md) first: decisions, architecture,
> environment gotchas and how to verify changes. End-to-end checks live in [`qa/`](qa/README.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Shortcut for evaluators: on the onboarding welcome screen, "Skip with the demo profile" loads Ayaan
(completely new · laptop goal · ₹500/month · 3–5 yrs · moderate risk).

## Mobile-first PWA

- One mobile app shell (~390px). On phones it fills the screen; on larger screens the same app sits in a centred
  phone frame (`.app-frame` in `globals.css`). The frame has a transform, so fixed UI (bottom nav, sheets, reels)
  stays inside it, and sheets portal into `#modal-root` inside the frame.
- Installable: `src/app/manifest.ts`, icons in `public/icons`, `display: standalone`, theme colour, safe-area insets.
- `public/sw.js` is a minimal service worker (network-first pages, cache-first static assets), registered in
  production builds only.

## Art

The 3D characters and objects in `public/art` are cropped from the supplied visual reference pack
(`02_mobile_pwa_ui_reference.png`) with light tile backgrounds removed:

```bash
python3 scripts/extract-art.py <path-to>/02_mobile_pwa_ui_reference.png
```

They are prototype reference assets, not official Groww artwork. Higher-resolution transparent PNGs can replace
them file-for-file (`src/data/art.ts` maps lessons and goals to art).

## Structure

- `src/app` — routes (`/login`, `/login/otp`, `/onboarding`, and the authenticated `(app)` group: home, learn, learn/quiz, explore, explore/[id], compare, invest/*, portfolio, goals, profile — Profile is reached from the header avatar)
- `src/components` — UI by feature (layout, learn, explore, invest, portfolio, goals, home, charts, ui primitives incl. `Art`)
- `src/data` — deterministic mock instruments, lessons, quiz, onboarding options, visual concept explainers, art mapping
- `src/lib` — types, pure state transitions (`actions.ts`), personalisation rules (`personalise.ts`), formatting, chart series, projections, localStorage wrapper
- `src/hooks` — store provider, reel playback, portfolio selectors, count-up, media query
- `scripts/build-reel-covers.mjs` — regenerates `public/reels/*` from the supplied cover SVGs (removes baked-in text, adds topic illustrations)

## Note on the folder location

This project sits in an iCloud-synced Desktop with "Optimize Mac Storage" on, which evicts files and breaks
`node_modules`. Dependencies and build output therefore live in `deps.nosync/` (iCloud skips `.nosync` folders)
and `node_modules` / `.next` are symlinks into it. If you move the project out of iCloud you can delete the
symlinks and `deps.nosync/` and simply run `npm install`.
