import "server-only";
import { createHash } from "node:crypto";
import type { Pool } from "pg";
import type { Product } from "@/data/products";
import type { StudioConfig } from "@/lib/studio";
import { buildPrompt, type BuiltPrompt } from "./ai/prompt";
import { geminiProvider, sampleProvider } from "./ai/provider";
import { signedUrl, storageReady } from "./storage";

export const ANON_COOKIE = "hs_studio";
export const MODES = ["quick", "regenerate"] as const;
export type Mode = (typeof MODES)[number];

type Settings = { signup: number; quote_bonus: number; guest_previews: number; guest_per_ip_per_day: number; cost: Record<string, number> };
const DEFAULTS: Settings = { signup: 5, quote_bonus: 10, guest_previews: 2, guest_per_ip_per_day: 6, cost: { quick: 1, regenerate: 1 } };

export async function creditSettings(pool: Pool): Promise<Settings> {
  const { rows } = await pool.query("select value from public.system_settings where key = 'credits'");
  return { ...DEFAULTS, ...(rows[0]?.value ?? {}) };
}

type Limits = { daily_generation_cap: number; free_project_limit: number; ai_enabled: boolean; model: string };

export async function studioLimits(pool: Pool): Promise<Limits> {
  const { rows } = await pool.query("select value from public.system_settings where key = 'studio'");
  return { daily_generation_cap: 500, free_project_limit: 10, ai_enabled: false, model: "gemini-3.1-flash-image", ...(rows[0]?.value ?? {}) };
}

/** True when designs are made by the AI model: switched on in settings, with its keys in place. */
export async function aiOn(pool: Pool) {
  return (await studioLimits(pool)).ai_enabled && Boolean(process.env.GEMINI_API_KEY) && storageReady();
}

// Site-wide ceiling on designs per day, so a spike can never run up an unlimited AI bill.
async function overDailyCap(pool: Pool) {
  const { daily_generation_cap } = await studioLimits(pool);
  const { rows } = await pool.query("select count(*)::int as n from public.generations where created_at > date_trunc('day', now()) and status <> 'failed'");
  return rows[0].n >= daily_generation_cap;
}

/** Records a key event for the admin dashboard. Never allowed to break the request it is part of. */
export function track(pool: Pool, name: string, who: { user?: string | null; session?: string | null }, properties: Record<string, unknown> = {}) {
  return pool
    .query("insert into public.analytics_events (name, user_id, anon_session_id, properties) values ($1, $2, $3, $4)", [name, who.user ?? null, who.session ?? null, JSON.stringify(properties)])
    .catch((e) => console.error("Event not recorded:", e.message));
}

export async function balance(pool: Pool, user: string): Promise<number> {
  const { rows } = await pool.query("select coalesce(sum(amount), 0)::int as n from public.credit_ledger where user_id = $1", [user]);
  return rows[0].n;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Free previews a visitor has left, without creating a session for them. */
export async function guestRemaining(pool: Pool, session: string | undefined, s: Settings): Promise<number> {
  if (!session || !UUID.test(session)) return s.guest_previews;
  const { rows } = await pool.query("select generations_used from public.anon_sessions where id = $1 and expires_at > now()", [session]);
  return Math.max(0, s.guest_previews - (rows[0]?.generations_used ?? 0));
}

// Visitors are counted by a hash of their address, never the address itself.
const ipHash = (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  return createHash("sha256").update(`${ip}|${process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL || ""}`).digest("hex");
};

export type Outcome =
  | { ok: true; id: string; image: string; sample: boolean; credits: number; signedIn: boolean; session?: string }
  | { ok: false; status: number; error: "limit" | "failed" | "busy" | "logo"; signedIn: boolean };

type Job = { product: Product; config: StudioConfig; mode: Mode; logo?: { id: string; path: string } | null; prompt?: BuiltPrompt | null };

/** The visitor's session, created if they do not have a valid one yet. */
export async function ensureSession(pool: Pool, req: Request, cookie: string | undefined): Promise<string> {
  if (cookie && UUID.test(cookie)) {
    const found = await pool.query("select 1 from public.anon_sessions where id = $1 and expires_at > now()", [cookie]);
    if (found.rowCount) return cookie;
  }
  return (await pool.query("insert into public.anon_sessions (ip_hash) values ($1) returning id", [ipHash(req)])).rows[0].id as string;
}

// The exact prompt is built from the database and kept with every design (PRD FR-PROMPT-002).
// The sample provider does not need it, so a missing template must not stop a design being made.
const withPrompt = async (pool: Pool, job: Job): Promise<Job> => ({
  ...job,
  prompt: await buildPrompt(pool, job.product.slug, job.config).catch((e) => {
    console.error("Prompt not built:", e instanceof Error ? e.message : e);
    return null;
  }),
});
const promptParams = (job: Job) => [job.prompt?.text ?? null, job.prompt?.templateIds ?? null, job.prompt?.hash ?? null];

/** Makes the image. `owner` is the storage folder ("user/<id>" or "anon/<id>"). Returns null on failure. */
async function run(pool: Pool, id: string, job: Job, owner: string): Promise<{ url: string; sample: boolean } | null> {
  const limits = await studioLimits(pool);
  const provider = (await aiOn(pool)) ? geminiProvider : sampleProvider;
  const started = Date.now();
  try {
    const out = await provider.generate({ product: job.product, config: job.config, mode: job.mode, prompt: job.prompt, logoPath: job.logo?.path, outputPath: `${owner}/${id}.webp`, model: limits.model });
    // What this image cost, from the price table; sample photos cost nothing.
    const price = out.stored
      ? ((await pool.query("select price_usd from public.ai_model_prices where provider = $1 and model = $2 and unit = 'image' and effective_from <= now() order by effective_from desc limit 1", [provider.name, out.model])).rows[0]?.price_usd ?? null)
      : 0;
    await pool.query("update public.generations set status = 'succeeded', provider = $2, model = $3, cost_usd = $4, latency_ms = $5, completed_at = now() where id = $1", [id, provider.name, out.model, price, Date.now() - started]);
    await pool.query("insert into public.generation_outputs (generation_id, storage_path, width, height, bytes) values ($1, $2, $3, $4, $5)", [id, out.imagePath, out.width ?? null, out.height ?? null, out.bytes ?? null]);
    return { url: out.stored ? await signedUrl("generations", out.imagePath, 3600) : out.imagePath, sample: !out.stored };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Generation failed:", message);
    await pool.query("update public.generations set status = 'failed', provider = $2, error_message = $3, latency_ms = $4, completed_at = now() where id = $1", [id, provider.name, message.slice(0, 500), Date.now() - started]);
    return null;
  }
}

const insertGeneration =
  "insert into public.generations (user_id, anon_session_id, product_slug, config_snapshot, mode, status, credits_cost, prompt_text, prompt_template_ids, prompt_hash, logo_asset_id) values ($1, $2, $3, $4, $5, 'running', $6, $7, $8, $9, $10) returning id";

/** A signed-in customer's generation: credits are held first, then charged or handed back. */
export async function generateForUser(pool: Pool, user: string, job: Job): Promise<Outcome> {
  const account = await pool.query("select status from public.profiles where id = $1 and deleted_at is null", [user]);
  if (account.rows[0]?.status !== "active") return { ok: false, status: 403, error: "failed", signedIn: true };
  if (!job.logo && (await aiOn(pool))) return { ok: false, status: 400, error: "logo", signedIn: true };
  if (await overDailyCap(pool)) return { ok: false, status: 503, error: "busy", signedIn: true };
  const s = await creditSettings(pool);
  const cost = s.cost[job.mode] ?? 1;
  job = await withPrompt(pool, job);
  const db = await pool.connect();
  let id: string;
  try {
    await db.query("begin");
    id = (await db.query(insertGeneration, [user, null, job.product.slug, JSON.stringify(job.config), job.mode, cost, ...promptParams(job), job.logo?.id ?? null])).rows[0].id;
    const held = (await db.query("select public.credit_reserve($1, $2, $3) as ok", [user, cost, id])).rows[0].ok;
    if (!held) {
      await db.query("rollback");
      await track(pool, "studio_limit_reached", { user }, { product: job.product.slug });
      return { ok: false, status: 402, error: "limit", signedIn: true };
    }
    await db.query("commit");
  } catch (e) {
    await db.query("rollback").catch(() => {});
    throw e;
  } finally {
    db.release();
  }

  const image = await run(pool, id, job, `user/${user}`);
  await pool.query("select public.credit_settle($1, $2)", [id, image !== null]);
  if (!image) return { ok: false, status: 502, error: "failed", signedIn: true };
  await track(pool, "studio_generation", { user }, { product: job.product.slug, mode: job.mode, sample: image.sample });
  return { ok: true, id, image: image.url, sample: image.sample, credits: await balance(pool, user), signedIn: true };
}

/** A visitor's free preview, limited per browser session and per address per day. */
export async function generateForGuest(pool: Pool, req: Request, cookie: string | undefined, job: Job): Promise<Outcome> {
  if (await overDailyCap(pool)) return { ok: false, status: 503, error: "busy", signedIn: false };
  if (!job.logo && (await aiOn(pool))) return { ok: false, status: 400, error: "logo", signedIn: false };
  const s = await creditSettings(pool);
  const hash = ipHash(req);
  const limit: Outcome = { ok: false, status: 402, error: "limit", signedIn: false };

  const today = await pool.query("select count(*)::int as n from public.generations g join public.anon_sessions a on a.id = g.anon_session_id where a.ip_hash = $1 and g.created_at > now() - interval '24 hours' and g.status <> 'failed'", [hash]);
  if (today.rows[0].n >= s.guest_per_ip_per_day) {
    await track(pool, "studio_limit_reached", {}, { product: job.product.slug, reason: "address" });
    return limit;
  }

  const session = await ensureSession(pool, req, cookie);

  // Counting up and checking the limit in one statement, so parallel clicks cannot both pass.
  const used = await pool.query("update public.anon_sessions set generations_used = generations_used + 1, ip_hash = $3 where id = $1 and generations_used < $2 returning generations_used", [session, s.guest_previews, hash]);
  if (!used.rowCount) {
    await track(pool, "studio_limit_reached", { session }, { product: job.product.slug, reason: "session" });
    return limit;
  }

  job = await withPrompt(pool, job);
  const id = (await pool.query(insertGeneration, [null, session, job.product.slug, JSON.stringify(job.config), job.mode, 0, ...promptParams(job), job.logo?.id ?? null])).rows[0].id as string;
  const image = await run(pool, id, job, `anon/${session}`);
  if (!image) {
    await pool.query("update public.anon_sessions set generations_used = greatest(generations_used - 1, 0) where id = $1", [session]);
    return { ok: false, status: 502, error: "failed", signedIn: false };
  }
  await track(pool, "studio_generation", { session }, { product: job.product.slug, mode: job.mode, sample: image.sample });
  return { ok: true, id, image: image.url, sample: image.sample, credits: s.guest_previews - used.rows[0].generations_used, signedIn: false, session };
}

/** Moves a visitor's designs into the account they just signed in to (PRD: merge on signup). Runs once per session. */
export async function mergeGuest(pool: Pool, user: string, cookie: string | undefined) {
  if (!cookie || !UUID.test(cookie)) return;
  const claimed = await pool.query("update public.anon_sessions set merged_user_id = $1 where id = $2 and merged_user_id is null returning id", [user, cookie]);
  if (!claimed.rowCount) return;
  const moved = await pool.query("update public.generations set user_id = $1, anon_session_id = null where anon_session_id = $2", [user, cookie]);
  await pool.query("update public.uploaded_assets set owner_user_id = $1, anon_session_id = null where anon_session_id = $2", [user, cookie]);
  if (moved.rowCount) await track(pool, "guest_merged", { user }, { designs: moved.rowCount });
}

export type SaveOutcome = { ok: true; project: string } | { ok: false; status: number; error: "missing" | "full" };

/** Saves one of the customer's own designs as a project. Saving the same design twice returns the same project. */
export async function saveDesign(pool: Pool, user: string, generation: string, name: string): Promise<SaveOutcome> {
  if (!UUID.test(generation)) return { ok: false, status: 404, error: "missing" };
  const found = await pool.query("select id, project_id, product_slug, config_snapshot from public.generations where id = $1 and user_id = $2 and status = 'succeeded'", [generation, user]);
  const g = found.rows[0];
  if (!g) return { ok: false, status: 404, error: "missing" };
  if (g.project_id) {
    await pool.query("update public.projects set deleted_at = null where id = $1 and owner_user_id = $2", [g.project_id, user]);
    return { ok: true, project: g.project_id };
  }

  const { free_project_limit } = await studioLimits(pool);
  const count = await pool.query("select count(*)::int as n from public.projects where owner_user_id = $1 and deleted_at is null", [user]);
  if (count.rows[0].n >= free_project_limit) return { ok: false, status: 409, error: "full" };

  const db = await pool.connect();
  try {
    await db.query("begin");
    const project = (await db.query("insert into public.projects (owner_user_id, name, cover_generation_id) values ($1, $2, $3) returning id", [user, name.slice(0, 120), g.id])).rows[0].id as string;
    const cfg = (await db.query("insert into public.project_configurations (project_id, product_slug, configuration) values ($1, $2, $3) returning id", [project, g.product_slug, JSON.stringify(g.config_snapshot)])).rows[0].id;
    await db.query("update public.generations set project_id = $1, project_configuration_id = $2 where id = $3", [project, cfg, g.id]);
    await db.query("commit");
    await track(pool, "project_saved", { user }, { product: g.product_slug });
    return { ok: true, project };
  } catch (e) {
    await db.query("rollback").catch(() => {});
    throw e;
  } finally {
    db.release();
  }
}
