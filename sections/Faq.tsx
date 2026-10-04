"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { faqs } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-bg py-24 lg:py-36">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="FAQ" text="The questions we hear most. If yours is not here, ask us directly.">
            <SplitText segments={["Good ", { text: "questions.", serif: true }]} />
          </SectionHeading>
          <Reveal className="mt-8" delay={0.2}>
            <ButtonLink href="/#contact" variant="outline">
              Talk to Us
            </ButtonLink>
          </Reveal>
        </div>

        <ul className="border-t border-line">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-line">
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-btn-${i}`} onClick={() => setOpen(on ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-tight sm:text-xl">
                    {f.q}
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500", on ? "rotate-45 border-brand bg-brand text-onbrand" : "border-line")}>
                      <Plus className="size-4" aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`faq-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
