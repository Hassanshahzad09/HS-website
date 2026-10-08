"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ButtonLink } from "@/components/Button";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { getProduct } from "@/data/products";
import { brandKits } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

/** Complete branding kits by industry: pick one to see what goes in it. */
export function BrandKits() {
  const [active, setActive] = useState(0);
  const kit = brandKits[active];

  return (
    <section id="kits" className="bg-bg py-13.5 lg:py-21.5">
      <div className="container-x">
        <SectionHeading eyebrow="Branding kits" text="Everything a brand hands to its customer, designed together and made in one order. Pick your industry to see the kit.">
          <SplitText segments={["One kit, ", { text: "every", serif: true }, " touchpoint."]} />
        </SectionHeading>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-bg2" data-cursor="VIEW">
            <AnimatePresence initial={false}>
              <motion.div key={kit.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }}>
                <Image src={kit.image} alt={kit.alt} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <div role="tablist" aria-label="Industries" className="grid grid-cols-2 gap-2">
              {brandKits.map((k, i) => (
                <button
                  key={k.id}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn("relative rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors", i === active ? "border-transparent text-bg" : "border-line text-muted hover:border-ink hover:text-ink")}
                >
                  {i === active && <motion.span layoutId="kit-tab" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{k.name}</span>
                </button>
              ))}
            </div>

            <div role="tabpanel" className="mt-8 min-h-[19rem]">
              <AnimatePresence mode="wait">
                <motion.div key={kit.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <h3 className="display text-3xl">{kit.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{kit.text}</p>

                  <p className="eyebrow mt-6">In the kit</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {kit.items.map((slug) => {
                      const product = getProduct(slug);
                      if (!product) return null;
                      return (
                        <li key={slug}>
                          <Link href={`/products/${slug}`} className="glass-btn inline-flex rounded-full px-3.5 py-2 text-sm text-ink hover:text-brand">
                            {product.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-7">
                    <ButtonLink href="/quote" variant="brand" cursor="QUOTE">
                      Get a quote for this kit
                    </ButtonLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
