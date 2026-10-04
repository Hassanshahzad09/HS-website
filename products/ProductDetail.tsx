"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, Heart, Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow, buttonClass, Magnetic } from "@/components/Button";
import { MaskReveal, Reveal } from "@/components/Reveal";
import { Swatch } from "@/components/Swatch";
import { categoryName, products, type Product } from "@/data/products";
import { RECENT_KEY, useStoredList, WISHLIST_KEY } from "@/lib/storage";
import { cn, EASE } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

const VIEW_LABELS = ["Studio", "Detail", "Alternate"];

export function ProductDetail({ product }: { product: Product }) {
  const [shot, setShot] = useState(0);
  const [material, setMaterial] = useState(0);
  const [finish, setFinish] = useState(0);
  const [qty, setQty] = useState(500);
  const wishlist = useStoredList(WISHLIST_KEY);
  const recent = useStoredList(RECENT_KEY);
  const saved = wishlist.list.includes(product.slug);
  const { pushFront } = recent;

  useEffect(() => pushFront(product.slug), [product.slug, pushFront]);

  const mat = product.materials[material];
  const fin = product.finishes[finish];
  const quoteHref = `/quote?product=${product.slug}&material=${encodeURIComponent(mat.name)}&finish=${encodeURIComponent(fin.name)}&qty=${qty}`;

  const related = [...products.filter((p) => p.category === product.category && p.slug !== product.slug), ...products.filter((p) => p.category !== product.category && p.featured)].slice(0, 4);
  const recentProducts = recent.list.filter((s) => s !== product.slug).map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p)).slice(0, 4);

  return (
    <div className="container-x pb-24 pt-28 lg:pt-32">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="link-underline hover:text-ink">Home</Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link href="/products" className="link-underline hover:text-ink">Products</Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <button
            type="button"
            onClick={() => setShot((s) => (s + 1) % product.gallery.length)}
            data-cursor="VIEW"
            aria-label="Show next photo"
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-line bg-bg2"
          >
            <AnimatePresence initial={false}>
              <motion.div key={shot} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }}>
                <Image src={product.gallery[shot]} alt={`${product.name} — ${VIEW_LABELS[shot].toLowerCase()} view`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </button>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {product.gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`${VIEW_LABELS[i]} view`}
                aria-pressed={shot === i}
                className={cn("relative aspect-[4/3] overflow-hidden rounded-2xl border transition-all", shot === i ? "border-brand" : "border-line opacity-70 hover:opacity-100")}
              >
                <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info + customiser */}
        <div>
          <p className="eyebrow">{categoryName(product.category)}</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">{product.name}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{product.description}</p>

          <ul className="mt-8 space-y-3">
            {product.why.map((w) => (
              <li key={w} className="flex gap-3">
                <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                {w}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-[2rem] border border-line bg-surface p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium tracking-tight">Build yours</h2>
                <p className="mt-1 text-sm text-muted">Pick a material and finish to preview the combination.</p>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">{product.moq}</span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-[150px_1fr]">
              <div className="mx-auto w-40 sm:w-auto">
                <Swatch tone={mat.tone} effect={fin.effect} className="aspect-square w-full rounded-2xl border border-line shadow-inner" markClassName="w-[52%]" />
                <p className="mt-2 text-center text-xs text-muted" aria-live="polite">
                  {mat.name} · {fin.name}
                </p>
              </div>

              <div className="space-y-5">
                <fieldset>
                  <legend className="eyebrow mb-2.5">Material</legend>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((m, i) => (
                      <button key={m.name} type="button" aria-pressed={material === i} onClick={() => setMaterial(i)} className={chip(material === i)}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="eyebrow mb-2.5">Finish</legend>
                  <div className="flex flex-wrap gap-2">
                    {product.finishes.map((f, i) => (
                      <button key={f.name} type="button" aria-pressed={finish === i} onClick={() => setFinish(i)} className={chip(finish === i)}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="qty" className="eyebrow mb-2.5 block">Quantity</label>
                  <div className="inline-flex items-center rounded-full border border-line">
                    <button type="button" onClick={() => setQty((q) => Math.max(50, q - 50))} aria-label="Decrease quantity" className="grid size-11 place-items-center rounded-full hover:bg-bg2">
                      <Minus className="size-4" />
                    </button>
                    <input
                      id="qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                      className="w-20 bg-transparent text-center tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="button" onClick={() => setQty((q) => q + 50)} aria-label="Increase quantity" className="grid size-11 place-items-center rounded-full hover:bg-bg2">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link href={quoteHref} data-cursor="QUOTE" className={buttonClass("brand")}>
                  Request a Quote <Arrow />
                </Link>
              </Magnetic>
              <button type="button" onClick={() => wishlist.toggle(product.slug)} aria-pressed={saved} className={buttonClass("outline")}>
                <Heart className={cn("size-4", saved && "fill-current text-brand")} /> {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <Spec title="Materials" items={product.materials.map((m) => m.name)} />
            <Spec title="Finishes" items={product.finishes.map((f) => f.name)} />
            <Spec title="Customisation" items={product.customization} />
            <Spec title="Applications" items={product.applications} />
          </dl>
        </div>
      </div>

      {/* Gallery strip */}
      <section aria-labelledby="gallery-title" className="mt-24">
        <h2 id="gallery-title" className="display text-[clamp(1.8rem,3.5vw,3rem)]">
          A closer look
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {product.gallery.map((src, i) => (
            <MaskReveal key={src} delay={i * 0.1} className={cn("relative overflow-hidden rounded-[1.75rem] bg-bg2", i === 0 ? "aspect-[4/3] md:col-span-2 md:aspect-auto md:row-span-2" : "aspect-[4/3]")}>
              <Image src={src} alt={`${product.name}, ${VIEW_LABELS[i].toLowerCase()} view`} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
            </MaskReveal>
          ))}
        </div>
      </section>

      <ProductRow title="Pairs well with" items={related} />
      {recentProducts.length > 0 && <ProductRow title="Recently viewed" items={recentProducts} />}

      <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink p-8 text-bg sm:flex-row sm:items-center sm:p-12">
        <p className="display max-w-xl text-[clamp(1.6rem,3vw,2.6rem)]">Ready to see {product.name.toLowerCase()} with your brand on them?</p>
        <Link href={quoteHref} data-cursor="QUOTE" className={buttonClass("brand", "shrink-0")}>
          Start Your Project <Arrow />
        </Link>
      </Reveal>
    </div>
  );
}

const chip = (active: boolean) =>
  cn("rounded-full border px-3.5 py-2 text-sm transition-colors", active ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink");

function Spec({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <dt className="eyebrow border-b border-line pb-3">{title}</dt>
      <dd className="mt-3 text-[0.95rem] leading-relaxed">{items.join(" · ")}</dd>
    </div>
  );
}

function ProductRow({ title, items }: { title: string; items: Product[] }) {
  return (
    <section className="mt-24">
      <h2 className="display text-[clamp(1.8rem,3.5vw,3rem)]">{title}</h2>
      <div className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} className="w-[72vw] shrink-0 snap-center sm:w-auto" />
        ))}
      </div>
    </section>
  );
}
