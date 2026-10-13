import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveLogo } from "@/lib/server/logos";
import { storageReady } from "@/lib/server/storage";
import { ANON_COOKIE, ensureSession } from "@/lib/server/studio";

// Receives a customer's logo, cleans it and stores it privately. Returns the id used when generating.
export async function POST(req: Request) {
  const pool = db();
  if (!pool || !storageReady()) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "type" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ ok: false, error: "size" }, { status: 413 });

  try {
    const user = await userId(req);
    const jar = await cookies();
    const session = user ? null : await ensureSession(pool, req, jar.get(ANON_COOKIE)?.value);
    const out = await saveLogo(pool, user ? { user } : { session: session! }, Buffer.from(await file.arrayBuffer()), file.name);
    if (!out.ok) return NextResponse.json({ ok: false, error: out.error }, { status: out.status });
    if (session) jar.set(ANON_COOKIE, session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return NextResponse.json({ ok: true, id: out.id, width: out.width, height: out.height, hasAlpha: out.hasAlpha });
  } catch (e) {
    console.error("Logo upload failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
