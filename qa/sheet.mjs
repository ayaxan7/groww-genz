// builds contact sheets with headless Chrome (no image libs needed)
import puppeteer from "puppeteer-core";
import { readdirSync, writeFileSync } from "node:fs";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100";
const dir = new URL("./shots/", import.meta.url).pathname;
const groups = JSON.parse(process.argv[2]);
const b = await puppeteer.launch({ executablePath: CHROME, headless: true });
const p = await b.newPage();
for (const [name, files, w] of groups) {
  const html = `<body style="margin:0;background:#ccc;display:flex;flex-wrap:wrap;gap:6px;width:${w}px">${files.map(f=>`<img src="file://${dir}${f}" style="width:${Math.floor((w-6*4)/4)}px">`).join("")}</body>`;
  writeFileSync(dir+"tmp.html", html);
  await p.setViewport({ width: w, height: 400 });
  await p.goto("file://"+dir+"tmp.html"); await new Promise(r=>setTimeout(r,300));
  await p.screenshot({ path: dir+name, fullPage: true });
}
await b.close();
