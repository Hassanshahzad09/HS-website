"use client";

import Link from "next/link";
import { Check, Minus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AiBadge } from "@/components/AiBadge";
import { Arrow, buttonClass } from "@/components/buttonStyles";
import { Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/*
 * AI Studio pricing. All amounts are PLACEHOLDERS taken from the example figures in the PRD
 * (section 1B.4, "configurable business decisions") — confirm them before launch.
 * Paid plans are marked "Coming soon": nothing here takes payment.
 */

const PLANS = [
  {
    id: "guest",
    name: "Guest",
    tagline: "Try it, no sign-up",
    price: { monthly: 0, yearly: 0 },
    unit: "",
    credits: "2 previews",
    cta: { label: "Start designing", href: "/ai-studio" },
    features: ["2 free previews", "Quick preview mode", "Watermarked images", "Request a quote any time"],
  },
  {
    id: "free",
    name: "Free account",
    tagline: "For real buyers",
    price: { monthly: 0, yearly: 0 },
    unit: "",
    credits: "5 credits",
    cta: { label: "Create free account", href: "/login" },
    features: ["5 credits on sign-up", "+10 bonus credits with a quote request", "Save designs to projects", "Regenerate and edit options"],
  },
  {
    id: "pack",
    name: "Credit pack",
    tagline: "Top up when you need",
    price: { monthly: 9, yearly: 9 },
    unit: "one-off",
    credits: "50 credits",
    soon: true,
    cta: { label: "Coming soon", href: "" },
    features: ["50 credits, never expire", "No watermark", "Premium visualisation mode", "Full-size downloads"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Designers and agencies",
    price: { monthly: 29, yearly: 19 },
    unit: "/ month",
    credits: "200 credits / month",
    featured: true,
    soon: true,
    cta: { label: "Coming soon", href: "" },
    features: ["200 credits every month", "Everything in Credit pack", "Saved brand kits", "Different angles and scenes", "Priority quote replies"],
  },
] as const;

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "Credits included", values: ["2 previews", "5", "50", "200 / month"] },
  { label: "Quick preview", values: [true, true, true, true] },
  { label: "Premium visualisation", values: [false, false, true, true] },
  { label: "Watermark-free images", values: [false, false, true, true] },
  { label: "Save to projects", values: [false, true, true, true] },
  { label: "Full-size download", values: [false, false, true, true] },
  { label: "Saved brand kits", values: [false, false, false, true] },
  { label: "Request a manufacturing quote", values: [true, true, true, true] },
];

const COSTS = [
  { mode: "Quick preview", cost: "1 credit", note: "Fast mockup of your logo on the product" },
  { mode: "Regenerate", cost: "1 credit", note: "Same options, a fresh variation" },
  { mode: "Change one option", cost: "1 credit", note: "Swap colour or finish, keep the design" },
  { mode: "Premium visualisation", cost: "3 credits", note: "Higher quality, no watermark" },
];

const FAQS = [
  { q: "Is the AI Studio really free?", a: "Yes. Your first previews need no account, and a free account adds more credits. The Studio exists to help you see your packaging before you order it." },
  { q: "What is a credit?", a: "One credit is one quick mockup. Higher-quality modes use more. If a generation fails, the credit is returned." },
  { q: "Do these prices include the packaging itself?", a: "No. This page covers the design tool only. Packaging is priced by formal quotation, because it depends on size, material, quantity and shipping." },
  { q: "When do paid plans start?", a: "Credit packs and Pro are planned for a later phase. Until then the free tiers are all you need to design and request a quote." },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <section className="relative overflow-hidden bg-bg pb-14 pt-32 lg:pb-16 lg:pt-40">
        <div className="blob -right-32 top-10 size-[32rem] bg-brand/20" aria-hidden="true" />
        <div className="container-x relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-2">
              <AiBadge className="text-xs" />
              <span className="eyebrow">AI Studio pricing</span>
            </div>
            <h1 className="display mt-6 text-[clamp(2.1rem,4.6vw,3.8rem)]">
              Free to design. <span className="text-gradient">Pay only to make it.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">Start with free previews. Add credits later if you design a lot. Your packaging order is quoted separately.</p>

            <div className="glass-btn mx-auto mt-8 inline-grid grid-cols-2 rounded-full p-1 text-sm active:scale-100" role="group" aria-label="Billing period">
              {[
                { v: false, l: "Monthly" },
                { v: true, l: "Yearly · save 35%" },
              ].map((o) => (
                <button key={o.l} type="button" aria-pressed={yearly === o.v} onClick={() => setYearly(o.v)} className={cn("relative rounded-full px-5 py-2 font-medium transition-colors", yearly === o.v ? "text-bg" : "text-muted hover:text-ink")}>
                  {yearly === o.v && <motion.span layoutId="bill-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{o.l}</span>
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p, i) => {
              const featured = "featured" in p && p.featured;
              const soon = "soon" in p && p.soon;
              const price = yearly ? p.price.yearly : p.price.monthly;
              return (
                <Reveal key={p.id} delay={i * 0.07} className="h-full">
                  <li className={cn("relative flex h-full flex-col rounded-[2rem] border p-7", featured ? "border-transparent bg-ink text-bg shadow-[0_40px_90px_-40px_var(--brand)]" : "border-line bg-surface")}>
                    {featured && <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-medium text-onbrand">Most popular</span>}
                    <h2 className="text-xl font-medium tracking-tight">{p.name}</h2>
                    <p className={cn("mt-1 text-sm", featured ? "text-bg/70" : "text-muted")}>{p.tagline}</p>
                    <p className="mt-6 flex items-baseline gap-1.5">
                      <span className="display text-5xl tabular-nums">{price === 0 ? "Free" : `$${price}`}</span>
                      {p.unit && <span className={cn("text-sm", featured ? "text-bg/70" : "text-muted")}>{p.unit}</span>}
                    </p>
                    <p className={cn("mt-2 inline-flex items-center gap-1.5 text-sm font-medium", featured ? "text-brand2" : "text-brand")}>
                      <Sparkles className="size-3.5" aria-hidden="true" /> {p.credits}
                    </p>
                    <ul className="mt-6 space-y-2.5 text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex gap-2.5">
                          <Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-brand2" : "text-brand")} aria-hidden="true" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      {soon ? (
                        <span className={cn("flex min-h-12 w-full items-center justify-center rounded-full border text-sm font-medium", featured ? "border-white/25 text-bg/80" : "border-line text-muted")}>Coming soon</span>
                      ) : (
                        <Link href={p.cta.href} className={buttonClass(p.id === "free" ? "brand" : "outline", "w-full")}>
                          {p.cta.label} <Arrow />
                        </Link>
                      )}
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ul>
          <p className="mt-5 text-center text-xs text-muted">Prices in USD. Paid plans are not on sale yet; figures shown are indicative.</p>
        </div>
      </section>

      {/* What a credit buys */}
      <section className="bg-bg2 py-12 lg:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading eyebrow="How credits work" text="One credit is one mockup. Failed generations are never charged.">
            <SplitText segments={["Simple, ", { text: "predictable.", serif: true }]} />
          </SectionHeading>
          <ul className="divide-y divide-line rounded-[2rem] border border-line bg-surface">
            {COSTS.map((c) => (
              <li key={c.mode} className="flex items-center justify-between gap-6 px-6 py-5">
                <span>
                  <span className="block font-medium">{c.mode}</span>
                  <span className="block text-sm text-muted">{c.note}</span>
                </span>
                <span className="glass-btn shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium">{c.cost}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compare */}
      <section className="bg-bg py-12 lg:py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Compare plans">
            <SplitText segments={["Everything, ", { text: "side by side.", gradient: true }]} />
          </SectionHeading>
          <div className="no-scrollbar mt-10 overflow-x-auto rounded-[2rem] border border-line">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-bg2 text-left">
                  <th scope="col" className="px-6 py-4 font-medium">Feature</th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col" className="px-4 py-4 text-center font-medium">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-6 py-4 text-left font-normal text-muted">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-4 text-center">
                        {v === true ? <Check className="mx-auto size-4 text-brand" aria-label="Included" /> : v === false ? <Minus className="mx-auto size-4 text-line" aria-label="Not included" /> : <span className="font-medium">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="bg-bg2 py-12 lg:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading eyebrow="Pricing questions">
            <SplitText segments={["Good to ", { text: "know.", serif: true }]} />
          </SectionHeading>
          <dl className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-line pb-6">
                <dt className="text-lg font-medium tracking-tight">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="container-x mt-14">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink p-8 text-bg sm:flex-row sm:items-center sm:p-12">
            <p className="display max-w-xl text-[clamp(1.6rem,3vw,2.6rem)]">Your first two designs are on us.</p>
            <Link href="/ai-studio" className={buttonClass("brand", "shrink-0")}>
              <Sparkles className="size-4" aria-hidden="true" /> Open the AI Studio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
