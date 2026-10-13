// Copies the catalogue in data/products.ts into the database and uploads every product photo
// to Supabase Storage (bucket "product-images"), then links each photo to its product.
// Safe to run again: rows are updated in place and files are overwritten.
// Usage: node --experimental-strip-types scripts/seed-catalogue.mjs
import { readFileSync } from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";
import { basename } from "node:path";
import pg from "pg";
import { categories, products } from "../data/products.ts";
import { STUDIO_SLUGS as STUDIO } from "../lib/studio.ts";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET = "product-images";
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const dbUrl = new URL(env.SUPABASE_DB_URL || env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL);
dbUrl.searchParams.delete("sslmode");
const db = new pg.Client({ connectionString: dbUrl.toString(), ssl: { rejectUnauthorized: false } });
await db.connect();
const one = async (sql, params) => (await db.query(sql, params)).rows[0];

// Uploads need a signed-in admin. With the secret key we use that; without it, a short-lived
// admin account is created for the upload and removed again at the end.
let token = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
let tempUser = null;
if (!token) {
  tempUser = randomUUID();
  const email = `catalogue-upload-${Date.now()}@heritageshapes.invalid`;
  const password = randomBytes(18).toString("hex");
  await db.query(
    `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change, email_change_token_new)
     values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, extensions.crypt($3, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Catalogue upload"}', now(), now(), '', '', '', '')`,
    [tempUser, email, password],
  );
  await db.query("insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at) values (gen_random_uuid(), $1::uuid, $2::text, $3, 'email', now(), now(), now())", [tempUser, tempUser, JSON.stringify({ sub: tempUser, email })]);
  await db.query("update public.profiles set role = 'admin' where id = $1", [tempUser]);
  const login = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }).then((r) => r.json());
  token = login.access_token;
  if (!token) throw new Error("Could not sign in for the upload.");
}

async function upload(localPath, storagePath) {
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "max-age=31536000" },
    body: readFileSync(`public${localPath}`),
  });
  if (!res.ok) throw new Error(`Upload failed for ${storagePath}: ${res.status} ${await res.text()}`);
  return `${URL_}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// An attribute and its options, created once and reused across products.
async function attribute(k, label, sort) {
  return (await one("insert into public.attributes (key, label, input_type, sort) values ($1, $2, 'select', $3) on conflict (key) do update set label = excluded.label, sort = excluded.sort returning id", [k, label, sort])).id;
}
async function value(attributeId, label, meta) {
  return (await one("insert into public.attribute_values (attribute_id, key, label, meta) values ($1, $2, $3, $4) on conflict (attribute_id, key) do update set label = excluded.label, meta = excluded.meta returning id", [attributeId, key(label), label, JSON.stringify(meta)])).id;
}

let uploaded = 0;
try {
  const attr = {
    material: await attribute("material", "Material", 1),
    finish: await attribute("finish", "Finish", 2),
    logo_type: await attribute("logo_type", "Logo type", 3),
    colour: await attribute("colour", "Colour", 4),
  };

  const categoryId = {};
  for (const [i, c] of categories.entries()) {
    categoryId[c.id] = (await one("insert into public.product_categories (name, slug, blurb, sort) values ($1, $2, $3, $4) on conflict (slug) do update set name = excluded.name, blurb = excluded.blurb, sort = excluded.sort returning id", [c.name, c.id, c.blurb, i])).id;
  }

  for (const [i, p] of products.entries()) {
    // Upload first, so a failed upload never leaves a product pointing at a missing file.
    const shots = [
      { kind: "main", image: p.image },
      ...p.gallery.map((image) => ({ kind: "gallery", image })),
      ...(p.variants ?? []).map((v) => ({ kind: "variant", image: v.image, label: v.label, effect: v.effect, colour: v.colour })),
    ];
    for (const s of shots) {
      s.path = `${p.slug}/${basename(s.image)}`;
      s.url = await upload(s.image, s.path);
      uploaded++;
    }

    await db.query("begin");
    const productId = (
      await one(
        `insert into public.products (category_id, name, slug, status, ai_enabled, moq, moq_text, short_description, description, finish_label, featured, why, customization, applications, tags, sort)
         values ($1, $2, $3, 'active', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         on conflict (slug) do update set category_id = excluded.category_id, name = excluded.name, status = 'active', ai_enabled = excluded.ai_enabled, moq = excluded.moq, moq_text = excluded.moq_text,
           short_description = excluded.short_description, description = excluded.description, finish_label = excluded.finish_label, featured = excluded.featured,
           why = excluded.why, customization = excluded.customization, applications = excluded.applications, tags = excluded.tags, sort = excluded.sort
         returning id`,
        [categoryId[p.category], p.name, p.slug, STUDIO.includes(p.slug), Number(p.moq.replace(/,/g, "").match(/\d+/)?.[0]) || null, p.moq, p.shortDescription, p.description, p.finishLabel ?? null, Boolean(p.featured), p.why, p.customization, p.applications, p.tags, i],
      )
    ).id;

    // Options: replaced as a set, so an option removed from the catalogue disappears here too.
    await db.query("delete from public.product_attributes where product_id = $1", [productId]);
    const groups = [
      ["material", p.materials.map((m) => [m.name, { tone: m.tone }])],
      ["finish", p.finishes.map((f) => [f.name, { effect: f.effect }])],
      ["logo_type", (p.logoTypes ?? []).map((l) => [l.name, { effect: l.effect }])],
      ["colour", (p.colours ?? []).map((c) => [c, {}])],
    ];
    for (const [n, [k, options]] of groups.entries()) {
      if (!options.length) continue;
      const ids = [];
      for (const [label, meta] of options) ids.push(await value(attr[k], label, meta));
      const pa = (await one("insert into public.product_attributes (product_id, attribute_id, required, multi, sort, default_value_id) values ($1, $2, $3, $4, $5, $6) returning id", [productId, attr[k], k !== "colour", k === "finish" && !p.logoTypes && !p.finishLabel, n, ids[0]])).id;
      for (const [order, id] of ids.entries()) await db.query("insert into public.product_attribute_values (product_attribute_id, attribute_value_id, extra) values ($1, $2, $3)", [pa, id, JSON.stringify({ sort: order })]);
    }

    await db.query("delete from public.product_images where product_id = $1", [productId]);
    for (const [order, s] of shots.entries()) {
      await db.query("insert into public.product_images (product_id, kind, storage_bucket, storage_path, url, label, effect, colour, sort) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [productId, s.kind, BUCKET, s.path, s.url, s.label ?? null, s.effect ?? null, s.colour ?? null, order]);
    }
    await db.query("commit");
    console.log(`${p.name}: ${shots.length} photos`);
  }
  console.log(`Done: ${products.length} products, ${uploaded} photos uploaded.`);
} catch (e) {
  await db.query("rollback").catch(() => {});
  console.error("Seeding failed:", e.message);
  process.exitCode = 1;
} finally {
  if (tempUser) await db.query("delete from auth.users where id = $1", [tempUser]);
  await db.end().catch(() => {});
}
