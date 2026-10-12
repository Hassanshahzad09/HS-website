// Applies the SQL files in supabase/migrations to the database, in name order.
// Each file runs once, inside a transaction, and is recorded in public.schema_migrations.
// Usage: node scripts/db-migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const url = env.SUPABASE_DB_URL || env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL;
if (!url) {
  console.error("No database URL in .env.local (SUPABASE_DB_URL).");
  process.exit(1);
}

// sslmode in the URL would override the ssl option below, so drop it.
const clean = new URL(url);
clean.searchParams.delete("sslmode");
const db = new pg.Client({ connectionString: clean.toString(), ssl: { rejectUnauthorized: false } });

const dir = "supabase/migrations";
try {
  await db.connect();
  await db.query(`
    create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now());
    alter table public.schema_migrations enable row level security;
    revoke all on public.schema_migrations from anon, authenticated;
  `);
  const done = new Set((await db.query("select name from public.schema_migrations")).rows.map((r) => r.name));
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (done.has(file)) {
      console.log("skip   ", file);
      continue;
    }
    await db.query("begin");
    try {
      await db.query(readFileSync(join(dir, file), "utf8"));
      await db.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await db.query("commit");
      console.log("applied", file);
    } catch (e) {
      await db.query("rollback");
      throw new Error(`${file}: ${e.message}${e.position ? ` (at character ${e.position})` : ""}`);
    }
  }
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await db.end().catch(() => {});
}
