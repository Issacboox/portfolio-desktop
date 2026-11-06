// Prints the CV and cover letter (scripts/cv/*.html) to PDFs in public/cv with headless Chrome.
// Run: node scripts/cv/build-cv.mjs   (set CHROME=path/to/chrome if it isn't in the default place)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..", "..");
const docs = [
  ["cv.html", "Nurarat_Sangreuang_CV.pdf"],
  ["cover-letter.html", "Nurarat_Sangreuang_Cover_Letter.pdf"],
];
const chrome =
  process.env.CHROME ??
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome"].find(existsSync);
if (!chrome) throw new Error("Chrome not found. Set CHROME=/path/to/chrome");

mkdirSync(path.join(root, "public", "cv"), { recursive: true });
for (const [src, pdf] of docs) {
  const out = path.join(root, "public", "cv", pdf);
  execFileSync(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=5000", `--print-to-pdf=${out}`, pathToFileURL(path.join(root, "scripts", "cv", src)).href],
    { stdio: "ignore" },
  );
  console.log("Written", out);
}
