import "server-only";
import { Pool } from "pg";

// Direct Postgres connection for server routes. SUPABASE_DB_URL is set in .env.local;
// POSTGRES_URL is what Vercel's Supabase integration provides on the live site.
let pool: Pool | null | undefined;

/** Returns the connection pool, or null when no database is configured. */
export function db(): Pool | null {
  if (pool !== undefined) return pool;
  const url = process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
  if (!url) return (pool = null);
  // sslmode in the URL would override the ssl option below, so drop it.
  const clean = new URL(url);
  clean.searchParams.delete("sslmode");
  pool = new Pool({ connectionString: clean.toString(), ssl: { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000 });
  pool.on("error", (e) => console.error("Database connection error:", e.message));
  return pool;
}
