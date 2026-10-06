"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { EASE } from "@/lib/utils";

const ITEMS = [
  { name: "Shopping Bag", slug: "shopping-bags", src: "photo-bag", x: 20, y: 34, w: 24, note: "Ribbon handles, matte laminate, foil logo." },
  { name: "Pouch", slug: "pouches", src: "photo-pouch", x: 50, y: 24, w: 18, note: "Cotton drawstring, printed with your logo." },
  { name: "Ribbon", slug: "ribbons", src: "photo-ribbon", x: 30, y: 76, w: 26, note: "Satin, printed with your repeat." },
  { name: "Sticker", slug: "stickers", src: "photo-sticker", x: 86, y: 70, w: 11, note: "Die-cut seal in gloss or matte." },
  { name: "Thank You Card", slug: "thank-you-cards", src: "photo-card", x: 62, y: 74, w: 24, note: "Heavy stock, foil lettering." },
  { name: "Woven Label", slug: "woven-labels", src: "photo-label", x: 10, y: 66, w: 18, note: "High-density weave, soft edges." },
];

/** Full-screen packaging scene: scroll brings each product forward in turn. */
export function Showcase() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(ITEMS.length - 1, Math.max(0, Math.floor(v * ITEMS.length)))));
  const item = ITEMS[active];

  return (
    <section ref={ref} className="relative bg-bg2" style={{ height: `${ITEMS.length * 32 + 100}vh` }} aria-label="The complete packaging set">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="blob left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 bg-brand/15" aria-hidden="true" />

        <div className="container-x absolute inset-x-0 top-24 z-20 flex items-start justify-between">
          <div>
            <p className="eyebrow mb-3">The full set</p>
            <h2 className="display max-w-md text-[clamp(1.5rem,2.6vw,2.3rem)]">
              One brand, <span className="font-serif font-normal italic tracking-normal">six</span> touchpoints.
            </h2>
          </div>
          <p className="eyebrow tabular-nums" aria-hidden="true">
            0{active + 1} / 0{ITEMS.length}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-40 sm:top-32" aria-hidden="true">
          {ITEMS.map((it, i) => {
            const on = i === active;
            return (
              <motion.div
                key={it.src}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ width: `clamp(${it.w * 3.2}px, ${it.w}vw, ${it.w * 16}px)`, zIndex: on ? 10 : 1 }}
                animate={{
                  left: on ? "50%" : `${it.x}%`,
                  top: on ? "46%" : `${it.y}%`,
                  scale: on ? 2.1 : 1,
                  opacity: on ? 1 : 0.45,
                  filter: on ? "blur(0px)" : "blur(2px)",
                }}
                transition={{ duration: 1, ease: EASE }}
              >
                <Image src={`/mockups/cutout-${it.src}.webp`} alt="" width={800} height={800} sizes="40vw" className="h-auto w-full" />
              </motion.div>
            );
          })}
        </div>

        <div className="container-x absolute inset-x-0 bottom-8 z-20 sm:bottom-12">
          <AnimatePresence mode="wait">
            <motion.div key={item.slug + active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="flex items-end justify-between gap-6">
              <div aria-live="polite">
                <p className="display text-[clamp(1.4rem,2.3vw,2rem)]">{item.name}</p>
                <p className="mt-1.5 text-muted">{item.note}</p>
              </div>
              <Link href={`/products/${item.slug}`} data-cursor="VIEW" className="group flex shrink-0 items-center gap-2 text-sm font-medium">
                <span className="link-underline">View product</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
