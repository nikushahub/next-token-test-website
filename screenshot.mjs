// node screenshot.mjs <url> [label] [width] [height]
// Saves a full-page screenshot to "./temporary screenshots/screenshot-N[-label].png" (never overwrites).
import puppeteer from "puppeteer-core";
import { mkdir, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const [, , url = "http://localhost:3000", label, width = "1440", height = "900"] = process.argv;
const OUT_DIR = resolve(import.meta.dirname, "temporary screenshots");
const BROWSER = process.env.BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

await mkdir(OUT_DIR, { recursive: true });
const used = (await readdir(OUT_DIR)).map((f) => Number(f.match(/^screenshot-(\d+)/)?.[1] || 0));
const n = Math.max(0, ...used) + 1;
const file = join(OUT_DIR, `screenshot-${n}${label ? `-${label}` : ""}.png`);

const browser = await puppeteer.launch({
  executablePath: BROWSER,
  headless: true,
  timeout: 90000,
  userDataDir: resolve(import.meta.dirname, "node_modules", ".screenshot-profile"),
  args: ["--no-first-run"],
});
const page = await browser.newPage();
await page.setViewport({ width: Number(width), height: Number(height), deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 2500)); // let the page-load animation finish
await page.screenshot({ path: file, fullPage: true });
await browser.close();
console.log(`Saved ${file}`);
