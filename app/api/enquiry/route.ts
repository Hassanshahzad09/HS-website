import { NextResponse } from "next/server";
import { userId } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveEnquiry } from "@/lib/server/enquiries";
import { confirmCustomer, notifyTeam } from "@/lib/server/notify";
import { site } from "@/data/site";

const TYPES = ["quote", "contact", "newsletter"] as const;
const text = (v: unknown, max = 500) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

// Validates an enquiry from the quote builder, contact form or newsletter and saves it to the
// Supabase database. With no database configured it still validates and returns a reference.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  const type = TYPES.includes(body.type) ? (body.type as (typeof TYPES)[number]) : "contact";
  const reference = `HS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const quantity = Number.parseInt(String(body.quantity ?? ""), 10);

  const pool = db();
  if (pool) {
    const row = {
      reference,
      type,
      name: text(body.name, 120),
      company: text(body.company, 160),
      email: body.email.trim().toLowerCase().slice(0, 254),
      country: text(body.country, 80),
      product: text(body.product, 120),
      quantity: Number.isFinite(quantity) && quantity > 0 ? Math.min(quantity, 100_000_000) : null,
      material: text(body.material, 80),
      finishes: Array.isArray(body.finishes) ? body.finishes.map((f: unknown) => text(f, 60)).filter(Boolean).slice(0, 12) : null,
      logo_type: text(body.logoType, 60),
      colour: text(body.colour, 60),
      file_name: text(body.fileName, 200),
      message: text(body.message, 4000),
    };
    try {
      await saveEnquiry(pool, row, type === "quote" ? await userId(req) : null);
      // Saved first, so a failed email can never lose a lead.
      await Promise.all([notifyTeam(pool, row), confirmCustomer(pool, row)]);
    } catch (e) {
      console.error("Enquiry save failed:", e instanceof Error ? e.message : e);
      return NextResponse.json({ ok: false, error: `We couldn't save your request. Please try again, or email us at ${site.email}.` }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, reference });
}
