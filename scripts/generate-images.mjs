// Renders the studio-style product visuals used across the site.
// Every image is drawn as SVG and rasterised to WebP with sharp, so the
// catalogue never depends on remote image URLs. Replace any file in
// /public/products, /public/mockups or /public/images with real photography
// (same filename) and the site picks it up automatically.
//
//   npm run images

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

/* ------------------------------------------------------------------ utils */

const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb2hex = (a) =>
  "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
/** Lighten (positive) or darken (negative) a hex colour by a percentage. */
const shade = (h, a) => {
  if (!h.startsWith("#")) return h;
  const t = a < 0 ? 0 : 255;
  const k = Math.abs(a) / 100;
  return rgb2hex(hex2rgb(h).map((v) => v + (t - v) * k));
};
const esc = (s) => s.replace(/&/g, "&amp;");
let uid = 0;
const nid = (p) => `${p}${uid++}`;

const GOLD = "url(#gold)";
const SILVER = "url(#silver)";
const SERIF = "Georgia, 'Times New Roman', serif";

/** Linear gradient helper → [fillRef, defString] */
function lin(stops, x1 = 0, y1 = 0, x2 = 1, y2 = 0) {
  const id = nid("g");
  const s = stops
    .map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`)
    .join("");
  return [`url(#${id})`, `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s}</linearGradient>`];
}

/* ------------------------------------------------------------- brand marks */

/** Heritage Shapes double-arch mark, centred on (x, y), `w` wide. */
const mark = (x, y, w, color, sw = 52, op = 1) =>
  `<g transform="translate(${x - w / 2} ${y - w * 0.383}) scale(${w / 741})" fill="none" stroke="${color}" stroke-width="${sw}" opacity="${op}"><path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z"/><path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z"/></g>`;

const caps = (x, y, str, size, color, op = 1) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-size="${size}" letter-spacing="${size * 0.22}" fill="${color}" opacity="${op}">${esc(str)}</text>`;

/** Logo lock-up. Fictional portfolio brands (p.brand) get a monogram instead of the arch. */
function lockup(x, y, w, p, color = p.ink, withName = true) {
  if (p.plain) return "";
  if (p.brand) {
    const n = p.brand.toUpperCase();
    const fs = Math.min(w * 0.2, (w * 1.5) / n.length);
    return (
      `<text x="${x}" y="${y + w * 0.12}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="${w * 0.62}" fill="${color}">${esc(p.brand[0])}</text>` +
      (withName ? caps(x, y + w * 0.48, n, fs, color) : "")
    );
  }
  return mark(x, y, w, color) + (withName ? caps(x, y + w * 0.66, "HERITAGE SHAPES", w * 0.115, color) : "");
}

/** Pressed-in logo: light and dark offsets either side of a tonal mark. */
function emboss(x, y, w, p, base, withName = true) {
  if (p.plain) return "";
  return (
    `<g transform="translate(1.6 1.6)" opacity=".35">${lockup(x, y, w, p, shade(base, 45), withName)}</g>` +
    `<g transform="translate(-1.2 -1.2)" opacity=".5">${lockup(x, y, w, p, shade(base, -55), withName)}</g>` +
    lockup(x, y, w, p, shade(base, -16), withName)
  );
}

/* ------------------------------------------------------------ iso helpers */

const topG = (z, inner) => `<g transform="matrix(.866 .5 -.866 .5 0 ${-z})">${inner}</g>`;
const leftG = (d, inner) => `<g transform="matrix(.866 .5 0 -1 ${(-d / 2) * 0.866} ${(d / 2) * 0.5})">${inner}</g>`;
const rightG = (w, inner) => `<g transform="matrix(-.866 .5 0 -1 ${(w / 2) * 0.866} ${(w / 2) * 0.5})">${inner}</g>`;

function cuboid(w, d, h, base, { top = "", left = "", right = "" } = {}) {
  return (
    leftG(d, `<rect x="${-w / 2}" width="${w}" height="${h}" fill="${shade(base, -14)}"/>${left}`) +
    rightG(w, `<rect x="${-d / 2}" width="${d}" height="${h}" fill="${shade(base, -30)}"/>${right}`) +
    topG(h, `<rect x="${-w / 2}" y="${-d / 2}" width="${w}" height="${d}" fill="${shade(base, 6)}"/>${top}`)
  );
}

/* ---------------------------------------------------------------- objects */
// Every object is drawn around the origin, roughly within ±220 units.

function bag(p) {
  const [face, d1] = lin([shade(p.base, 10), p.base, shade(p.base, -8)]);
  return `<defs>${d1}</defs>
  <path d="M-48 -150C-48 -252 52 -252 52 -150" fill="none" stroke="${shade(p.accent, -25)}" stroke-width="7" stroke-linecap="round" opacity=".75"/>
  <polygon points="100,-150 152,-170 152,128 100,150" fill="${shade(p.base, -24)}"/>
  <path d="M126 -160V139" stroke="${shade(p.base, -38)}" stroke-width="1.5" opacity=".7"/>
  <rect x="-130" y="-150" width="230" height="300" fill="${face}"/>
  <rect x="-130" y="-150" width="230" height="24" fill="#000" opacity=".06"/>
  <rect x="-130" y="118" width="230" height="32" fill="#000" opacity=".05"/>
  <circle cx="-66" cy="-138" r="4.5" fill="${shade(p.base, -45)}"/><circle cx="36" cy="-138" r="4.5" fill="${shade(p.base, -45)}"/>
  <path d="M-66 -138C-66 -246 36 -246 36 -138" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round"/>
  ${p.plain ? "" : lockup(-15, -18, 104, p)}`;
}

function box(p, { w = 250, d = 250, h = 96 } = {}) {
  const seam = `<rect x="${-w / 2}" y="${h * 0.56}" width="${w}" height="2" fill="#000" opacity=".28"/>`;
  const seamR = `<rect x="${-d / 2}" y="${h * 0.56}" width="${d}" height="2" fill="#000" opacity=".3"/>`;
  const top =
    `<rect x="${-w / 2 + 12}" y="${-d / 2 + 12}" width="${w - 24}" height="${d - 24}" fill="none" stroke="${p.ink}" stroke-width="1.2" opacity="${p.plain ? 0 : 0.5}"/>` +
    lockup(0, -6, w * 0.4, p);
  return cuboid(w, d, h, p.base, { top, left: seam, right: seamR });
}

function pouch(p) {
  const [body, d1] = lin([shade(p.base, -16), shade(p.base, 12), p.base, shade(p.base, 6), shade(p.base, -20)]);
  const [sheen, d2] = lin(["#ffffff00", "#ffffff55", "#ffffff00"]);
  let seal = "";
  for (let y = -147; y < -124; y += 4) seal += `<path d="M-104 ${y}H104" stroke="#000" stroke-width=".8" opacity=".12"/>`;
  return `<defs>${d1}${d2}</defs>
  <path d="M-106 -152H106L118 146Q0 172 -118 146Z" fill="${body}"/>
  ${seal}
  <path d="M-106 -122H106" stroke="#000" stroke-width="1.2" opacity=".2"/>
  <path d="M-107 -102H107M-107 -97H107" stroke="${shade(p.base, -30)}" stroke-width="1.6" opacity=".55"/>
  <rect x="-78" y="-150" width="34" height="298" fill="${sheen}" opacity=".5"/>
  <path d="M-116 118Q0 148 116 118" fill="none" stroke="#000" stroke-width="1.4" opacity=".2"/>
  <ellipse cx="0" cy="-137" rx="13" ry="5" fill="#000" opacity=".28"/>
  ${p.plain ? "" : `<rect x="-70" y="-70" width="140" height="150" rx="4" fill="${p.label ?? "none"}" opacity=".96"/>`}
  ${lockup(0, -22, 84, { ...p, ink: p.label ? p.labelInk : p.ink })}
  ${p.plain ? "" : `<rect x="-30" y="56" width="60" height="2" fill="${p.label ? p.labelInk : p.ink}" opacity=".6"/>`}`;
}

function tag(p) {
  let chain = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 11) * Math.PI;
    chain += `<circle cx="${-112 - Math.sin(a) * 46}" cy="${-Math.cos(a) * 46 - 46}" r="4.2" fill="${SILVER}"/>`;
  }
  return `${chain}
  <rect x="-120" y="-68" width="240" height="136" rx="24" fill="${p.base}"/>
  <rect x="-120" y="-68" width="240" height="136" rx="24" fill="none" stroke="${shade(p.base, -30)}" stroke-width="2"/>
  <rect x="-108" y="-56" width="216" height="112" rx="15" fill="none" stroke="${shade(p.base, 22)}" stroke-width="4" opacity=".7"/>
  <circle cx="-88" cy="0" r="10" fill="${shade(p.base, -60)}"/><circle cx="-88" cy="0" r="10" fill="none" stroke="${shade(p.base, 25)}" stroke-width="2.5"/>
  ${emboss(16, -10, 78, p, p.base)}`;
}

/** Flat ribbon following y = fn(x), printed with repeating marks. */
function strip(fn, x0, x1, width, p) {
  const pts = [];
  for (let x = x0; x <= x1; x += 5) pts.push(`${x} ${fn(x).toFixed(1)}`);
  const d = "M" + pts.join("L");
  let marks = "";
  if (!p.plain)
    for (let x = x0 + 36; x < x1 - 24; x += width * 1.7) {
      const a = (Math.atan2(fn(x + 3) - fn(x - 3), 6) * 180) / Math.PI;
      marks += `<g transform="translate(${x} ${fn(x)}) rotate(${a})">${
        p.brand
          ? `<text y="${width * 0.2}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="${width * 0.6}" fill="${p.ink}">${esc(p.brand[0])}</text>`
          : mark(0, 0, width * 0.6, p.ink, 62)
      }</g>`;
    }
  return `<path d="${d}" fill="none" stroke="${shade(p.base, -26)}" stroke-width="${width}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${p.base}" stroke-width="${width - 5}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="${width * 0.22}" transform="translate(0 ${-width * 0.22})"/>${marks}`;
}

function wovenLabel(p, w = 250, h = 104) {
  const stitches = (x) => `<path d="M${x} ${-h / 2 + 6}V${h / 2 - 6}" stroke="${p.ink}" stroke-width="1.6" stroke-dasharray="5 4" opacity=".75"/>`;
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="2" fill="${p.base}"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="url(#thread)"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="18" height="${h}" fill="#000" opacity=".16"/><rect x="${w / 2 - 18}" y="${-h / 2}" width="18" height="${h}" fill="#000" opacity=".16"/>
  ${stitches(-w / 2 + 9)}${stitches(w / 2 - 9)}
  <rect x="${-w / 2 + 26}" y="${-h / 2 + 8}" width="${w - 52}" height="${h - 16}" fill="none" stroke="${p.ink}" stroke-width="1.4" stroke-dasharray="2 2" opacity=".7"/>
  ${
    p.brand
      ? caps(0, 9, p.brand.toUpperCase(), Math.min(26, (w * 0.95) / p.brand.length), p.ink)
      : mark(-64, -1, 50, p.ink, 56) + caps(34, -2, "HERITAGE", 15, p.ink) + caps(34, 18, "SHAPES", 15, p.ink)
  }`;
}

function careLabel(p) {
  const s = `fill="none" stroke="${p.ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const [satin, d1] = lin([shade(p.base, -7), shade(p.base, 8), p.base, shade(p.base, -9)]);
  const bars = Array.from({ length: 5 }, (_, i) => `<rect x="-52" y="${42 + i * 12}" width="${i === 4 ? 60 : 104}" height="3.4" rx="1.7" fill="${p.ink}" opacity=".55"/>`).join("");
  return `<defs>${d1}</defs><rect x="-76" y="-160" width="152" height="320" rx="2" fill="${satin}"/>
  <rect x="-76" y="-160" width="152" height="22" fill="#000" opacity=".08"/>
  <path d="M-70 -138H70" stroke="${p.ink}" stroke-width="1.4" stroke-dasharray="5 4" opacity=".6"/>
  ${p.brand ? caps(0, -100, p.brand.toUpperCase(), 13, p.ink) : mark(0, -100, 44, p.ink, 56)}
  ${caps(0, -52, "100% COTTON", 11, p.ink)}
  <g transform="translate(-50 -8)"><path d="M-12 -7L-9 8H9L12 -7M-12 -2Q-6 2 0 -2T12 -2" ${s}/></g>
  <g transform="translate(-17 -8)"><path d="M0 -10L11 8H-11Z" ${s}/></g>
  <g transform="translate(17 -8)"><rect x="-10" y="-10" width="20" height="20" ${s}/><circle r="6.5" ${s}/></g>
  <g transform="translate(50 -8)"><path d="M-12 8H12L8 -5H-3Q-10 -5 -12 8Z" ${s}/></g>
  ${bars}${caps(0, 132, "SIZE M", 10, p.ink, 0.8)}`;
}

function card(p, text = "Thank you") {
  return `<g transform="rotate(-9) translate(-34 -22)"><rect x="-170" y="-118" width="340" height="236" rx="3" fill="${p.base}"/>
  <path d="M-170 -118L0 22L170 -118" fill="${shade(p.base, 9)}" stroke="${shade(p.base, -22)}" stroke-width="1.4"/></g>
  <g transform="rotate(5) translate(26 22)" filter="url(#ds2)"><rect x="-155" y="-105" width="310" height="210" rx="3" fill="${p.paper}"/>
  <rect x="-143" y="-93" width="286" height="186" fill="none" stroke="${shade(p.paper, -14)}" stroke-width="1.2"/>
  ${p.brand ? "" : mark(0, -52, 40, p.ink, 56)}
  <text y="22" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="56" fill="${p.ink}">${text}</text>
  ${caps(0, 62, (p.brand ?? "for choosing craft").toUpperCase(), 10.5, shade("#3b3b3b", 10), 0.75)}</g>`;
}

const DESIGNS = (c) => [
  `<circle r="34" fill="${c[0]}"/>${mark(0, 2, 38, "#fff", 60)}`,
  `<rect x="-36" y="-36" width="72" height="72" rx="18" fill="${c[1]}"/><path d="M-16 6L-4 18L18 -12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  `<path d="M-34 34V-4A34 34 0 0 1 34 -4V34Z" fill="${c[2]}"/><circle cy="2" r="11" fill="#fff"/>`,
  `<path d="M0 -38L10 -12L38 -12L15 5L24 33L0 16L-24 33L-15 5L-38 -12L-10 -12Z" fill="${c[3]}"/>`,
  `<rect x="-44" y="-20" width="88" height="40" rx="20" fill="${c[4]}"/><text y="6" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="16" letter-spacing="2" fill="#fff">SHAPES</text>`,
  `<circle r="34" fill="${c[5]}"/><circle r="20" fill="none" stroke="#fff" stroke-width="5"/>`,
];
const VIVID = ["#0b5f93", "#e2553d", "#f0b23a", "#18866b", "#1c2a39", "#c2478c"];

/** A grid of printed designs. `halo` adds the white kiss-cut border. */
function designs(cols, rows, gap, colors = VIVID, halo = false, sheenOp = 0) {
  const ds = DESIGNS(colors);
  let out = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) % ds.length;
      const x = (c - (cols - 1) / 2) * gap;
      const y = (r - (rows - 1) / 2) * gap;
      out += `<g transform="translate(${x} ${y})">${halo ? `<circle r="45" fill="#fff"/><circle r="45" fill="none" stroke="#00000022" stroke-width="1"/>` : ""}${ds[i]}${
        sheenOp ? `<path d="M-30 -12A34 34 0 0 1 12 -31" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="${sheenOp}"/>` : ""
      }</g>`;
    }
  return out;
}

function stickerSheet(p, gloss = true) {
  const [g, d1] = lin(["#ffffff00", "#ffffffaa", "#ffffff00", "#ffffff00", "#ffffff66", "#ffffff00"], 0, 0, 1, 1);
  return `<defs>${d1}</defs><rect x="-150" y="-200" width="300" height="400" rx="6" fill="${p.paper ?? "#f4f1ea"}"/>
  ${designs(3, 4, 94, p.colors ?? VIVID, true)}
  ${gloss ? `<rect x="-150" y="-200" width="300" height="400" rx="6" fill="${g}" opacity=".75"/>` : `<rect x="-150" y="-200" width="300" height="400" rx="6" fill="#8a8578" opacity=".07"/>`}`;
}

function looseSticker(i, gloss, colors = VIVID) {
  const [g, d1] = lin(["#ffffff00", "#ffffffb0", "#ffffff00"], 0, 0, 1, 1);
  return `<defs>${d1}</defs><circle r="45" fill="#fff"/>${DESIGNS(colors)[i]}${gloss ? `<circle r="45" fill="${g}" opacity=".8"/>` : ""}
  <path d="M26 37A45 45 0 0 0 44 10L22 16Z" fill="#e9e5db"/><path d="M26 37L22 16L44 10" fill="none" stroke="#00000025" stroke-width="1"/>`;
}

function dtfFilm(p) {
  return `<rect x="-170" y="-130" width="340" height="260" rx="4" fill="#fff" opacity=".42"/>
  <rect x="-170" y="-130" width="340" height="260" rx="4" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>
  ${designs(3, 2, 104, p.colors ?? VIVID)}
  <path d="M170 82L122 130H170Z" fill="#fff" opacity=".85"/><path d="M170 82L122 130" stroke="#00000030" stroke-width="1"/>`;
}

/** Greaseproof sheet printed with a staggered logo repeat, with a soft fold line. */
function butterPaper(p) {
  let repeat = "";
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++) {
      const x = -150 + c * 76 + (r % 2 ? 38 : 0);
      const y = -150 + r * 76;
      if (x < 168) repeat += mark(x, y, 34, p.ink, 52, 0.8);
    }
  const [sheen, d1] = lin(["#ffffff00", "#ffffff40", "#ffffff00"], 0, 0, 1, 1);
  return `<defs>${d1}</defs><clipPath id="bp${p.id}"><rect x="-180" y="-180" width="360" height="360" rx="3"/></clipPath>
  <rect x="-180" y="-180" width="360" height="360" rx="3" fill="${p.base}" opacity=".95"/>
  <g clip-path="url(#bp${p.id})">${repeat}</g>
  <rect x="-180" y="-180" width="360" height="360" rx="3" fill="${sheen}"/>
  <path d="M-180 -12L180 8" stroke="#000" stroke-width="1.4" opacity=".08"/><path d="M-180 -10L180 10" stroke="#fff" stroke-width="2" opacity=".35"/>`;
}

function tee(p) {
  return `<rect x="-230" y="-190" width="460" height="380" rx="18" fill="${p.base}"/><rect x="-230" y="-190" width="460" height="380" rx="18" fill="url(#weave)"/>
  <path d="M-62 -190Q0 -128 62 -190" fill="none" stroke="${shade(p.base, 20)}" stroke-width="12"/>
  <path d="M-230 20H230" stroke="#000" stroke-width="1.5" opacity=".2"/>
  <g transform="translate(0 -52)">${p.brand ? lockup(0, 0, 120, p, p.ink) : mark(0, 0, 118, VIVID[2], 52) + caps(0, 78, "HERITAGE SHAPES", 14, "#fff")}</g>`;
}

function uvFilm(p) {
  const [g, d1] = lin(["#ffffff00", "#ffffff66", "#ffffff00", "#ffffff40", "#ffffff00"], 0, 0, 1, 1);
  return `<defs>${d1}</defs><rect x="-190" y="-150" width="380" height="300" rx="8" fill="#fff" opacity=".13"/>
  ${designs(3, 2, 116, p.colors ?? ["#0b5f93", "#141a1f", "#b98b4e", "#0f6e5a", "#8a2f3c", "#2c3e8f"], false, 0.8)}
  <rect x="-190" y="-150" width="380" height="300" rx="8" fill="${g}"/>
  <rect x="-190" y="-150" width="380" height="300" rx="8" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>
  <path d="M190 96L136 150H190Z" fill="#fff" opacity=".5"/>`;
}

/* ----------------------------------------------------------------- scenes */

const DEFS = `<defs>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c6a32"/><stop offset=".35" stop-color="#ecd49c"/><stop offset=".62" stop-color="#b88a45"/><stop offset="1" stop-color="#f1dda8"/></linearGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b9399"/><stop offset=".35" stop-color="#f4f6f7"/><stop offset=".62" stop-color="#a3abb1"/><stop offset="1" stop-color="#e7eaec"/></linearGradient>
<filter id="ds" x="-40%" y="-40%" width="190%" height="200%"><feGaussianBlur in="SourceAlpha" stdDeviation="16"/><feOffset dx="18" dy="26"/><feComponentTransfer><feFuncA type="linear" slope=".34"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="ds2" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feOffset dx="4" dy="7"/><feComponentTransfer><feFuncA type="linear" slope=".3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
<pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0L6 6" stroke="#000" stroke-width=".8" opacity=".16"/><path d="M6 0L0 6" stroke="#fff" stroke-width=".6" opacity=".1"/></pattern>
<pattern id="thread" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1H4" stroke="#fff" stroke-width=".7" opacity=".13"/><path d="M1 0V4" stroke="#000" stroke-width=".7" opacity=".13"/></pattern>
<radialGradient id="light" cx=".28" cy=".18" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset=".64" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
</defs>`;

/**
 * items: [{ svg, x, y, s, r, flat }]  (flat → tight contact shadow for things lying on the surface)
 */
function scene({ w = 1400, h = 1050, bg = "#e8e2d6", fabric = false, floor = true, items, zoom = 1, pan = [0, 0] }) {
  const body = items
    .map(
      (it) =>
        `<g transform="translate(${it.x} ${it.y}) rotate(${it.r ?? 0}) scale(${it.s ?? 1})" filter="url(#${it.flat ? "ds2" : "ds"})">${it.svg}</g>`,
    )
    .join("");
  const backdrop =
    bg === "none"
      ? ""
      : `<rect width="${w}" height="${h}" fill="${bg}"/>${fabric ? `<rect width="${w}" height="${h}" fill="url(#weave)"/>` : ""}
         <rect width="${w}" height="${h}" fill="url(#light)"/>${floor && !fabric ? `<rect width="${w}" height="${h}" fill="url(#floor)"/>` : ""}`;
  const grain = bg === "none" ? "" : `<rect width="${w}" height="${h}" filter="url(#grain)" opacity=".09"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${backdrop}
  <g transform="translate(${w / 2 + pan[0]} ${h / 2 + pan[1]}) scale(${zoom}) translate(${-w / 2} ${-h / 2})">${body}</g>${grain}</svg>`;
}

async function save(file, svg, q = 84) {
  const out = path.join(ROOT, file);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: q }).toFile(out);
  console.log("✓", file);
}

/* --------------------------------------------------------------- palettes */

const NAVY = { base: "#0d3f5f", accent: "#c9a66b", ink: GOLD, paper: "#f8f4ea" };
const IVORY = { base: "#efe8da", accent: "#0b5f93", ink: "#0b5f93", paper: "#fbf9f3" };
const NOIR = { base: "#17191c", accent: "#b99355", ink: GOLD, paper: "#f6f2e8" };
const KRAFT = { base: "#b9966a", accent: "#8a6c47", ink: "#3a2a18", paper: "#efe6d4", plain: true };
const BLUE = { base: "#05649a", accent: "#e9dfc9", ink: "#f4efe4", paper: "#fbf9f3" };
const SAND = { base: "#d6c2a1", accent: "#3a2f22", ink: "#2a2118", paper: "#fbf7ee" };
const SAGE = { base: "#7c8f7a", accent: "#e9e2cf", ink: "#f3eee0", paper: "#f7f4ea" };

/* --------------------------------------------------------------- products */
// Three views per product: studio hero, macro close-up, alternate colourway.

const PRODUCTS = {
  "butter-paper": (v) => ({
    bg: ["#d8cbb5", "#cfd3cf", "#2a2724"][v],
    items: [
      { svg: butterPaper({ id: "a", base: "#d9c19b", ink: "#6f4424" }), x: 560, y: 560, s: 1.35, r: -12, flat: true },
      { svg: butterPaper({ id: "b", base: "#f6f1e6", ink: ["#0b5f93", "#1f5c3a", "#9a2f2a"][v] }), x: 850, y: 470, s: 1.35, r: 9, flat: true },
    ],
  }),
  "dtf-stickers": (v) => ({
    bg: ["#d9d4c9", "#cfd6da", "#1d2125"][v],
    items: [
      { svg: tee({ base: ["#1b1e22", "#f1ede4", "#0d3f5f"][v] }), x: 560, y: 520, s: 1.5, r: -5, flat: true },
      { svg: dtfFilm({}), x: 960, y: 650, s: 1.35, r: 9, flat: true },
    ],
  }),
  "uv-dtf-stickers": (v) => ({
    bg: ["#9fb1b8", "#c9bfae", "#262c31"][v],
    items: [
      { svg: uvFilm({}), x: 620, y: 480, s: 1.8, r: -7, flat: true },
      { svg: uvFilm({ colors: ["#141a1f", "#b98b4e", "#0b5f93", "#141a1f", "#0f6e5a", "#b98b4e"] }), x: 980, y: 740, s: 1.05, r: 10, flat: true },
    ],
  }),
  "glossy-matte-stickers": (v) => ({
    bg: ["#e3ded3", "#d6dcdf", "#22272c"][v],
    items: [
      { svg: stickerSheet({}, true), x: 510, y: 520, s: 1.6, r: -8, flat: true },
      { svg: stickerSheet({ paper: "#ece8df" }, false), x: 900, y: 540, s: 1.6, r: 6, flat: true },
      { svg: looseSticker(0, true), x: 1170, y: 300, s: 1.7, r: 14, flat: true },
      { svg: looseSticker(3, false), x: 1180, y: 800, s: 1.5, r: -10, flat: true },
    ],
  }),
};

// view 0: studio wide · view 1: macro close-up · view 2: alternate colourway, darker set
const VIEW = [
  { zoom: 1, pan: [0, 0] },
  { zoom: 1.75, pan: [120, 40] },
  { zoom: 1.12, pan: [-30, 0] },
];

async function products() {
  for (const [slug, fn] of Object.entries(PRODUCTS))
    for (let v = 0; v < 3; v++)
      await save(`products/${slug}${v ? `-${v + 1}` : ""}.webp`, scene({ ...fn(v), ...VIEW[v] }));

  for (const gloss of [true, false])
    await save(
      `products/${gloss ? "glossy" : "matte"}-stickers.webp`,
      scene({
        bg: gloss ? "#d6dcdf" : "#e3ded3",
        items: [
          { svg: stickerSheet({ paper: gloss ? "#f4f1ea" : "#ece8df" }, gloss), x: 590, y: 520, s: 1.9, r: -7, flat: true },
          { svg: looseSticker(0, gloss), x: 1010, y: 360, s: 2.2, r: 12, flat: true },
          { svg: looseSticker(2, gloss), x: 1060, y: 700, s: 1.9, r: -9, flat: true },
        ],
      }),
    );
}

/* ---------------------------------------------------------------- cutouts */
// Transparent product cut-outs for the floating hero and showcase scenes.

async function cutouts() {
  const C = (svg, s = 1.5, r = 0, flat = false) => scene({ w: 800, h: 800, bg: "none", items: [{ svg, x: 400, y: 400, s, r, flat }] });
  const wave = (x) => 26 * Math.sin(x / 58);
  const set = {
    bag: C(bag(NAVY), 1.7, -4),
    "bag-ivory": C(bag(IVORY), 1.7, 3),
    box: C(box(NOIR, { w: 250, d: 250, h: 96 }), 1.35),
    "box-ivory": C(box(IVORY, { w: 220, d: 220, h: 80 }), 1.4),
    pouch: C(pouch({ ...BLUE, label: "#f7f3ea", labelInk: "#05649a" }), 1.8, 5),
    ribbon: C(`<g transform="translate(-230 0)">${strip(wave, 0, 460, 54, NAVY)}</g>`, 1.45, -12, true),
    label: C(wovenLabel({ base: "#121417", ink: "#d2b071" }), 2.3, -8, true),
    card: C(card({ base: "#cdb596", paper: "#fbf8f0", ink: GOLD }), 1.55, 0, true),
    sticker: C(looseSticker(0, true), 4.4, 10, true),
    tag: C(tag({ base: "#101214", ink: "#101214" }), 2, 8, true),
  };
  for (const [name, svg] of Object.entries(set)) await save(`mockups/cutout-${name}.webp`, svg, 88);
}

// mockups/set-standard.webp and mockups/set-branded.webp are supplied photographs, not generated here.

/* -------------------------------------------------------------- portfolio */

async function portfolio() {
  const forma = { base: "#e8cfc2", accent: "#a5563f", ink: "#8a4230", paper: "#fbf5ef", brand: "Forma Skin" };
  const roast = { base: "#b08d62", accent: "#20382e", ink: "#20382e", paper: "#f3ead8", brand: "Roast & Ritual" };
  const north = { base: "#dfe2e4", accent: "#1f47c4", ink: "#1f47c4", paper: "#f7f8f9", brand: "Northline" };
  const atelier = { base: "#efe9dc", accent: "#15171a", ink: "#15171a", paper: "#faf7f0", brand: "Atelier 27" };
  const velora = { base: "#cfc3e6", accent: "#3b2a68", ink: "#3b2a68", paper: "#f8f5fd", brand: "Velora" };
  const wave = (x) => 20 * Math.sin(x / 52);

  const scenes = {
    "forma-skin": {
      w: 1200, h: 1200, bg: "#f1e1d6",
      items: [
        { svg: pouch({ ...forma, base: "#f6ebe2" }), x: 420, y: 560, s: 1.9, r: -5 },
        { svg: box(forma, { w: 220, d: 220, h: 110 }), x: 830, y: 640, s: 1.45 },
        { svg: card({ ...forma, base: "#d9a995" }), x: 760, y: 1010, s: 0.95, flat: true },
      ],
    },
    "roast-and-ritual": {
      w: 1200, h: 1500, bg: "#d9cdb8",
      items: [
        { svg: pouch({ ...roast, label: "#20382e", labelInk: "#e9dcc0" }), x: 430, y: 620, s: 2.3, r: -4 },
        { svg: pouch({ ...roast, base: "#20382e", ink: "#e9dcc0" }), x: 830, y: 760, s: 1.9, r: 6 },
        { svg: stickerSheet({ paper: "#f3ead8", colors: ["#20382e", "#b08d62", "#20382e", "#8c5a2b", "#20382e", "#b08d62"] }, false), x: 380, y: 1250, s: 0.9, r: -12, flat: true },
      ],
    },
    northline: {
      w: 1400, h: 1050, bg: "#c9ced2",
      items: [
        { svg: bag(north), x: 480, y: 520, s: 1.8, r: -3 },
        { svg: tag({ ...north, base: "#1f47c4" }), x: 980, y: 380, s: 1.5, r: 10, flat: true },
        { svg: wovenLabel({ ...north, base: "#f4f5f6" }), x: 1000, y: 720, s: 1.7, r: -6, flat: true },
      ],
    },
    "atelier-27": {
      w: 1200, h: 1200, bg: "#8a8375", fabric: true,
      items: [
        { svg: wovenLabel({ ...atelier, base: "#15171a", ink: "#efe9dc" }), x: 520, y: 380, s: 2.5, r: -8, flat: true },
        { svg: wovenLabel(atelier), x: 720, y: 660, s: 2.2, r: 5, flat: true },
        { svg: careLabel({ ...atelier, base: "#f7f4ec" }), x: 330, y: 900, s: 1.3, r: -14, flat: true },
        { svg: tag({ ...atelier, base: "#15171a" }), x: 860, y: 960, s: 1.4, r: 9, flat: true },
      ],
    },
    velora: {
      w: 1200, h: 1500, bg: "#e6e0f1",
      items: [
        { svg: box(velora, { w: 300, d: 240, h: 90 }), x: 600, y: 600, s: 1.7 },
        { svg: card({ ...velora, base: "#3b2a68", paper: "#fbf9ff" }), x: 520, y: 1150, s: 1.3, flat: true },
        { svg: looseSticker(2, true, ["#3b2a68", "#3b2a68", "#7a5fc2", "#3b2a68", "#3b2a68", "#3b2a68"]), x: 960, y: 1090, s: 2, r: 14, flat: true },
      ],
    },
  };
  for (const [slug, cfg] of Object.entries(scenes)) await save(`images/portfolio-${slug}.webp`, scene(cfg));
}

/* ------------------------------------------------------------ brand files */

async function brand() {
  const logo = (c) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 741 568" fill="none" stroke="${c}" stroke-width="52"><path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z"/><path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z"/></svg>`;
  await writeFile(path.join(ROOT, "logo-mark.svg"), logo("#05649a"));
  await writeFile(
    path.join(ROOT, "..", "app", "icon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#05649a"/><g transform="translate(11 16) scale(.0567)" fill="none" stroke="#fff" stroke-width="62"><path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z"/><path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z"/></g></svg>`,
  );
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${DEFS}<rect width="1200" height="630" fill="#0b0d0f"/>
  <circle cx="980" cy="120" r="380" fill="#05649a" opacity=".35" filter="url(#ds)"/>
  ${mark(600, 230, 190, "#3ba4db")}
  ${caps(600, 400, "HERITAGE SHAPES", 54, "#f2efe9")}
  ${caps(600, 462, "WHERE PACKAGING MEETS LEGACY", 20, "#c9a66b")}</svg>`;
  await sharp(Buffer.from(og)).png().toFile(path.join(ROOT, "og.png"));
  console.log("✓ logo-mark.svg, icon.svg, og.png");
}

const only = process.argv[2];
const jobs = { products, cutouts, portfolio, brand };
for (const [name, job] of Object.entries(jobs)) if (!only || only === name) await job();
