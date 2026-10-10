"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow, buttonClass } from "@/components/Button";
import { MaskReveal, SectionHeading, SplitText } from "@/components/Reveal";
import { portfolio } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

type Project = (typeof portfolio)[number];

/** Masonry grid of demonstration projects; each opens a detail dialog. */
export function Portfolio({ standalone = false }: { standalone?: boolean }) {
  const [open, setOpen] = useState<Project | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <section id="portfolio" className={cn("bg-bg", standalone ? "pb-24 pt-32 lg:pt-40" : "py-13.5 lg:py-21.5")}>
      <div className="container-x">
        <SectionHeading eyebrow="Portfolio" text="Concept projects showing how materials and finishes come together across a full brand set.">
          <SplitText segments={["Made for brands. ", { text: "Built to be remembered.", gradient: true }]} />
        </SectionHeading>

        <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {portfolio.map((p, i) => (
            <MaskReveal key={p.id} delay={(i % 3) * 0.08} className="mb-5 break-inside-avoid">
              <button type="button" onClick={() => setOpen(p)} data-cursor="VIEW" aria-label={`${p.name} — ${p.category}. View project`} className="group relative block w-full overflow-hidden rounded-[1.75rem] bg-bg2 text-left" style={{ aspectRatio: p.ratio }}>
                <Image src={p.image} alt={`${p.name}: ${p.product}`} fill sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 92vw" className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-expo)] group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-70 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em]">{p.category}</span>
                <span className="absolute right-4 top-4 grid size-11 -translate-y-2 place-items-center rounded-full bg-white text-[#0e1418] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </span>
                <span className="absolute inset-x-5 bottom-5 text-white">
                  <span className="block overflow-hidden">
                    <span className="display block text-2xl transition-transform duration-500 ease-[var(--ease-expo)] sm:translate-y-2 sm:group-hover:translate-y-0">{p.name}</span>
                  </span>
                  <span className="mt-1.5 block text-sm text-white/80 transition-all duration-500 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                    {p.product.split(" • ")[0]} • {p.finish}
                  </span>
                </span>
              </button>
            </MaskReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close project" className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm" onClick={() => setOpen(null)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={open.name}
              className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] bg-surface sm:rounded-[2rem] md:grid-cols-2"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[32rem]">
                <Image src={open.image} alt={`${open.name}: ${open.product}`} fill sizes="(min-width: 768px) 500px, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-col p-7 sm:p-10">
                <button type="button" autoFocus onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-surface/90 hover:bg-bg2">
                  <X className="size-5" />
                </button>
                <p className="eyebrow">{open.category} · Concept project</p>
                <h3 className="display mt-4 text-4xl">{open.name}</h3>
                <p className="mt-5 text-lg leading-relaxed text-muted">{open.text}</p>
                <dl className="mt-8 space-y-4 text-sm">
                  <div className="flex justify-between gap-6 border-b border-line pb-3">
                    <dt className="text-muted">Products</dt>
                    <dd className="text-right">{open.product}</dd>
                  </div>
                  <div className="flex justify-between gap-6 border-b border-line pb-3">
                    <dt className="text-muted">Finish</dt>
                    <dd className="text-right">{open.finish}</dd>
                  </div>
                </dl>
                <Link href="/quote" onClick={() => setOpen(null)} className={buttonClass("brand", "mt-auto self-start max-md:mt-8")}>
                  Start Your Project <Arrow />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
