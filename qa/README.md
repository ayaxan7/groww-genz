# QA scripts

Headless Chrome checks used while building the prototype. They drive the real UI with taps,
swipes and typing, and print `PASS` / `FAIL` lines plus any console errors.

```bash
cd qa
npm install
# with the app running (npm run dev -- --port 3100, or a production server)
npm run journey            # full end-to-end journey + responsive overflow tour (59 checks)
npm run learn-buttons      # Learn screen: every button/nav works while reels play (20 checks × 2 sizes)
npm run learn-long         # long touch session on Learn, leftover service-worker cleanup
npm run learn-loop-sound   # reels loop, sound on by default, "Tap for sound", mute
npm run learn-levels       # Learn feed adapts to beginner / intermediate / advanced, levels up
```

Environment overrides:
- `BASE_URL` (default `http://localhost:3100`)
- `CHROME_PATH` (default macOS Google Chrome)

Screenshots land in `qa/shots/`. `snap.mjs "<routes>" "<widths>" <prefix>` captures screens with a seeded
demo profile, and `sheet.mjs '<json>'` stitches screenshots into contact sheets.

Note: the scripts seed `localStorage` for speed. Warm routes first on a cold dev server, since
on-demand compiles can make the very first navigation slow.
