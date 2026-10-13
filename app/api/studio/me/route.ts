import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { aiOn, ANON_COOKIE, balance, creditSettings, guestRemaining, mergeGuest } from "@/lib/server/studio";

// What the Studio shows in its credit badge: a customer's balance, or a visitor's free previews left.
export async function GET(req: Request) {
  const pool = db();
  if (!pool) return NextResponse.json({ ok: false }, { status: 503 });
  try {
    const s = await creditSettings(pool);
    const ai = await aiOn(pool);
    const user = await userId(req);
    const jar = await cookies();
    if (user) {
      // Designs made before signing in follow the customer into their account.
      await mergeGuest(pool, user, jar.get(ANON_COOKIE)?.value);
      return NextResponse.json({ ok: true, signedIn: true, ai, credits: await balance(pool, user), allowance: s.signup });
    }
    return NextResponse.json({ ok: true, signedIn: false, ai, credits: await guestRemaining(pool, jar.get(ANON_COOKIE)?.value, s), allowance: s.guest_previews });
  } catch (e) {
    console.error("Studio status failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
