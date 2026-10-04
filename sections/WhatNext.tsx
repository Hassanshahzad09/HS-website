"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { byCategory, categories } from "@/data/products";
import { cn, EASE } from "@/lib/utils";

/** "What are you creating next?" — pick a category, see what we make for it. */
export function WhatNext() {
  const [active, setActive] = useState(0);
  const cat = categories[active];
  const items = byCategory(cat.id);

  return (
    <section id="solutions" className="relative overflow-hidden bg-bg2 py-24 lg:py-36">
      <div className="blob left-1/3 top-0 size-[28rem] bg-brand/10" aria-hidden="true" />
      <div className="container-x relative">
        <Reveal y={12}>
          <p className="eyebrow mb-5">Solutions</p>
        </Reveal>
        <Reveal>
          <h2 className="display text-[clamp(2.1rem,5.2vw,4.6rem)]">
            What are you <span className="font-serif font-normal italic tracking-normal">creating</span> next?
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <ul role="tablist" aria-label="What we make" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:block lg:overflow-visible lg:px-0">
            {categories.map((c, i) => {
              const on = i === active;
              return (
                <li key={c.id} role="presentation" className="shrink-0 lg:border-b lg:border-line">
                  <button
                    role="tab"
                    type="button"
                    aria-selected={on}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      "group flex w-full items-center justify-between gap-4 rounded-full border px-4 py-2.5 text-left text-sm transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-5",
                      on ? "border-ink bg-ink text-bg lg:bg-transparent lg:text-ink" : "border-line text-muted lg:hover:text-ink",
                    )}
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="eyebrow hidden w-6 lg:inline">0{i + 1}</span>
                      <span className={cn("lg:display transition-transform duration-500 ease-[var(--ease-expo)] lg:text-[clamp(1.8rem,3.2vw,3rem)]", on && "lg:translate-x-3 lg:text-gradient")}>{c.name}</span>
                    </span>
                    <span className="hidden text-sm text-muted lg:inline">{byCategory(c.id).length} products</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div role="tabpanel" aria-label={cat.name} className="min-h-[26rem]">
            <AnimatePresence mode="wait">
              <motion.div key={cat.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }}>
                <p className="max-w-md text-lg leading-relaxed text-muted">{cat.blurb}</p>
                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {items.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: EASE }}>
                      <Link href={`/products/${p.slug}`} data-cursor="VIEW" className="group block">
                        <span className="relative block aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-bg">
                          <Image src={p.image} alt={p.name} fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.07]" />
                        </span>
                        <span className="mt-3 flex items-center justify-between gap-2 text-sm font-medium">
                          {p.name}
                          <ArrowUpRight className="size-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
