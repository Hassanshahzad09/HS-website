"use client";

import { Check, Loader2, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Arrow, buttonClass } from "@/components/Button";
import { Field, Select, TextArea } from "@/components/Field";
import { Reveal, SplitText } from "@/components/Reveal";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { isEmail, submitEnquiry } from "@/lib/enquiry";

const EMPTY = { name: "", company: "", email: "", country: "", product: "", quantity: "", message: "" };

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY | "form", string>>>({});
  const [status, setStatus] = useState<"idle" | "busy" | "done">("idle");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Please tell us your name.";
    if (!isEmail(form.email)) errs.email = "Enter a valid email address.";
    if (!form.message.trim()) errs.message = "A line or two about the project helps.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("busy");
    const res = await submitEnquiry({ type: "contact", ...form });
    if (res.ok) setStatus("done");
    else {
      setStatus("idle");
      setErrors({ form: res.error ?? "Something went wrong. Please try again." });
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-bg2 py-13.5 lg:py-21.5">
      <div className="blob -right-40 bottom-0 size-[32rem] bg-gold/15" aria-hidden="true" />
      <div className="container-x relative grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <p className="eyebrow mb-5">Contact</p>
          <h2 className="display text-[clamp(2rem,4.2vw,3.75rem)]">
            <SplitText segments={["Have an idea?\n", { text: "Let’s shape it.", gradient: true }]} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">Tell us what you are making. A sketch, a reference photo or a single sentence is enough to start.</p>

            <ul className="mt-10 space-y-4">
              <li>
                <a href={`mailto:${site.email}`} className="group flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full border border-line transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-onbrand">
                    <Mail className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="eyebrow block">Email</span>
                    <span className="link-underline text-lg">{site.email}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4">
                  <span className="grid size-12 place-items-center rounded-full border border-line transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-onbrand">
                    <MessageCircle className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="eyebrow block">WhatsApp</span>
                    <span className="link-underline text-lg">{site.whatsapp.label}</span>
                  </span>
                </a>
              </li>
            </ul>

            <ul className="mt-10 flex gap-6 text-sm">
              {site.social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-underline text-muted hover:text-ink">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal y={40}>
          <form onSubmit={submit} noValidate className="rounded-[2rem] border border-line bg-surface p-6 sm:p-9">
            {status === "done" ? (
              <div className="flex min-h-[28rem] flex-col items-start justify-center" role="status">
                <span className="grid size-14 place-items-center rounded-full bg-brand text-onbrand">
                  <Check className="size-7" />
                </span>
                <h3 className="display mt-6 text-4xl">Message sent.</h3>
                <p className="mt-4 max-w-sm text-lg text-muted">Thank you, {form.name.split(" ")[0]}. We will reply to {form.email} shortly.</p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY);
                    setStatus("idle");
                  }}
                  className={buttonClass("outline", "mt-8")}
                >
                  Send another
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" label="Name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
                <Field id="company" label="Company" optional autoComplete="organization" value={form.company} onChange={set("company")} />
                <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
                <Field id="country" label="Country" optional autoComplete="country-name" value={form.country} onChange={set("country")} />
                <Select id="product" label="Product" optional value={form.product} onChange={set("product")}>
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                  <option value="Something custom">Something custom</option>
                </Select>
                <Field id="quantity" label="Quantity" optional inputMode="numeric" placeholder="e.g. 500" value={form.quantity} onChange={set("quantity")} />
                <div className="sm:col-span-2">
                  <TextArea id="message" label="Message" placeholder="What are you making, and when do you need it?" value={form.message} onChange={set("message")} error={errors.message} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2">
                  <p className="text-sm text-muted">{errors.form ? <span role="alert" className="text-gold">{errors.form}</span> : "We reply to every enquiry."}</p>
                  <button type="submit" disabled={status === "busy"} className={buttonClass("brand")}>
                    {status === "busy" ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Sending
                      </>
                    ) : (
                      <>
                        Send Enquiry <Arrow />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
