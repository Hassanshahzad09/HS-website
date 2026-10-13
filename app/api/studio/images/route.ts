import { NextResponse } from "next/server";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { signedUrl } from "@/lib/server/storage";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Generated images are private files. This hands a signed-in customer short-lived links to
// their own designs, e.g. for the saved designs on the account page.
export async function POST(req: Request) {
  const pool = db();
  if (!pool) return NextResponse.json({ ok: false }, { status: 503 });
  const user = await userId(req);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string" && UUID.test(x)).slice(0, 60) : [];
  if (!ids.length) return NextResponse.json({ ok: true, images: {} });

  try {
    const { rows } = await pool.query(
      "select distinct on (g.id) g.id, o.storage_path from public.generations g join public.generation_outputs o on o.generation_id = g.id where g.id = any($1::uuid[]) and g.user_id = $2 order by g.id, o.created_at",
      [ids, user],
    );
    const images: Record<string, string> = {};
    for (const r of rows) images[r.id] = r.storage_path.startsWith("/") ? r.storage_path : await signedUrl("generations", r.storage_path, 3600);
    return NextResponse.json({ ok: true, images });
  } catch (e) {
    console.error("Image links failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
