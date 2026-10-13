import { readFileSync, writeFileSync } from "node:fs";
import pg from "pg";
import sharp from "sharp";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL, SECRET = env.SUPABASE_SERVICE_ROLE_KEY, SITE = "http://localhost:3000";
const SH = { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
const db = new pg.Client({ connectionString: env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await db.connect();
const q = async (s, p) => (await db.query(s, p)).rows;
const IP = `192.0.2.${Date.now() % 250}`;
const out = process.argv[2];
let session;
try {
  // Launch settings: AI on, and a low daily ceiling while the credit is small.
  await db.query(`update system_settings set value = value || '{"ai_enabled": true, "daily_generation_cap": 50}' where key = 'studio'`);

  const png = await sharp("app/icon.svg", { density: 600 }).resize(1600, 1600, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const f = new FormData(); f.append("file", new Blob([png], { type: "image/png" }), "logo.png");
  const up = await fetch(`${SITE}/api/studio/logo`, { method: "POST", headers: { "x-forwarded-for": IP }, body: f });
  const cookie = (up.headers.get("set-cookie") || "").split(";")[0]; session = cookie.split("=")[1];
  const logo = await up.json();
  console.log("1 logo upload:", up.status, JSON.stringify(logo));
  console.log("2 bad file rejected:", await (async () => { const b = new FormData(); b.append("file", new Blob(["not an image"], { type: "image/png" }), "x.png"); return (await fetch(`${SITE}/api/studio/logo`, { method: "POST", headers: { "x-forwarded-for": IP, cookie }, body: b })).status; })());
  const row = (await q("select storage_path from uploaded_assets where id = $1", [logo.id]))[0];
  console.log("3 logo is private — with key:", (await fetch(`${URL_}/storage/v1/object/logos/${row.storage_path}`, { headers: SH })).status, "| public link:", (await fetch(`${URL_}/storage/v1/object/public/logos/${row.storage_path}`)).status);

  const me = await fetch(`${SITE}/api/studio/me`, { headers: { cookie } }).then((r) => r.json());
  console.log("4 studio status:", JSON.stringify(me));
  const noLogo = await fetch(`${SITE}/api/studio/generate`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": IP, cookie }, body: JSON.stringify({ product: "tote-bags", config: {} }) });
  console.log("5 generate without a logo:", noLogo.status, (await noLogo.json()).error);

  const t = Date.now();
  const res = await fetch(`${SITE}/api/studio/generate`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": IP, cookie }, body: JSON.stringify({ product: "tote-bags", logo: logo.id, config: { colour: "Ivory", material: "Cotton Canvas", finish: "DTF", logoType: "", size: "Medium", placement: "Centre front" } }) });
  const g = await res.json();
  console.log("6 AI design through the site:", res.status, JSON.stringify({ ok: g.ok, sample: g.sample, credits: g.credits, error: g.error }), `${((Date.now() - t) / 1000).toFixed(1)}s`);
  if (g.ok) {
    const rec = (await q("select g.status, g.provider, g.model, g.cost_usd, g.latency_ms, g.logo_asset_id is not null as has_logo, o.storage_path, o.width, o.height, o.bytes from generations g join generation_outputs o on o.generation_id = g.id where g.id = $1", [g.id]))[0];
    console.log("7 recorded:", JSON.stringify(rec));
    const img = await fetch(g.image);
    const buf = Buffer.from(await img.arrayBuffer());
    writeFileSync(`${out}/site-test-tote.webp`, buf);
    console.log("8 signed link opens:", img.status, img.headers.get("content-type"), `${(buf.length / 1024).toFixed(0)} KB`, "| without the link:", (await fetch(`${URL_}/storage/v1/object/public/generations/${rec.storage_path}`)).status);
  } else {
    console.log("7 failure recorded:", JSON.stringify((await q("select status, left(error_message, 200) as error from generations where anon_session_id = $1 order by created_at desc limit 1", [session]))[0]));
  }
} catch (e) {
  console.log("TEST ERROR:", e.stack);
} finally {
  if (session) {
    for (const bucket of ["logos", "generations"]) {
      const names = (await q("select name from storage.objects where bucket_id = $1 and name like $2", [bucket, `anon/${session}/%`])).map((r) => r.name);
      if (names.length) await fetch(`${URL_}/storage/v1/object/${bucket}`, { method: "DELETE", headers: { ...SH, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: names }) });
    }
    await db.query("delete from anon_sessions where id = $1", [session]);
  }
  await db.query("delete from analytics_events where created_at > now() - interval '10 minutes'");
  console.log("cleanup:", JSON.stringify((await q("select (select count(*)::int from uploaded_assets) assets, (select count(*)::int from generations) generations, (select count(*)::int from storage.objects where bucket_id in ('logos','generations')) private_files, (select value from system_settings where key='studio') studio"))[0]));
  await db.end();
}
