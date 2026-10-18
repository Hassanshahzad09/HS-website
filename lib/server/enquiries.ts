import "server-only";
import type { Pool, PoolClient } from "pg";

export type EnquiryRow = {
  reference: string;
  type: "quote" | "contact" | "newsletter";
  name: string | null;
  company: string | null;
  email: string;
  country: string | null;
  product: string | null;
  quantity: number | null;
  material: string | null;
  finishes: string[] | null;
  logo_type: string | null;
  colour: string | null;
  size: string | null;
  file_name: string | null;
  message: string | null;
};

const insert = (db: PoolClient, table: string, row: Record<string, unknown>) => {
  const cols = Object.keys(row);
  return db.query(`insert into public.${table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning id`, Object.values(row));
};

/**
 * Saves one website enquiry. Every enquiry lands in `enquiries`; quotes and contact messages
 * also create or update the sender's lead, and a quote adds a `quotes` row with its item.
 * All in one transaction, so a failure saves nothing.
 */
export async function saveEnquiry(pool: Pool, e: EnquiryRow, userId: string | null = null) {
  const db = await pool.connect();
  try {
    await db.query("begin");
    await insert(db, "enquiries", e);

    if (e.type !== "newsletter") {
      const source = e.type === "quote" ? "quote_builder" : "contact_form";
      const lead = await db.query(
        `insert into public.leads (email, name, company, country, source, first_quote_at)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (lower(email)) do update set
           name = coalesce(excluded.name, leads.name),
           company = coalesce(excluded.company, leads.company),
           country = coalesce(excluded.country, leads.country),
           first_quote_at = coalesce(leads.first_quote_at, excluded.first_quote_at),
           last_activity_at = now()
         returning id`,
        [e.email, e.name, e.company, e.country, source, e.type === "quote" ? new Date() : null],
      );
      const leadId = lead.rows[0].id;

      if (e.type === "quote") {
        const quote = await insert(db, "quotes", {
          reference: e.reference,
          user_id: userId,
          lead_id: leadId,
          name: e.name,
          company: e.company,
          email: e.email,
          country: e.country,
          message: e.message,
          source,
          consent_at: new Date(),
        });
        await insert(db, "quote_items", {
          quote_id: quote.rows[0].id,
          product_slug: e.product,
          quantity: e.quantity,
          size_text: e.size,
          notes: e.file_name ? `Artwork file: ${e.file_name}` : null,
          config_snapshot: JSON.stringify({ product: e.product, material: e.material, finishes: e.finishes ?? [], logoType: e.logo_type, colour: e.colour, size: e.size }),
        });
      }
      // Bonus credits for a customer's first quote request (the unique index makes it once only).
      if (e.type === "quote" && userId) {
        await db.query(
          `insert into public.credit_ledger (user_id, type, amount, reason)
           values ($1, 'grant', coalesce(public.credit_setting('quote_bonus'), 10), 'quote_bonus') on conflict do nothing`,
          [userId],
        );
      }
      await insert(db, "lead_notes", {
        lead_id: leadId,
        type: "note",
        body: e.type === "quote" ? `Quote request ${e.reference}${e.product ? ` for ${e.product}` : ""}.` : `Contact message ${e.reference}${e.message ? `: ${e.message.slice(0, 500)}` : "."}`,
      });
    }
    await db.query(
      "insert into public.analytics_events (name, user_id, properties) values ($1, $2, $3)",
      [e.type === "quote" ? "quote_submitted" : e.type === "contact" ? "contact_submitted" : "newsletter_signup", userId, JSON.stringify({ product: e.product, reference: e.reference })],
    );
    await db.query("commit");
  } catch (err) {
    await db.query("rollback").catch(() => {});
    throw err;
  } finally {
    db.release();
  }
}
