import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire("C:/Users/diego/Documents/doctor8/package.json");
const { chromium } = require("playwright");

const dir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(dir, "proposta-associados-ajoia.html");
const pdfPath = path.join(dir, "proposta-associados-ajoia.pdf");

let browser;
try {
  browser = await chromium.launch({ channel: "msedge" });
} catch {
  try {
    browser = await chromium.launch({ channel: "chrome" });
  } catch {
    browser = await chromium.launch();
  }
}

const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
await browser.close();
console.log(pdfPath);
