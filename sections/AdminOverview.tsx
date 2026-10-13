"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/data/products";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AdminFrame } from "./AdminShared";

type Kpis = {
  new_users: number;
  active_users: number;
  guest_sessions: number;
  generations_ok: number;
  generations_failed: number;
  ai_cost_usd: number;
  credits_used: number;
  credits_granted: number;
  limit_hits: number;
  quotes: number;
  contact_messages: number;
  newsletter: number;
  new_leads: number;
  won: number;
  studio_users_who_quoted: number;
  leads_by_status: Record<string, number>;
  top_products: { product: string; n: number }[];
};

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];
const STATUS_ORDER = ["new", "contacted", "qualified", "quotation_sent", "negotiation", "won", "lost", "archived"];
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");

/** KPI overview for a chosen date range (PRD section 25). Numbers come from one database function. */
export function AdminOverview() {
  return <AdminFrame current="overview">{() => <Overview />}</AdminFrame>;
}

function Overview() {
  const [days, setDays] = useState(30);
  const [k, setK] = useState<Kpis | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    let live = true;
    setK(null);
    const to = new Date();
    const from = new Date(to.getTime() - days * 86_400_000);
    sb.rpc("admin_kpis", { p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data, error }) => {
      if (!live) return;
      if (error) return setProblem("We couldn't load the numbers. Please refresh the page.");
      setProblem("");
      setK(data as Kpis);
    });
    return () => {
      live = false;
    };
  }, [days]);

  const total = k ? k.generations_ok + k.generations_failed : 0;
  const groups: { title: string; tiles: [string, string | number, string?][] }[] = k
    ? [
        {
          title: "Studio",
          tiles: [
            ["Designs created", k.generations_ok],
            ["Failed", k.generations_failed, total ? `${pct(k.generations_failed, total)} failure rate` : undefined],
            ["Customers designing", k.active_users, `${k.guest_sessions} visitor sessions`],
            ["Hit the free limit", k.limit_hits],
          ],
        },
        {
          title: "Sales",
          tiles: [
            ["Quote requests", k.quotes],
            ["New leads", k.new_leads],
            ["Studio to quote", pct(k.studio_users_who_quoted, k.active_users), `${k.studio_users_who_quoted} of ${k.active_users} customers`],
            ["Won", k.won],
          ],
        },
        {
          title: "Accounts and cost",
          tiles: [
            ["New accounts", k.new_users],
            ["Credits used", k.credits_used, `${k.credits_granted} granted`],
            ["AI cost", `$${Number(k.ai_cost_usd).toFixed(2)}`, k.generations_ok ? `$${(Number(k.ai_cost_usd) / k.generations_ok).toFixed(3)} per design` : undefined],
            ["Messages", k.contact_messages, `${k.newsletter} newsletter sign-ups`],
          ],
        },
      ]
    : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Overview</h1>
        </div>
        <div className="glass-btn inline-flex rounded-full p-1 text-sm active:scale-100" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button key={r.days} type="button" aria-pressed={days === r.days} onClick={() => setDays(r.days)} className={cn("rounded-full px-4 py-2 font-medium transition-colors", days === r.days ? "bg-ink text-bg" : "text-muted hover:text-ink")}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {problem && (
        <p role="alert" className="mt-6 rounded-2xl bg-gold/10 p-4 text-sm">
          {problem}
        </p>
      )}
      {!k && !problem && <p className="mt-8 text-muted">Loading…</p>}

      {groups.map((g) => (
        <div key={g.title} className="mt-8">
          <h2 className="eyebrow">{g.title}</h2>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {g.tiles.map(([label, value, note]) => (
              <div key={label} className="rounded-[1.5rem] border border-line bg-surface p-6">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="display mt-2 text-4xl tabular-nums">{typeof value === "number" ? value.toLocaleString("en-GB") : value}</dd>
                {note && <dd className="mt-1 text-xs text-muted">{note}</dd>}
              </div>
            ))}
          </dl>
        </div>
      ))}

      {k && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-line bg-surface p-6">
            <h2 className="text-lg font-medium tracking-tight">All leads by status</h2>
            <ul className="mt-4 divide-y divide-line text-sm">
              {STATUS_ORDER.map((s) => (
                <li key={s} className="flex items-center justify-between py-2.5">
                  <span className="capitalize">{s.replace("_", " ")}</span>
                  <span className="font-medium tabular-nums">{k.leads_by_status[s] ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-surface p-6">
            <h2 className="text-lg font-medium tracking-tight">Most designed products</h2>
            {k.top_products.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No designs in this period yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line text-sm">
                {k.top_products.map((p) => (
                  <li key={p.product} className="flex items-center justify-between py-2.5">
                    <span>{getProduct(p.product)?.name ?? p.product}</span>
                    <span className="font-medium tabular-nums">{p.n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
