import "server-only";
import type { Pool } from "pg";
import { site } from "@/data/site";
import type { EnquiryRow } from "./enquiries";

/*
 * Emails the team about each new quote request or contact message, through Resend.
 * The enquiry is already saved before this runs, so a failed email never loses a lead;
 * it is only logged. Settings (recipient, sender) live in system_settings → notifications.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function notifyTeam(pool: Pool, e: EnquiryRow) {
  const key = process.env.RESEND_API_KEY;
  if (!key || e.type === "newsletter") return;
  try {
    const { rows } = await pool.query("select value from public.system_settings where key = 'notifications'");
    const to: string | undefined = rows[0]?.value?.lead_email;
    const from: string = rows[0]?.value?.from ?? "Heritage Shapes Website <onboarding@resend.dev>";
    if (!to) return;

    const quote = e.type === "quote";
    const subject = quote
      ? `New quote request ${e.reference}: ${e.product ?? "Custom request"}${e.quantity ? `, ${e.quantity.toLocaleString("en-GB")} units` : ""}`
      : `New message ${e.reference} from ${e.name ?? e.email}`;

    const fields: [string, string | null][] = [
      ["Name", e.name],
      ["Company", e.company],
      ["Email", e.email],
      ["Country", e.country],
      ...(quote
        ? ([
            ["Product", e.product],
            ["Quantity", e.quantity ? e.quantity.toLocaleString("en-GB") : null],
            ["Material", e.material],
            ["Finishes", e.finishes?.length ? e.finishes.join(", ") : null],
            ["Logo type", e.logo_type],
            ["Colour", e.colour],
            ["Size", e.size],
            ["Artwork file", e.file_name],
          ] as [string, string | null][])
        : []),
    ];
    const shown = fields.filter(([, v]) => v);
    const admin = `${site.url.replace(/\/$/, "")}/admin`;

    const text = [
      quote ? `New quote request ${e.reference}` : `New message ${e.reference}`,
      "",
      ...shown.map(([k, v]) => `${k}: ${v}`),
      ...(e.message ? ["", "Message:", e.message] : []),
      "",
      `Reply to this email to answer ${e.name ?? "the customer"} directly.`,
      `Open the lead: ${admin}`,
    ].join("\n");

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#17191c;max-width:560px">
  <h2 style="font-size:20px;margin:0 0 4px">${quote ? "New quote request" : "New message"}</h2>
  <p style="margin:0 0 20px;color:#6b6f75">Reference ${esc(e.reference)}</p>
  <table cellpadding="6" style="border-collapse:collapse;width:100%">
    ${shown.map(([k, v]) => `<tr><td style="color:#6b6f75;width:130px;vertical-align:top">${esc(k)}</td><td style="font-weight:600">${esc(v!)}</td></tr>`).join("\n    ")}
  </table>
  ${e.message ? `<p style="margin:20px 0 6px;color:#6b6f75">Message</p><p style="margin:0;white-space:pre-wrap">${esc(e.message)}</p>` : ""}
  <p style="margin:28px 0 0">Reply to this email to answer ${esc(e.name ?? "the customer")} directly.</p>
  <p style="margin:12px 0 0"><a href="${admin}" style="color:#0d3f5f">Open the lead in admin</a></p>
</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: e.email, subject, text, html }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.error("Lead email not sent:", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("Lead email not sent:", err instanceof Error ? err.message : err);
  }
}

/**
 * Confirmation to the customer that their request arrived. Switched off until the domain is
 * verified in Resend (notifications → confirm_customers), because until then Resend can only
 * deliver to the account owner's own inbox.
 */
export async function confirmCustomer(pool: Pool, e: EnquiryRow) {
  const key = process.env.RESEND_API_KEY;
  if (!key || e.type === "newsletter") return;
  try {
    const { rows } = await pool.query("select value from public.system_settings where key = 'notifications'");
    const settings = rows[0]?.value ?? {};
    if (settings.confirm_customers !== true || !settings.customer_from) return;

    const quote = e.type === "quote";
    const first = e.name?.split(" ")[0];
    const subject = quote ? `We've received your quote request (${e.reference})` : `We've received your message (${e.reference})`;
    const summary = quote ? [e.product, e.quantity ? `${e.quantity.toLocaleString("en-GB")} units` : null, e.material, e.logo_type].filter(Boolean).join(" · ") : "";
    const lines = [
      `Hi${first ? ` ${first}` : ""},`,
      "",
      quote
        ? `Thank you for your quote request. Our team will review it and reply with pricing and lead times, usually within one working day.`
        : `Thank you for getting in touch. We'll reply as soon as we can, usually within one working day.`,
      ...(summary ? ["", `Your request: ${summary}`] : []),
      `Reference: ${e.reference}`,
      "",
      "If you want to add anything, just reply to this email.",
      "",
      `${site.name}`,
      site.url,
    ];
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#17191c;max-width:560px">${lines.map((l) => (l ? `<p style="margin:0 0 4px">${esc(l)}</p>` : "<br>")).join("")}</div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: settings.customer_from, to: [e.email], reply_to: site.email, subject, text: lines.join("\n"), html }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.error("Customer confirmation not sent:", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("Customer confirmation not sent:", err instanceof Error ? err.message : err);
  }
}
