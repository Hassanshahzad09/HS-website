"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type PointerEvent } from "react";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { labelTypes } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

/** Macro label showcase: hover (or tap) the image to zoom into the weave. */
export function Labels() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const label = labelTypes[active];

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section className="bg-bg2 py-13.5 lg:py-21.5">
      <div className="container-x">
        <SectionHeading eyebrow="Labels & tags" text="The part of the garment people touch every time they wear it.">
          <SplitText segments={["Look ", { text: "closer.", gradient: true }]} />
        </SectionHeading>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <ul className="order-2 lg:order-1">
            {labelTypes.map((l, i) => {
              const on = i === active;
              return (
                <li key={l.slug} className="border-b border-line first:border-t">
                  <button type="button" onClick={() => setActive(i)} aria-pressed={on} className="block w-full py-6 text-left">
                    <span className="flex items-baseline gap-5">
                      <span className="eyebrow">0{i + 1}</span>
                      <span className={cn("display text-[clamp(1.35rem,2vw,1.9rem)] transition-colors", on ? "text-ink" : "text-muted")}>{l.name}</span>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                        <div className="pb-6 pl-11">
                          <p className="max-w-sm leading-relaxed text-muted">{l.text}</p>
                          <Link href={`/products/${l.slug}`} className="group mt-4 inline-flex items-center gap-2 text-sm font-medium">
                            <span className="link-underline">Explore {l.name.toLowerCase()}</span>
                            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          <div
            className="relative order-1 aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[2rem] border border-line bg-bg lg:order-2"
            onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
            onPointerLeave={() => setZoom(false)}
            onPointerMove={track}
            onClick={(e) => {
              track(e as unknown as PointerEvent<HTMLDivElement>);
              setZoom((z) => !z);
            }}
            data-cursor="VIEW"
          >
            <AnimatePresence initial={false}>
              <motion.div key={label.slug} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
                <Image
                  src={label.image}
                  alt={`${label.name}, macro detail`}
                  fill
                  sizes="(min-width: 1024px) 110vw, 180vw"
                  className="object-cover transition-transform duration-500 ease-out"
                  style={{ transformOrigin: origin, transform: zoom ? "scale(2.4)" : "scale(1)" }}
                />
              </motion.div>
            </AnimatePresence>
            <span className="glass pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium">
              <ZoomIn className="size-3.5" aria-hidden="true" /> <span className="hidden sm:inline">Hover to zoom</span>
              <span className="sm:hidden">Tap to zoom</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
