import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getProduct } from "@/data/products";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { findLogo } from "@/lib/server/logos";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { ANON_COOKIE, generateForGuest, generateForUser, MODES, type Mode } from "@/lib/server/studio";
import { STUDIO_SLUGS, type StudioConfig } from "@/lib/studio";

const text = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 80) : "");

// Real generations can take a while; give the image model room to answer.
export const maxDuration = 60;

// Creates one Studio mockup. Signed-in customers spend credits; visitors use their free previews.
export async function POST(req: Request) {
  const pool = db();
  if (!pool) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const product = typeof body?.product === "string" && STUDIO_SLUGS.includes(body.product) ? getProduct(body.product) : undefined;
  if (!product) return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  const c = body.config ?? {};
  const config: StudioConfig = { colour: text(c.colour), material: text(c.material), finish: text(c.finish), logoType: text(c.logoType), size: text(c.size), placement: text(c.placement) };
  const mode: Mode = MODES.includes(body.mode) ? body.mode : "quick";

  try {
    const user = await userId(req);
    const jar = await cookies();
    const cookie = jar.get(ANON_COOKIE)?.value;
    // Free visitor previews cost real money, so visitors must pass the bot check (when it is set up).
    if (!user && !(await verifyTurnstile(body.turnstile, req))) return NextResponse.json({ ok: false, error: "bot", signedIn: false }, { status: 403 });
    // Only a logo the requester uploaded themselves can be used.
    const logo = user ? await findLogo(pool, { user }, body.logo) : cookie ? await findLogo(pool, { session: cookie }, body.logo) : null;
    const out = user ? await generateForUser(pool, user, { product, config, mode, logo }) : await generateForGuest(pool, req, cookie, { product, config, mode, logo });
    if (!out.ok) return NextResponse.json({ ok: false, error: out.error, signedIn: out.signedIn }, { status: out.status });
    if (out.session) jar.set(ANON_COOKIE, out.session, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return NextResponse.json({ ok: true, id: out.id, image: out.image, sample: out.sample, credits: out.credits, signedIn: out.signedIn });
  } catch (e) {
    console.error("Studio generate failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }
}
