"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/buttonStyles";
import { supabaseBrowser, useUser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AdminNav, type StaffRole } from "./AdminShared";

/*
 * CRM-lite for the sales team (PRD section 25): the lead list with status, notes and
 * follow-up dates. Access is decided by the database: only profiles with the role
 * sales, admin or super_admin can read or change leads.
 */

type Item = { product_slug: string | null; quantity: number | null; config_snapshot: { material?: string; finishes?: string[]; logoType?: string; colour?: string } | null };
type Quote = { reference: string; created_at: string; message: string | null; quote_items: Item[] };
type Note = { id: string; body: string; type: string; created_at: string };
type Lead = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  country: string | null;
  phone: string | null;
  status: string;
  lost_reason: string | null;
  source: string | null;
  next_follow_up_at: string | null;
  last_activity_at: string;
  created_at: string;
  quotes: Quote[];
  lead_notes: Note[];
};

const STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "quotation_sent", label: "Quotation sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "archived", label: "Archived" },
];
const LOST_REASONS = [
  { id: "price", label: "Price" },
  { id: "moq", label: "Minimum order" },
  { id: "lead_time", label: "Lead time" },
  { id: "shipping", label: "Shipping" },
  { id: "no_response", label: "No response" },
  { id: "chose_competitor", label: "Chose a competitor" },
  { id: "other", label: "Other" },
];
const statusLabel = (id: string) => STATUSES.find((s) => s.id === id)?.label ?? id;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const today = () => new Date().toISOString().slice(0, 10);
const input = "w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink";

export function AdminLeads() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [role, setRole] = useState<StaffRole>("sales");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("open");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [problem, setProblem] = useState("");

  const load = useCallback(async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { data, error } = await sb
      .from("leads")
      .select("id, email, name, company, country, phone, status, lost_reason, source, next_follow_up_at, last_activity_at, created_at, quotes(reference, created_at, message, quote_items(product_slug, quantity, config_snapshot)), lead_notes(id, body, type, created_at)")
      .order("last_activity_at", { ascending: false })
      .limit(500);
    if (error) return setProblem("We couldn't load the leads. Please refresh the page.");
    setLeads((data as unknown as Lead[]) ?? []);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace("/login");
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.from("profiles").select("role").eq("id", user.id).maybeSingle().then(({ data }) => {
      const ok = ["sales", "admin", "super_admin"].includes(data?.role ?? "");
      setAllowed(ok);
      if (ok) {
        setRole(data!.role as StaffRole);
        load();
      }
    });
  }, [loading, user, router, load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "open" && ["won", "lost", "archived"].includes(l.status)) return false;
      if (filter === "due" && !(l.next_follow_up_at && l.next_follow_up_at.slice(0, 10) <= today())) return false;
      if (!["all", "open", "due"].includes(filter) && l.status !== filter) return false;
      if (!q) return true;
      return [l.name, l.company, l.email, l.country, ...l.quotes.map((x) => x.reference)].some((v) => v?.toLowerCase().includes(q));
    });
  }, [leads, filter, query]);

  const open = leads.find((l) => l.id === openId) ?? null;
  const dueCount = leads.filter((l) => l.next_follow_up_at && l.next_follow_up_at.slice(0, 10) <= today() && !["won", "lost", "archived"].includes(l.status)).length;

  if (loading || allowed === null) {
    return (
      <section className="bg-bg pb-20 pt-32 lg:pt-40">
        <div className="container-x text-muted">Loading…</div>
      </section>
    );
  }
  if (!allowed) {
    return (
      <section className="bg-bg pb-20 pt-32 lg:pt-40">
        <div className="container-x max-w-xl">
          <h1 className="display text-4xl">Staff only</h1>
          <p className="mt-3 text-muted">This page is for the Heritage Shapes team. Your account doesn&rsquo;t have access.</p>
          <Link href="/account" className={buttonClass("outline", "mt-6")}>
            Back to my account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg pb-20 pt-32 lg:pt-40">
      <div className="container-x">
        <AdminNav current="leads" role={role} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sales</p>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Leads</h1>
            <p className="mt-2 text-sm text-muted">
              {leads.length} {leads.length === 1 ? "lead" : "leads"} · {dueCount} follow-up{dueCount === 1 ? "" : "s"} due
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search leads</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, company, email, reference" className={cn(input, "rounded-full pl-10")} />
          </label>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {[{ id: "open", label: "Open" }, { id: "due", label: `Follow-up due (${dueCount})` }, ...STATUSES, { id: "all", label: "All" }].map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn("glass-btn shrink-0 rounded-full px-3.5 py-2 text-sm", filter === f.id ? "[--gb:color-mix(in_srgb,var(--ink)_82%,transparent)] text-bg" : "text-muted hover:text-ink")}>
              {f.label}
            </button>
          ))}
        </div>

        {problem && (
          <p role="alert" className="mt-4 rounded-2xl bg-gold/10 p-4 text-sm">
            {problem}
          </p>
        )}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
          <ul className="divide-y divide-line overflow-hidden rounded-[2rem] border border-line bg-surface">
            {shown.length === 0 && <li className="p-7 text-muted">No leads here yet. Quote requests and contact messages from the website appear in this list.</li>}
            {shown.map((l) => {
              const item = l.quotes[0]?.quote_items[0];
              const due = l.next_follow_up_at && l.next_follow_up_at.slice(0, 10) <= today();
              return (
                <li key={l.id}>
                  <button type="button" onClick={() => setOpenId(l.id)} aria-current={openId === l.id} className={cn("flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-bg2", openId === l.id && "bg-bg2")}>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{l.name || l.email}</span>
                      <span className="block truncate text-sm text-muted">
                        {[l.company, l.country, item?.product_slug, item?.quantity ? `${item.quantity.toLocaleString("en-GB")} units` : null].filter(Boolean).join(" · ") || l.email}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="glass-btn inline-block rounded-full px-3 py-1 text-xs font-medium">{statusLabel(l.status)}</span>
                      <span className={cn("mt-1 block text-xs", due ? "font-medium text-gold" : "text-muted")}>{l.next_follow_up_at ? `Follow up ${date(l.next_follow_up_at)}` : date(l.last_activity_at)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {open ? <LeadDetail key={open.id} lead={open} authorId={user!.id} onChanged={load} onProblem={setProblem} /> : <div className="rounded-[2rem] border border-dashed border-line p-7 text-muted">Select a lead to see its quotes, notes and follow-up date.</div>}
        </div>
      </div>
    </section>
  );
}

function LeadDetail({ lead, authorId, onChanged, onProblem }: { lead: Lead; authorId: string; onChanged: () => Promise<void>; onProblem: (m: string) => void }) {
  const [status, setStatus] = useState(lead.status);
  const [reason, setReason] = useState(lead.lost_reason ?? "");
  const [followUp, setFollowUp] = useState(lead.next_follow_up_at?.slice(0, 10) ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const dirty = status !== lead.status || reason !== (lead.lost_reason ?? "") || followUp !== (lead.next_follow_up_at?.slice(0, 10) ?? "");
  const notes = [...lead.lead_notes].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!sb || busy) return;
    if (status === "lost" && !reason) return onProblem("Choose why the lead was lost before saving.");
    setBusy(true);
    onProblem("");
    const now = new Date().toISOString();
    const { error } = await sb.from("leads").update({ status, lost_reason: status === "lost" ? reason : null, next_follow_up_at: followUp ? new Date(`${followUp}T09:00:00`).toISOString() : null, last_activity_at: now }).eq("id", lead.id);
    if (error) onProblem("We couldn't save that change. Please try again.");
    else {
      const rows = [];
      if (status !== lead.status) rows.push({ lead_id: lead.id, author_id: authorId, type: "status_change", body: `Status changed from ${statusLabel(lead.status)} to ${statusLabel(status)}.` });
      if (note.trim()) rows.push({ lead_id: lead.id, author_id: authorId, type: "note", body: note.trim().slice(0, 4000) });
      if (rows.length) await sb.from("lead_notes").insert(rows);
      setNote("");
      await onChanged();
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="space-y-6 rounded-[2rem] border border-line bg-surface p-7 lg:sticky lg:top-28">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">{lead.name || lead.email}</h2>
        <p className="mt-1 text-sm text-muted">{[lead.company, lead.country].filter(Boolean).join(" · ")}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a href={`mailto:${lead.email}`} className="link-underline">
            {lead.email}
          </a>
          {lead.phone && (
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="link-underline">
              WhatsApp {lead.phone}
            </a>
          )}
        </p>
        <p className="mt-2 text-xs text-muted">
          First seen {date(lead.created_at)}
          {lead.source ? ` · ${lead.source.replace("_", " ")}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={cn(input, "mt-2")}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Next follow-up
          <input type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className={cn(input, "mt-2")} />
        </label>
        {status === "lost" && (
          <label className="block text-sm font-medium sm:col-span-2">
            Why was it lost?
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={cn(input, "mt-2")}>
              <option value="">Choose a reason</option>
              {LOST_REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="block text-sm font-medium">
        Add a note
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Called, sent samples, agreed price…" className={cn(input, "mt-2 resize-y")} />
      </label>
      <button type="submit" disabled={busy || (!dirty && !note.trim())} className={buttonClass("brand", "disabled:opacity-50")}>
        {busy ? "Saving…" : "Save"}
      </button>

      {lead.quotes.length > 0 && (
        <div>
          <h3 className="eyebrow">Quote requests</h3>
          <ul className="mt-3 space-y-3">
            {lead.quotes.map((q) => (
              <li key={q.reference} className="rounded-2xl bg-bg2 p-4 text-sm">
                <p className="font-medium">
                  {q.reference} <span className="font-normal text-muted">· {date(q.created_at)}</span>
                </p>
                {q.quote_items.map((i, n) => (
                  <p key={n} className="mt-1 text-muted">
                    {[i.product_slug, i.quantity ? `${i.quantity.toLocaleString("en-GB")} units` : null, i.config_snapshot?.material, ...(i.config_snapshot?.finishes ?? []), i.config_snapshot?.logoType, i.config_snapshot?.colour].filter(Boolean).join(" · ")}
                  </p>
                ))}
                {q.message && <p className="mt-2 whitespace-pre-wrap">{q.message}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="eyebrow">Activity</h3>
        <ul className="mt-3 space-y-3 text-sm">
          {notes.length === 0 && <li className="text-muted">No activity yet.</li>}
          {notes.map((n) => (
            <li key={n.id} className="border-l-2 border-line pl-3">
              <p className={cn("whitespace-pre-wrap", n.type === "status_change" && "text-muted")}>{n.body}</p>
              <p className="mt-0.5 text-xs text-muted">{date(n.created_at)}</p>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
