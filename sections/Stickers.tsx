"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ButtonLink } from "@/components/Button";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { stickerTypes } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

/** Four sticker types compared side by side with crossfading imagery. */
export function Stickers() {
  const [active, setActive] = useState(0);
  const s = stickerTypes[active];

  return (
    <section id="stickers" className="bg-bg py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="Sticker guide" text="Four kinds of sticker, four different jobs. Pick one to see where it belongs.">
          <SplitText segments={["Which sticker ", { text: "sticks", serif: true }, " where?"]} />
        </SectionHeading>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-bg2" data-cursor="VIEW">
            <AnimatePresence initial={false}>
              <motion.div key={s.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: EASE }}>
                <Image src={s.image} alt={s.name} fill sizes="(min-width: 1024px) 55vw, 92vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <div role="tablist" aria-label="Sticker types" className="grid grid-cols-2 gap-2">
              {stickerTypes.map((t, i) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn("relative rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-colors", i === active ? "border-transparent text-bg" : "border-line text-muted hover:border-ink hover:text-ink")}
                >
                  {i === active && <motion.span layoutId="sticker-tab" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{t.name}</span>
                </button>
              ))}
            </div>

            <div role="tabpanel" className="mt-8 min-h-[15rem]">
              <AnimatePresence mode="wait">
                <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <h3 className="display text-3xl">{s.name}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{s.text}</p>
                  <ul className="mt-5 space-y-2.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-3">
                        <Check className="size-4 text-brand" aria-hidden="true" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <ButtonLink href={`/products/${s.slug}`} variant="outline" cursor="EXPLORE">
                      Explore {s.name}
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
