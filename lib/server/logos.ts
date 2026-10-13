import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import sharp from "sharp";
import { uploadFile } from "./storage";

/*
 * Customer logos (PRD section 11). Every upload is re-encoded to a clean PNG before it is
 * stored, so nothing from the original file (scripts in an SVG, hidden metadata) survives.
 * Files go to the private "logos" bucket and are only ever read by the server.
 */

export type Owner = { user: string; session?: undefined } | { user?: undefined; session: string };
export type LogoOutcome =
  | { ok: true; id: string; path: string; width: number; height: number; hasAlpha: boolean }
  | { ok: false; status: number; error: "type" | "size" | "unreadable" | "busy" };

const MAX_BYTES = 10 * 1024 * 1024;
const FORMATS = ["png", "jpeg", "webp", "svg"];
const UPLOADS_PER_HOUR = 20;

const ownerPath = (o: Owner) => (o.user ? `user/${o.user}` : `anon/${o.session}`);

export async function saveLogo(pool: Pool, owner: Owner, file: Buffer, originalName: string): Promise<LogoOutcome> {
  if (file.length === 0 || file.length > MAX_BYTES) return { ok: false, status: 413, error: "size" };

  let png: { data: Buffer; info: { width: number; height: number; channels: number; size: number } };
  let sourceFormat: string | undefined;
  try {
    const image = sharp(file, { limitInputPixels: 40_000_000, density: 300 });
    const meta = await image.metadata();
    sourceFormat = meta.format;
    if (!sourceFormat || !FORMATS.includes(sourceFormat)) return { ok: false, status: 415, error: "type" };
    png = await image.rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
  } catch {
    return { ok: false, status: 422, error: "unreadable" };
  }

  const col = owner.user ? "owner_user_id" : "anon_session_id";
  const who = owner.user ?? owner.session;
  const sha = createHash("sha256").update(png.data).digest("hex");

  // The same logo uploaded again reuses the stored file.
  const existing = await pool.query(`select id, storage_path, width, height, has_alpha from public.uploaded_assets where ${col} = $1 and sha256 = $2 and kind = 'logo' and deleted_at is null limit 1`, [who, sha]);
  if (existing.rows[0]) {
    const e = existing.rows[0];
    return { ok: true, id: e.id, path: e.storage_path, width: e.width, height: e.height, hasAlpha: e.has_alpha };
  }

  const recent = await pool.query(`select count(*)::int as n from public.uploaded_assets where ${col} = $1 and created_at > now() - interval '1 hour'`, [who]);
  if (recent.rows[0].n >= UPLOADS_PER_HOUR) return { ok: false, status: 429, error: "busy" };

  const id = randomUUID();
  const path = `${ownerPath(owner)}/${id}.png`;
  const hasAlpha = png.info.channels === 4;
  const warnings = Math.max(png.info.width, png.info.height) < 500 ? ["low_resolution"] : [];
  await uploadFile("logos", path, png.data, "image/png");
  await pool.query(
    `insert into public.uploaded_assets (id, ${col}, kind, storage_path, original_name, mime, width, height, has_alpha, size_bytes, sha256, warnings)
     values ($1, $2, 'logo', $3, $4, 'image/png', $5, $6, $7, $8, $9, $10)`,
    [id, who, path, originalName.slice(0, 200), png.info.width, png.info.height, hasAlpha, png.info.size, sha, JSON.stringify(warnings)],
  );
  return { ok: true, id, path, width: png.info.width, height: png.info.height, hasAlpha };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A logo the requester owns, or null. Nobody can use someone else's logo by guessing its id. */
export async function findLogo(pool: Pool, owner: Owner, id: unknown): Promise<{ id: string; path: string } | null> {
  if (typeof id !== "string" || !UUID.test(id)) return null;
  const col = owner.user ? "owner_user_id" : "anon_session_id";
  const { rows } = await pool.query(`select id, storage_path from public.uploaded_assets where id = $1 and ${col} = $2 and kind = 'logo' and deleted_at is null`, [id, owner.user ?? owner.session]);
  return rows[0] ? { id: rows[0].id, path: rows[0].storage_path } : null;
}
