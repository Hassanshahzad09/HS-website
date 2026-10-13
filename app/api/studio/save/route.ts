import { NextResponse } from "next/server";
import { getProduct } from "@/data/products";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveDesign } from "@/lib/server/studio";

// Saves one of the signed-in customer's designs to their projects.
export async function POST(req: Request) {
  const pool = db();
  if (!pool) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  const user = await userId(req);
  if (!user) return NextResponse.json({ ok: false, error: "signin" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (typeof body?.generation !== "string") return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });

  try {
    const slug = (await pool.query("select product_slug from public.generations where id::text = $1 and user_id = $2", [body.generation, user])).rows[0]?.product_slug;
    const out = await saveDesign(pool, user, body.generation, `${getProduct(slug ?? "")?.name ?? "Packaging"} design`);
    if (!out.ok) return NextResponse.json({ ok: false, error: out.error }, { status: out.status });
    return NextResponse.json({ ok: true, project: out.project });
  } catch (e) {
    console.error("Studio save failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
