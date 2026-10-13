"use client";

import { Check } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/buttonStyles";
import { supabaseBrowser } from "@/lib/supabase/client";
import { AdminFrame, type StaffRole } from "./AdminShared";

/*
 * The "configurable business decisions" from the PRD: credit amounts and Studio limits.
 * They live in the system_settings table, so changing them here needs no code change.
 */

type Values = { signup: number; quote_bonus: number; guest_previews: number; guest_per_ip_per_day: number; cost_quick: number; daily_generation_cap: number; free_project_limit: number };

const FIELDS: { key: keyof Values; label: string; help: string; min: number; max: number }[] = [
  { key: "signup", label: "Credits for a new account", help: "Given once, when the email address is confirmed.", min: 0, max: 1000 },
  { key: "quote_bonus", label: "Bonus credits for a first quote request", help: "Given once per customer.", min: 0, max: 1000 },
  { key: "cost_quick", label: "Credits per design", help: "Charged for each mockup or regenerate.", min: 0, max: 100 },
  { key: "guest_previews", label: "Free previews for visitors", help: "Per browser, before an account is needed.", min: 0, max: 50 },
  { key: "guest_per_ip_per_day", label: "Visitor previews per internet address per day", help: "Stops one person clearing cookies to get more.", min: 1, max: 1000 },
  { key: "daily_generation_cap", label: "Designs per day, whole site", help: "A ceiling on daily AI spend. The Studio pauses for the day when reached.", min: 1, max: 1_000_000 },
  { key: "free_project_limit", label: "Saved designs per account", help: "How many designs a customer can keep.", min: 1, max: 10_000 },
];

export function AdminSettings() {
  return <AdminFrame current="settings" allow={["admin", "super_admin"]}>{({ role, userId }) => <Settings role={role} me={userId} />}</AdminFrame>;
}

function Settings({ role, me }: { role: StaffRole; me: string }) {
  const [raw, setRaw] = useState<{ credits: Record<string, unknown>; studio: Record<string, unknown> } | null>(null);
  const [v, setV] = useState<Values | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const canEdit = role === "super_admin";

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.from("system_settings").select("key, value").in("key", ["credits", "studio"]).then(({ data, error }) => {
      if (error || !data) return setNotice("We couldn't load the settings. Please refresh the page.");
      const credits = (data.find((r) => r.key === "credits")?.value ?? {}) as Record<string, unknown>;
      const studio = (data.find((r) => r.key === "studio")?.value ?? {}) as Record<string, unknown>;
      const cost = (credits.cost ?? {}) as Record<string, number>;
      setRaw({ credits, studio });
      setV({
        signup: Number(credits.signup ?? 5),
        quote_bonus: Number(credits.quote_bonus ?? 10),
        guest_previews: Number(credits.guest_previews ?? 2),
        guest_per_ip_per_day: Number(credits.guest_per_ip_per_day ?? 6),
        cost_quick: Number(cost.quick ?? 1),
        daily_generation_cap: Number(studio.daily_generation_cap ?? 500),
        free_project_limit: Number(studio.free_project_limit ?? 10),
      });
    });
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!sb || !v || !raw || busy) return;
    for (const f of FIELDS) {
      const n = v[f.key];
      if (!Number.isInteger(n) || n < f.min || n > f.max) return setNotice(`"${f.label}" must be a whole number from ${f.min} to ${f.max.toLocaleString("en-GB")}.`);
    }
    setBusy(true);
    setNotice("");
    const cost = { ...((raw.credits.cost ?? {}) as Record<string, number>), quick: v.cost_quick, regenerate: v.cost_quick };
    const credits = { ...raw.credits, signup: v.signup, quote_bonus: v.quote_bonus, guest_previews: v.guest_previews, guest_per_ip_per_day: v.guest_per_ip_per_day, cost };
    const studio = { ...raw.studio, daily_generation_cap: v.daily_generation_cap, free_project_limit: v.free_project_limit };
    const { data, error } = await sb.from("system_settings").upsert([{ key: "credits", value: credits, updated_by: me }, { key: "studio", value: studio, updated_by: me }]).select("key");
    if (error || data?.length !== 2) setNotice("The settings weren't saved. Only a super admin can change them.");
    else {
      await sb.from("audit_log").insert({ actor_id: me, action: "settings.update", entity: "system_settings", entity_id: "credits,studio", before: raw, after: { credits, studio } }).then(() => {});
      setRaw({ credits, studio });
      setNotice("Saved.");
    }
    setBusy(false);
  };

  return (
    <>
      <p className="eyebrow">Admin</p>
      <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Credit amounts and Studio limits. Changes apply straight away to new sign-ups and new designs.{!canEdit && " You can view these; changing them needs a super admin."}</p>

      {!v ? (
        <p className="mt-8 text-muted">{notice || "Loading…"}</p>
      ) : (
        <form onSubmit={save} className="mt-8 max-w-3xl rounded-[2rem] border border-line bg-surface p-7">
          <div className="grid gap-6 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label key={f.key} className="block text-sm font-medium">
                {f.label}
                <input type="number" inputMode="numeric" min={f.min} max={f.max} step={1} disabled={!canEdit} value={Number.isNaN(v[f.key]) ? "" : v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.valueAsNumber })} className="mt-2 w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-base outline-none focus:border-ink disabled:opacity-60" />
                <span className="mt-1.5 block text-xs font-normal text-muted">{f.help}</span>
              </label>
            ))}
          </div>
          <div className="mt-7 flex items-center gap-4">
            <button type="submit" disabled={!canEdit || busy} className={buttonClass("brand", "disabled:opacity-50")}>
              {busy ? "Saving…" : "Save settings"}
            </button>
            {notice && (
              <p role="status" className="flex items-center gap-1.5 text-sm text-muted">
                {notice === "Saved." && <Check className="size-4 text-brand" aria-hidden="true" />} {notice}
              </p>
            )}
          </div>
        </form>
      )}
    </>
  );
}
