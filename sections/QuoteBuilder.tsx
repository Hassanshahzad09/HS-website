"use client";

import Image from "next/image";
import { ArrowLeft, Check, FileUp, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow, buttonClass } from "@/components/Button";
import { Field, TextArea } from "@/components/Field";
import { Reveal, SplitText } from "@/components/Reveal";
import { getProduct, products } from "@/data/products";
import { isEmail, submitEnquiry } from "@/lib/enquiry";
import { cn, EASE } from "@/lib/utils";

const STEPS = ["Product", "Details", "Finish", "Contact"];
const QUANTITIES = [100, 250, 500, 1000, 5000];

type Contact = { name: string; company: string; email: string; country: string; message: string };
const EMPTY: Contact = { name: "", company: "", email: "", country: "", message: "" };

/**
 * Four-step quote request. All state is local; `submitEnquiry` in lib/enquiry.ts
 * is the single place to connect a backend.
 */
export function QuoteBuilder({ standalone = false }: { standalone?: boolean }) {
  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState("");
  const [qty, setQty] = useState(500);
  const [material, setMaterial] = useState("");
  const [finishes, setFinishes] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [contact, setContact] = useState<Contact>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Contact | "product" | "qty" | "form", string>>>({});
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");
  const [reference, setReference] = useState("");

  const product = getProduct(slug);

  // Prefill from a product page: /quote?product=shopping-bags&material=…&finish=…&qty=…
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = getProduct(q.get("product") ?? "");
    if (!p) return;
    setSlug(p.slug);
    setMaterial(p.materials.find((m) => m.name === q.get("material"))?.name ?? p.materials[0].name);
    const f = p.finishes.find((x) => x.name === q.get("finish"));
    if (f) setFinishes([f.name]);
    const n = Number(q.get("qty"));
    if (n > 0) setQty(n);
    setStep(1);
  }, []);

  const pick = (s: string) => {
    const p = getProduct(s)!;
    setSlug(s);
    setMaterial(p.materials[0].name);
    setFinishes([]);
    setErrors({});
  };

  const next = () => {
    if (step === 0 && !product) return setErrors({ product: "Choose a product to continue." });
    if (step === 1 && !(qty > 0)) return setErrors({ qty: "Enter a quantity greater than zero." });
    setErrors({});
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    const errs: typeof errors = {};
    if (!contact.name.trim()) errs.name = "Please tell us your name.";
    if (!isEmail(contact.email)) errs.email = "Enter a valid email so we can send the quote.";
    if (Object.keys(errs).length) return setErrors(errs);
    setStatus("busy");
    const res = await submitEnquiry({ type: "quote", ...contact, product: product?.name, quantity: qty, material, finishes, fileName });
    if (res.ok) {
      setReference(res.reference ?? "");
      setStatus("done");
    } else {
      setStatus("idle");
      setErrors({ form: res.error ?? "Something went wrong. Please try again." });
    }
  };

  const reset = () => {
    setStep(0);
    setSlug("");
    setFinishes([]);
    setFileName("");
    setContact(EMPTY);
    setStatus("idle");
    setErrors({});
  };

  const Heading = standalone ? "h1" : "h2";

  return (
    <section id="quote" className={cn("relative overflow-hidden bg-bg2", standalone ? "pb-24 pt-32 lg:pt-40" : "py-13.5 lg:py-21.5")}>
      <div className="blob -left-40 top-20 size-[30rem] bg-brand/15" aria-hidden="true" />
      <div className="container-x relative">
        <p className="eyebrow mb-5">Quote builder</p>
        <Heading className="display max-w-5xl text-[clamp(1.9rem,4vw,3.5rem)]">
          <SplitText segments={["Let’s build something your customers ", { text: "remember.", gradient: true }]} />
        </Heading>

        <Reveal className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
          <form onSubmit={submit} noValidate className="rounded-[2rem] border border-line bg-surface p-5 sm:p-9">
            {status === "done" ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[26rem] flex-col items-start justify-center" role="status">
                <span className="grid size-14 place-items-center rounded-full bg-brand text-onbrand">
                  <Check className="size-7" />
                </span>
                <h3 className="display mt-6 text-4xl">Request received.</h3>
                <p className="mt-4 max-w-md text-lg text-muted">
                  Thank you, {contact.name.split(" ")[0]}. We will review your {product?.name.toLowerCase()} brief and reply to {contact.email} with pricing and a timeline.
                </p>
                {reference && <p className="mt-4 rounded-full border border-line px-4 py-1.5 text-sm">Reference {reference}</p>}
                <button type="button" onClick={reset} className={buttonClass("outline", "mt-8")}>
                  Start another quote
                </button>
              </motion.div>
            ) : (
              <>
                {/* progress */}
                <ol className="grid grid-cols-4 gap-2 sm:gap-4" aria-label="Quote steps">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? "step" : undefined}>
                      <button type="button" disabled={i > step} onClick={() => setStep(i)} className="block w-full text-left disabled:cursor-default">
                        <span className="block h-0.5 overflow-hidden rounded-full bg-line">
                          <motion.span className="block h-full origin-left bg-brand" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} />
                        </span>
                        <span className={cn("mt-3 block text-xs sm:text-sm", i <= step ? "text-ink" : "text-muted")}>
                          <span className="tabular-nums text-muted">0{i + 1}</span>
                          <span className="hidden sm:inline"> — </span>
                          <span className="block sm:inline">{s}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="mt-9 min-h-[24rem]">
                  <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: EASE }}>
                      {step === 0 && (
                        <fieldset>
                          <legend className="text-2xl font-medium tracking-tight">What are we making?</legend>
                          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {products.map((p) => {
                              const on = p.slug === slug;
                              return (
                                <button key={p.id} type="button" aria-pressed={on} onClick={() => pick(p.slug)} className={cn("group relative overflow-hidden rounded-2xl border text-left transition-colors", on ? "border-brand" : "border-line hover:border-ink")}>
                                  <span className="relative block aspect-[4/3] bg-bg2">
                                    <Image src={p.image} alt="" fill sizes="(min-width: 768px) 180px, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    {on && (
                                      <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-onbrand">
                                        <Check className="size-3.5" />
                                      </span>
                                    )}
                                  </span>
                                  <span className="block truncate px-3 py-2.5 text-sm font-medium">{p.name}</span>
                                </button>
                              );
                            })}
                          </div>
                          {errors.product && <p role="alert" className="mt-4 text-sm text-gold">{errors.product}</p>}
                        </fieldset>
                      )}

                      {step === 1 && product && (
                        <div className="space-y-9">
                          <fieldset>
                            <legend className="text-2xl font-medium tracking-tight">How many?</legend>
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                              {QUANTITIES.map((n) => (
                                <button key={n} type="button" aria-pressed={qty === n} onClick={() => setQty(n)} className={chip(qty === n)}>
                                  {n.toLocaleString("en")}
                                </button>
                              ))}
                              <label className="flex items-center gap-2 rounded-full border border-line pl-4 focus-within:border-ink">
                                <span className="text-sm text-muted">Custom</span>
                                <input type="number" min={1} inputMode="numeric" value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Custom quantity" className="h-10 w-24 bg-transparent pr-3 tabular-nums outline-none" />
                              </label>
                            </div>
                            <p className="mt-3 text-sm text-muted">{product.moq} for {product.name.toLowerCase()}.</p>
                            {errors.qty && <p role="alert" className="mt-2 text-sm text-gold">{errors.qty}</p>}
                          </fieldset>
                          <fieldset>
                            <legend className="text-2xl font-medium tracking-tight">Which material?</legend>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {product.materials.map((m) => (
                                <button key={m.name} type="button" aria-pressed={material === m.name} onClick={() => setMaterial(m.name)} className={chip(material === m.name)}>
                                  {m.name}
                                </button>
                              ))}
                              <button type="button" aria-pressed={material === "Not sure yet"} onClick={() => setMaterial("Not sure yet")} className={chip(material === "Not sure yet")}>
                                Not sure yet
                              </button>
                            </div>
                          </fieldset>
                        </div>
                      )}

                      {step === 2 && product && (
                        <div className="space-y-9">
                          <fieldset>
                            <legend className="text-2xl font-medium tracking-tight">Any finishes?</legend>
                            <p className="mt-1.5 text-sm text-muted">Choose as many as you like. We will advise on what combines well.</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {product.finishes.map((f) => {
                                const on = finishes.includes(f.name);
                                return (
                                  <button key={f.name} type="button" aria-pressed={on} onClick={() => setFinishes((cur) => (on ? cur.filter((x) => x !== f.name) : [...cur, f.name]))} className={chip(on)}>
                                    {on && <Check className="mr-1.5 inline size-3.5" />}
                                    {f.name}
                                  </button>
                                );
                              })}
                            </div>
                          </fieldset>
                          <div>
                            <p className="text-2xl font-medium tracking-tight">Have artwork?</p>
                            <label htmlFor="artwork" className="mt-5 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-line p-5 transition-colors focus-within:border-ink hover:border-ink">
                              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bg2">
                                <FileUp className="size-5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{fileName || "Upload your design"}</span>
                                <span className="block text-sm text-muted">{fileName ? "Tap to choose a different file" : "Optional. PDF, AI, SVG, PNG or JPG."}</span>
                              </span>
                              <input id="artwork" type="file" accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                            </label>
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <fieldset>
                          <legend className="text-2xl font-medium tracking-tight">Where do we send the quote?</legend>
                          <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <Field id="q-name" label="Name" autoComplete="name" value={contact.name} error={errors.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                            <Field id="q-company" label="Company" optional autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
                            <Field id="q-email" label="Email" type="email" autoComplete="email" value={contact.email} error={errors.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                            <Field id="q-country" label="Country" optional autoComplete="country-name" value={contact.country} onChange={(e) => setContact({ ...contact, country: e.target.value })} />
                            <div className="sm:col-span-2">
                              <TextArea id="q-message" label="Anything else?" optional placeholder="Sizes, deadline, reference links..." value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
                            </div>
                          </div>
                          {errors.form && <p role="alert" className="mt-4 text-sm text-gold">{errors.form}</p>}
                        </fieldset>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
                  <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="flex min-h-11 items-center gap-2 text-sm text-muted transition-colors hover:text-ink disabled:invisible">
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button type="submit" disabled={status === "busy"} data-cursor="QUOTE" className={buttonClass("brand")}>
                    {status === "busy" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Sending
                      </>
                    ) : step === STEPS.length - 1 ? (
                      <>
                        Request My Quote <Arrow />
                      </>
                    ) : (
                      <>
                        Continue <Arrow />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* live summary */}
          <aside className="h-fit rounded-[2rem] border border-line bg-surface p-6 lg:sticky lg:top-24" aria-label="Your quote so far">
            <p className="eyebrow">Your brief</p>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-bg2">
              <AnimatePresence initial={false}>
                {product ? (
                  <motion.div key={product.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <Image src={product.image} alt={product.name} fill sizes="340px" className="object-cover" />
                  </motion.div>
                ) : (
                  <motion.p key="none" className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Pick a product and your brief builds here.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Product" value={product?.name} />
              <Row label="Quantity" value={product && qty > 0 ? qty.toLocaleString("en") : undefined} />
              <Row label="Material" value={product ? material : undefined} />
              <Row label="Finishes" value={finishes.length ? finishes.join(", ") : undefined} />
              <Row label="Artwork" value={fileName || undefined} />
            </dl>
            <p className="mt-5 text-xs leading-relaxed text-muted">No payment, no commitment. A quote is a conversation starter.</p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}

const chip = (active: boolean) =>
  cn("min-h-10 rounded-full border px-4 py-2 text-sm transition-colors", active ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink");

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3">
      <dt className="text-muted">{label}</dt>
      <dd className={cn("truncate text-right", !value && "text-muted")}>{value ?? "—"}</dd>
    </div>
  );
}
