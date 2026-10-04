import { NextResponse } from "next/server";

// Front-end demo endpoint. It validates the enquiry and returns a reference.
// TODO: forward `body` to email / CRM / database here.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  const reference = `HS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return NextResponse.json({ ok: true, reference });
}
