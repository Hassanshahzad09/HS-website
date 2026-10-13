import "server-only";
import { createHash } from "node:crypto";
import type { Pool } from "pg";
import type { StudioConfig } from "@/lib/studio";

/*
 * Builds the text prompt for one design (PRD section 10). Nothing here is written by the
 * customer: every sentence comes from the database, either a template (shared or per product)
 * or the sentence attached to an option they picked. Wording is edited in the database, not here.
 */

export type BuiltPrompt = { text: string; templateIds: string[]; hash: string };

const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Fragment = { text: string; role: string | null };

export async function buildPrompt(pool: Pool, productSlug: string, config: StudioConfig): Promise<BuiltPrompt> {
  // Active templates for this product; a product's own sentence replaces the shared one, newest version first.
  const { rows: templates } = await pool.query(
    `select distinct on (t.module) t.id, t.module, t.body
     from public.prompt_templates t
     left join public.products p on p.id = t.product_id
     where t.is_active and (t.scope = 'global' or (t.scope = 'product' and p.slug = $1))
     order by t.module, (t.scope = 'product') desc, t.version desc`,
    [productSlug],
  );
  const tpl = new Map<string, { id: string; body: string }>(templates.map((t) => [t.module, { id: t.id, body: t.body }]));
  if (!tpl.has("base") || !tpl.has("product")) throw new Error(`No prompt templates for "${productSlug}"`);

  // The sentence for each option the customer picked.
  const picks: [string, string][] = [
    ["material", config.material],
    ["colour", config.colour],
    ["finish", config.finish],
    ["logo_type", config.logoType],
    ["placement", config.placement],
    ["size", config.size],
  ];
  const wanted = picks.filter(([, label]) => label);
  const { rows: values } = await pool.query(
    `select a.key as attribute, v.prompt_fragment as text, v.prompt_role as role
     from public.attribute_values v join public.attributes a on a.id = v.attribute_id
     where v.is_active and (a.key, v.key) in (select * from unnest($1::text[], $2::text[]))`,
    [wanted.map(([a]) => a), wanted.map(([, label]) => key(label))],
  );
  const frag = new Map<string, Fragment>(values.filter((v) => v.text).map((v) => [v.attribute, { text: v.text, role: v.role }]));

  const used: string[] = [];
  const t = (module: string) => {
    const found = tpl.get(module);
    if (found) used.push(found.id);
    return found?.body ?? "";
  };

  // A finish is either the surface of the whole item or the way the logo is applied.
  const finish = frag.get("finish");
  const logoType = frag.get("logo_type");
  const surface = finish?.role === "surface" ? finish.text : "";
  const shape = finish?.role === "shape" ? finish.text : "";
  const application = logoType?.text || (finish?.role === "logo" ? finish.text : "") || t("logo_default");
  const placement = frag.get("placement")?.text ?? "centred on the front face, at about 40% of its width.";

  const lines: [string, string][] = [
    ["ROLE", t("base")],
    ["PRODUCT", [t("product"), frag.get("size")?.text, shape].filter(Boolean).join(" ")],
    ["MATERIAL", frag.get("material")?.text ?? ""],
    ["COLOUR", frag.get("colour")?.text ?? ""],
    ["SURFACE FINISH", surface],
    ["CONSTRUCTION", t("construction")],
    ["LOGO", t("logo").replace("{placement}", placement)],
    ["LOGO APPLICATION", application],
    ["PHOTOGRAPHY", t("photography")],
    ["BACKGROUND", t("background")],
    ["QUALITY", t("quality")],
    ["DO NOT", t("negative")],
    ["SAFETY", t("safety")],
    ["OUTPUT", t("output")],
  ];
  const text = lines
    .filter(([, body]) => body)
    .map(([label, body]) => `${label}: ${body}`)
    .join("\n");

  return { text, templateIds: used, hash: createHash("sha256").update(text).digest("hex") };
}
