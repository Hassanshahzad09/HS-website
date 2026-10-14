"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LogOut, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Arrow, buttonClass } from "@/components/buttonStyles";
import { Field } from "@/components/Field";
import { getProduct } from "@/data/products";
import { accessToken, supabaseBrowser, useUser } from "@/lib/supabase/client";

type Quote = { reference: string; status: string; created_at: string; quote_items: { product_slug: string | null; quantity: number | null }[] };

type Design = {
  id: string;
  name: string;
  created_at: string;
  cover: { id: string; product_slug: string | null; config_snapshot: { material?: string; finish?: string; logoType?: string } | null; generation_outputs: { storage_path: string }[] } | null;
};

// Customer-friendly wording for the quote status.
const STATUS: Record<string, string> = { received: "Received", in_review: "In review", quotation_sent: "Quotation sent", closed: "Closed" };

/** Signed-in customer's page: profile, AI Studio credits and their quote requests. */
export function AccountPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [form, setForm] = useState({ full_name: "", company: "", phone: "" });
  const [credits, setCredits] = useState(0);
  const [staff, setStaff] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb || !user) return;
    sb.from("profiles").select("full_name, company, phone, role").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setForm({ full_name: data.full_name ?? "", company: data.company ?? "", phone: data.phone ?? "" });
      setStaff(["sales", "admin", "super_admin"].includes(data.role));
    });
    sb.from("credit_balances").select("balance").maybeSingle().then(({ data }) => setCredits(data?.balance ?? 0));
    sb.from("projects")
      .select("id, name, created_at, cover:generations!projects_cover_generation_id_fkey(id, product_slug, config_snapshot, generation_outputs(storage_path))")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        const list = (data as unknown as Design[] | null) ?? [];
        setDesigns(list);
        // AI images are private files: ask the server for short-lived links to this customer's own.
        const ids = list.filter((d) => d.cover && !d.cover.generation_outputs[0]?.storage_path.startsWith("/")).map((d) => d.cover!.id);
        if (!ids.length) return;
        const token = await accessToken();
        const res = await fetch("/api/studio/images", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ids }) }).then((r) => r.json()).catch(() => null);
        if (res?.ok) setLinks(res.images);
      });
    sb.from("quotes").select("reference, status, created_at, quote_items(product_slug, quantity)").order("created_at", { ascending: false }).then(({ data }) => setQuotes((data as Quote[] | null) ?? []));
  }, [user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!sb || !user || saving) return;
    setSaving(true);
    setNotice("");
    const { error } = await sb.from("profiles").update({ full_name: form.full_name.trim() || null, company: form.company.trim() || null, phone: form.phone.trim() || null }).eq("id", user.id);
    setNotice(error ? "We couldn't save your details. Please try again." : "Saved.");
    setSaving(false);
  };

  const removeDesign = async (id: string) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { error } = await sb.from("projects").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (!error) setDesigns((list) => list.filter((d) => d.id !== id));
  };

  const signOut = async () => {
    await supabaseBrowser()?.auth.signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <section className="bg-bg pb-16 pt-28 lg:pt-32">
        <div className="container-x text-muted">Loading your account…</div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-bg pb-16 pt-28 lg:pt-32">
      <div className="blob -right-32 top-10 size-[32rem] bg-brand/20" aria-hidden="true" />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="display mt-4 text-[clamp(2rem,4.2vw,3.2rem)]">Hello{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}.</h1>
            <p className="mt-2 text-muted">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {staff && (
              <Link href="/admin" className={buttonClass("primary")}>
                Leads <Arrow />
              </Link>
            )}
            <button type="button" onClick={signOut} className={buttonClass("outline")}>
              <LogOut className="size-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <form onSubmit={save} className="space-y-4 rounded-[2rem] border border-line bg-surface p-7">
            <h2 className="text-xl font-medium tracking-tight">Your details</h2>
            <Field id="full_name" label="Full name" autoComplete="name" value={form.full_name} onChange={set("full_name")} placeholder="Your name" />
            <Field id="company" label="Brand or company" optional autoComplete="organization" value={form.company} onChange={set("company")} placeholder="Your brand" />
            <Field id="phone" label="Phone or WhatsApp" optional type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} placeholder="+44…" />
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={saving} className={buttonClass("brand", "disabled:opacity-60")}>
                {saving ? "Saving…" : "Save details"}
              </button>
              {notice && (
                <p role="status" className="flex items-center gap-1.5 text-sm text-muted">
                  {notice === "Saved." && <Check className="size-4 text-brand" aria-hidden="true" />} {notice}
                </p>
              )}
            </div>
          </form>

          <div className="flex flex-col justify-between rounded-[2rem] bg-ink p-7 text-bg">
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-brand2">
                <Sparkles className="size-3.5" aria-hidden="true" /> AI Studio credits
              </p>
              <p className="display mt-3 text-6xl tabular-nums">{credits}</p>
              <p className="mt-2 text-sm text-bg/70">One credit is one Studio mockup. Your first quote request adds 10 more.</p>
            </div>
            <Link href="/ai-studio" className={buttonClass("brand", "mt-8 self-start")}>
              Open the AI Studio <Arrow />
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-line bg-surface p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-medium tracking-tight">Your saved designs</h2>
            <Link href="/ai-studio" className={buttonClass("outline")}>
              New design <Arrow />
            </Link>
          </div>
          {designs.length === 0 ? (
            <p className="mt-5 text-muted">Nothing saved yet. Press Save on a design in the AI Studio and it appears here.</p>
          ) : (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => {
                const c = d.cover;
                const path = c?.generation_outputs[0]?.storage_path;
                const image = path?.startsWith("/") ? path : c ? links[c.id] : undefined;
                const product = getProduct(c?.product_slug ?? "");
                const cfg = c?.config_snapshot ?? {};
                const quote = product ? `/quote?product=${product.slug}${cfg.material ? `&material=${encodeURIComponent(cfg.material)}` : ""}${cfg.finish ? `&finish=${encodeURIComponent(cfg.finish)}` : ""}${cfg.logoType ? `&logo=${encodeURIComponent(cfg.logoType)}` : ""}&qty=500` : "/quote";
                return (
                  <li key={d.id} className="overflow-hidden rounded-[1.5rem] border border-line">
                    <div className="relative aspect-[4/3] bg-bg2">{image && <Image src={image} alt={d.name} unoptimized={image.startsWith("http")} fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 44vw, 92vw" className="object-cover" />}</div>
                    <div className="p-4">
                      <p className="font-medium">{d.name}</p>
                      <p className="mt-0.5 text-sm text-muted">{[cfg.material, cfg.logoType || cfg.finish].filter(Boolean).join(" · ")}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Link href={quote} className="link-underline text-sm">
                          Get a quote for this
                        </Link>
                        <button type="button" onClick={() => removeDesign(d.id)} aria-label={`Remove ${d.name}`} className="grid size-9 place-items-center rounded-full text-muted hover:text-ink">
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 rounded-[2rem] border border-line bg-surface p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-medium tracking-tight">Your quote requests</h2>
            <Link href="/quote" className={buttonClass("outline")}>
              Request a quote <Arrow />
            </Link>
          </div>
          {quotes.length === 0 ? (
            <p className="mt-5 text-muted">No quote requests yet. Requests you send while logged in appear here.</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {quotes.map((q) => (
                <li key={q.reference} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <span>
                    <span className="block font-medium">{q.quote_items[0]?.product_slug ?? "Custom request"}</span>
                    <span className="block text-sm text-muted">
                      {q.reference} · {new Date(q.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {q.quote_items[0]?.quantity ? ` · ${q.quote_items[0].quantity.toLocaleString("en-GB")} units` : ""}
                    </span>
                  </span>
                  <span className="glass-btn rounded-full px-3.5 py-1.5 text-sm font-medium">{STATUS[q.status] ?? q.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
