// Saves the AI prompt wording to the database (PRD section 10):
//   - prompt_templates: the fixed sentences, shared ("global") and per product
//   - attribute_values.prompt_fragment: one sentence per option a customer can pick
// Existing wording is left alone, so edits made later in the database are never overwritten.
// Pass --force to replace version 1 of everything with the wording in this file.
// Usage: node scripts/seed-prompts.mjs [--force]
import { readFileSync } from "node:fs";
import pg from "pg";

const force = process.argv.includes("--force");
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const dbUrl = new URL(env.SUPABASE_DB_URL || env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL);
dbUrl.searchParams.delete("sslmode");
const db = new pg.Client({ connectionString: dbUrl.toString(), ssl: { rejectUnauthorized: false } });
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ───────────── sentences shared by every product ───────────── */

const GLOBAL = {
  base: "You are a commercial packaging visualisation engine. Create ONE photorealistic product photograph of the item described below, exactly as it would look when manufactured.",
  logo: "Use the attached logo image exactly as provided. Placement: {placement} Keep its shapes, letters, spacing and proportions unchanged.",
  logo_default: "Logo printed flat in its original colours, with crisp edges.",
  photography: "Professional studio product photography, three-quarter view at about 45 degrees, soft key light from the upper left, gentle natural shadow beneath the product.",
  background: "Minimal warm-grey seamless studio backdrop.",
  quality: "Photorealistic, sharp focus, true-to-life material texture, believable scale, high detail.",
  negative: "Do not redesign, redraw, recolour, crop or distort the logo. Do not add any text, slogans, barcodes, watermarks or other brands. Do not add people, hands or extra products. Do not use unrealistic materials.",
  safety: "Show only the product described. No people, no offensive content, no imitation of third-party trademarks other than the provided logo.",
  output: "One single image, square 1:1.",
};

/* ───────────── per product: shape, build, and any wording that differs from the shared one ───────────── */

const PRODUCTS = {
  "shopping-bags": {
    product: "A rectangular paper shopping bag standing upright, portrait format, proportions about 3:4:1 (width:height:depth), with a folded reinforced top edge, side gussets and a flat base.",
    construction: "Two rope handles in a colour matching the bag, knotted inside the top edge.",
  },
  pouches: {
    product: "A soft fabric drawstring pouch, portrait format about 4:5, gently filled so it holds its shape, gathered at the top.",
    construction: "A cotton drawstring cord threaded through a stitched channel at the top, with neat stitched side seams.",
    photography: "Professional studio product photography, front view from slightly above, soft key light from the upper left so the fabric weave is visible, gentle natural shadow.",
  },
  "tote-bags": {
    product: "A flat fabric tote bag with a roughly square body, about 38 cm wide by 42 cm tall, hanging straight with an open top.",
    construction: "Two long shoulder straps of the same fabric, stitched to the top hem with reinforced cross-stitching.",
    photography: "Professional studio product photography, straight-on front view, soft key light from the upper left so the fabric weave is visible, gentle natural shadow.",
  },
  zippers: {
    product: "A closed garment zipper shown at close range on plain fabric. The custom zipper puller (pull tab) is the hero of the image, and the logo sits on the flat face of the puller.",
    construction: "Even zipper teeth on woven tape, a slider body, and a flat rectangular pull tab with rounded corners.",
    photography: "Macro product photography, close three-quarter view of the puller, shallow depth of field, soft key light from the upper left with a low fill so fine surface detail is visible.",
  },
  flyers: {
    product: "A single flat printed flyer, A5 portrait, with a second identical copy fanned slightly beneath it.",
    construction: "Clean trimmed edges, no folds. The logo is the only printed element; the rest of the sheet is clean empty space in the base colour.",
    photography: "Professional studio product photography, top-down view at a slight angle, soft even light, gentle natural shadow showing the paper thickness.",
  },
  ribbons: {
    product: "A roll of fabric ribbon about 25 mm wide on a plain spool, with a length unrolled and curling across the surface toward the camera.",
    construction: "Neatly woven straight edges along both sides of the ribbon.",
    logo: "Use the attached logo image exactly as provided. Repeat it along the length of the ribbon at regular intervals, small and centred across the ribbon width. Keep its shapes, letters, spacing and proportions unchanged.",
    photography: "Close-up product photography, low three-quarter view along the unrolled ribbon, shallow depth of field, soft key light from the upper left so the ribbon's weave and sheen are visible.",
  },
  "woven-labels": {
    product: "A small woven clothing label, about 50 mm wide by 20 mm tall, shown at close range, with two more identical labels arranged loosely nearby.",
    construction: "Folded or heat-cut ends, with fine woven thread texture visible across the whole label.",
    logo_default: "The logo is woven into the label with thread, not printed: fine thread texture is visible inside the logo shapes, in thread colours matched to the logo.",
    photography: "Macro product photography, close three-quarter view, shallow depth of field, soft key light from the upper left at a low angle so individual threads are visible.",
  },
  "care-labels": {
    product: "A small printed garment care label, portrait format about 30 mm wide by 60 mm tall, shown at close range, with one more identical label nearby.",
    construction: "Soft flexible label with a folded top edge for stitching. The logo sits in the upper part of the label; the rest of the label is left blank.",
    photography: "Macro product photography, close three-quarter view, shallow depth of field, soft even light so the label surface and print are clearly visible.",
  },
  "thank-you-cards": {
    product: "A thick flat rectangular card, A6 landscape, lying at a slight angle with a second identical card beneath it.",
    construction: "Crisp square-cut edges, with the thickness of the board visible at the edge.",
    photography: "Professional studio product photography, top-down view at a slight angle, soft key light from the upper left at a low angle so surface finishes and relief are visible, gentle natural shadow.",
  },
  "butter-paper": {
    product: "Thin food wrapping paper. One sheet lies flat with a corner folded over; a second sheet is loosely wrapped around a plain rectangular parcel beside it.",
    construction: "Lightweight paper with soft natural folds and creases, cleanly cut straight edges.",
    photography: "Professional studio product photography, three-quarter view from above, soft even light so the thin paper and its print are clearly visible, gentle natural shadow.",
  },
  stickers: {
    product: "A set of stickers of the logo on a backing sheet. One sticker is peeled halfway off the sheet; the others lie flat.",
    construction: "Thin, flat stickers with clean cut edges.",
    logo: "Use the attached logo image exactly as provided. Each sticker shows the logo once, filling the sticker. Keep its shapes, letters, spacing and proportions unchanged.",
    photography: "Close-up product photography, three-quarter view from above, soft key light from the upper left so the sticker surface finish is visible, gentle natural shadow.",
  },
};

/* ───────────── one sentence per option ───────────── */

// [attribute key, label]: options that are not part of the product catalogue are created here.
const ATTRIBUTES = [
  ["placement", "Logo placement", 5],
  ["size", "Size", 6],
];

// attribute → option label → { text, role?, hex? }
const OPTIONS = {
  material: {
    "Art Card": { text: "Premium coated art card, smooth and rigid." },
    "Kraft Paper": { text: "Kraft paper with visible fine paper fibres." },
    "Textured Paper": { text: "Uncoated textured paper with a subtle felt-like grain." },
    "Coated Paper": { text: "Smooth coated paper stock." },
    "Cotton Canvas": { text: "Heavy cotton canvas with a visible plain weave." },
    Jute: { text: "Coarse natural jute (hessian) with a loose, visible weave." },
    "Nylon Tape": { text: "Woven nylon zipper tape with moulded nylon coil teeth." },
    Metal: { text: "Polished metal zipper teeth and puller." },
    Satin: { text: "Smooth satin with a soft sheen." },
    Grosgrain: { text: "Grosgrain with fine horizontal ribs." },
    Cotton: { text: "Soft natural cotton with a matte woven texture." },
    "Woven Polyester": { text: "Fine woven polyester damask with tight, crisp thread detail." },
    "Greaseproof Paper": { text: "Thin, slightly translucent greaseproof food paper." },
    "Tissue Paper": { text: "Very thin, soft tissue paper with gentle natural creases." },
    "White Vinyl": { text: "Opaque white vinyl sticker material." },
    "PET Transfer Film": { text: "Clear PET transfer film: only the logo itself is visible, with no background around it." },
    "Clear Film": { text: "Transparent clear film: the surface beneath shows through around the logo." },
  },
  finish: {
    Matte: { role: "surface", text: "Matte surface with soft diffuse reflections and no glare." },
    Gloss: { role: "surface", text: "High-gloss surface with clear, bright reflections." },
    "Soft Touch": { role: "surface", text: "Soft-touch lamination: a velvety, deep matte surface with almost no reflection." },
    "No Lamination": { role: "surface", text: "No lamination: the bare surface of the stock with its natural low sheen." },
    Foil: { role: "logo", text: "Logo applied as metallic gold hot-foil stamping: mirror-like, with crisp edges and realistic light reflections, very slightly pressed into the surface. The logo is gold foil, not its original colours." },
    Embossed: { role: "logo", text: "Logo applied as a blind emboss: raised from the surface in exactly the same colour as the material around it, with no ink and no foil. It is visible only through soft highlights and shadows on its raised edges. Light the product from a low side angle so the relief reads clearly." },
    Debossed: { role: "logo", text: "Logo applied as a blind deboss: pressed down into the surface in exactly the same colour as the material around it, with no ink and no foil. It is visible only through soft shadows inside its recessed edges. Light the product from a low side angle so the depth reads clearly." },
    "Spot UV": { role: "logo", text: "Logo applied as spot UV varnish: a clear, slightly raised, high-gloss coating in the shape of the logo, in the same colour as the material beneath it. It is visible through its glossy reflection against the duller surface around it." },
    "Full-Colour Print": { role: "logo", text: "Logo printed flat in full colour, matching the logo's original colours exactly, with crisp edges." },
    "Plain Printing": { role: "logo", text: "Logo screen printed directly onto the fabric in flat ink, with the fabric weave faintly visible through the ink." },
    DTF: { role: "logo", text: "Logo applied as a full-colour DTF (direct-to-film) transfer: vivid and opaque, sitting very slightly raised on top of the fabric, with sharp edges." },
    "Die Cut": { role: "shape", text: "The item is die cut to follow the outline of the logo, with a narrow even border around it." },
  },
  logo_type: {
    "Gold Foil": { role: "logo", text: "Logo applied as metallic gold hot-foil stamping: mirror-like, with crisp edges and realistic light reflections, very slightly pressed into the surface. The logo is gold foil, not its original colours." },
    Embossed: { role: "logo", text: "Logo applied as a blind emboss: raised from the surface in exactly the same colour as the material around it, with no ink and no foil. It is visible only through soft highlights and shadows on its raised edges. Light the product from a low side angle so the relief reads clearly." },
    Debossed: { role: "logo", text: "Logo applied as a blind deboss: pressed down into the surface in exactly the same colour as the material around it, with no ink and no foil. It is visible only through soft shadows inside its recessed edges. Light the product from a low side angle so the depth reads clearly." },
    "Spot UV": { role: "logo", text: "Logo applied as spot UV varnish: a clear, slightly raised, high-gloss coating in the shape of the logo, in the same colour as the material beneath it. It is visible through its glossy reflection against the duller surface around it." },
    "Full-Colour Print": { role: "logo", text: "Logo printed flat in full colour, matching the logo's original colours exactly, with crisp edges." },
  },
  colour: {
    "Matte Black": { hex: "#17191c", text: "Solid deep black (#17191c)." },
    Ivory: { hex: "#efe8da", text: "Solid warm ivory off-white (#efe8da)." },
    "Natural Kraft": { hex: "#b9966a", text: "Natural kraft brown (#b9966a)." },
    "Forest Green": { hex: "#1f4d3a", text: "Solid deep forest green (#1f4d3a)." },
    Burgundy: { hex: "#6b1f2a", text: "Solid deep burgundy red (#6b1f2a)." },
    Navy: { hex: "#0d3f5f", text: "Solid deep navy blue (#0d3f5f)." },
    Blush: { hex: "#e8cfc2", text: "Solid soft blush pink (#e8cfc2)." },
    Sage: { hex: "#8a9a82", text: "Solid muted sage green (#8a9a82)." },
    Black: { hex: "#17191c", text: "Solid black (#17191c)." },
    Canvas: { hex: "#e6dcc8", text: "Natural unbleached canvas, a warm cream beige (#e6dcc8)." },
  },
  placement: {
    "Centre front": { text: "centred on the front face, at about 40% of its width." },
    "Upper centre": { text: "centred horizontally in the upper third of the front face, at about 30% of its width." },
    "Lower corner": { text: "small, in the lower right corner of the front face, at about 18% of its width." },
    "All-over repeat": { text: "repeated as a small, evenly spaced all-over pattern across the whole front face." },
  },
  size: {
    Small: { text: "A small version of this product." },
    Medium: { text: "A medium, standard-size version of this product." },
    Large: { text: "A large version of this product." },
    Custom: { text: "" },
  },
};

await db.connect();
let templates = 0, fragments = 0;
try {
  await db.query("begin");

  const template = async (scope, productId, module, body) => {
    const sql = force
      ? `insert into public.prompt_templates (scope, product_id, module, version, body, is_active) values ($1, $2, $3, 1, $4, true)
         on conflict (scope, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid), module, version) do update set body = excluded.body`
      : `insert into public.prompt_templates (scope, product_id, module, version, body, is_active) values ($1, $2, $3, 1, $4, true)
         on conflict (scope, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid), module, version) do nothing`;
    templates += (await db.query(sql, [scope, productId, module, body])).rowCount;
  };

  for (const [module, body] of Object.entries(GLOBAL)) await template("global", null, module, body);

  for (const [slug, modules] of Object.entries(PRODUCTS)) {
    const product = (await db.query("select id from public.products where slug = $1", [slug])).rows[0];
    if (!product) throw new Error(`Product "${slug}" is not in the database. Run scripts/seed-catalogue.mjs first.`);
    for (const [module, body] of Object.entries(modules)) await template("product", product.id, module, body);
  }

  for (const [k, label, sort] of ATTRIBUTES) await db.query("insert into public.attributes (key, label, input_type, sort) values ($1, $2, 'select', $3) on conflict (key) do nothing", [k, label, sort]);

  for (const [attr, options] of Object.entries(OPTIONS)) {
    const attribute = (await db.query("select id from public.attributes where key = $1", [attr])).rows[0];
    if (!attribute) throw new Error(`Attribute "${attr}" is not in the database. Run scripts/seed-catalogue.mjs first.`);
    for (const [sort, [label, o]] of Object.entries(options).entries()) {
      const r = await db.query(
        `insert into public.attribute_values (attribute_id, key, label, prompt_fragment, prompt_role, hex, sort) values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (attribute_id, key) do update set
           prompt_fragment = ${force ? "excluded.prompt_fragment" : "coalesce(attribute_values.prompt_fragment, excluded.prompt_fragment)"},
           prompt_role = ${force ? "excluded.prompt_role" : "coalesce(attribute_values.prompt_role, excluded.prompt_role)"},
           hex = coalesce(attribute_values.hex, excluded.hex)`,
        [attribute.id, key(label), label, o.text, o.role ?? null, o.hex ?? null, sort],
      );
      fragments += r.rowCount;
    }
  }

  await db.query("commit");
  console.log(`Prompts saved: ${templates} template sentences written, ${fragments} option sentences checked.`);
} catch (e) {
  await db.query("rollback").catch(() => {});
  console.error("Saving prompts failed:", e.message);
  process.exitCode = 1;
} finally {
  await db.end().catch(() => {});
}
