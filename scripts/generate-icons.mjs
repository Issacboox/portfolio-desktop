// Renders the NurOS logo into every icon size the site needs.
// Run with: node scripts/generate-icons.mjs   (uses sharp, which Next.js already installs)
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const GRADIENT = `
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fb923c"/>
    <stop offset="0.5" stop-color="#f43f5e"/>
    <stop offset="1" stop-color="#7c3aed"/>
  </linearGradient>
  <radialGradient id="shine" cx="0.3" cy="0.15" r="0.8">
    <stop offset="0" stop-color="#fff" stop-opacity="0.35"/>
    <stop offset="0.6" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>`;

// A bold geometric "N" drawn as a path, so it looks the same everywhere (no font needed).
const N = (scale = 1) => {
  const s = (v) => 256 + (v - 256) * scale;
  return `<path fill="#fff" d="M${s(150)} ${s(370)} V${s(142)} h${62 * scale} l${88 * scale} ${136 * scale} V${s(142)} h${62 * scale} V${s(370)} h${-60 * scale} l${-90 * scale} ${-138 * scale} V${s(370)} Z"/>`;
};

/** Rounded "squircle" app icon with a transparent corner (favicon, apple, any-purpose icons). */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>${GRADIENT}</defs>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#g)"/>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#shine)"/>
  ${N(1)}
</svg>`;

/** Full-bleed version for maskable icons: the OS crops it, so the N stays inside the 80% safe zone. */
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>${GRADIENT}</defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <rect width="512" height="512" fill="url(#shine)"/>
  ${N(0.78)}
</svg>`;

/** Apple adds its own rounding and dislikes transparency, so fill the whole square. */
const apple = maskable.replace(N(0.78), N(0.9));

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** Minimal .ico container holding PNG images (supported by every modern browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("src/app/icon.svg", rounded);
writeFileSync("src/app/apple-icon.png", await png(apple, 180));
writeFileSync("src/app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(rounded, size) })))));
writeFileSync("public/icons/icon-192.png", await png(rounded, 192));
writeFileSync("public/icons/icon-512.png", await png(rounded, 512));
writeFileSync("public/icons/maskable-512.png", await png(maskable, 512));
writeFileSync("public/icons/maskable-192.png", await png(maskable, 192));
console.log("Icons written: src/app/{icon.svg,apple-icon.png,favicon.ico}, public/icons/*");
