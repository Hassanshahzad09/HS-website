"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Swatch } from "@/components/Swatch";
import { finishes, materials } from "@/data/site";

/**
 * Materials & finishes. On desktop the section pins and vertical scroll drives
 * the card track sideways; on touch devices it is a native swipe carousel.
 */
export function Materials() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0); // horizontal distance to travel, 0 = native scrolling

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const measure = () => setRange(mq.matches && track.current ? Math.max(0, track.current.scrollWidth - window.innerWidth) : 0);
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -range]);
  const pinned = range > 0;

  return (
    <section id="materials" ref={ref} className="relative bg-bg" style={pinned ? { height: `calc(100vh + ${range}px)` } : undefined}>
      <div className={pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24"}>
        <div className="container-x mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Materials &amp; finishes</p>
            <h2 className="display text-[clamp(2rem,4.6vw,4rem)]">
              Chosen by hand, <span className="text-gradient">felt by touch.</span>
            </h2>
          </div>
          <p className="eyebrow hidden shrink-0 lg:block">{pinned ? "Keep scrolling →" : "Swipe →"}</p>
        </div>

        <motion.div
          ref={track}
          style={pinned ? { x } : undefined}
          data-cursor={pinned ? undefined : "DRAG"}
          className={pinned ? "flex w-max gap-5 pl-[clamp(1.25rem,4vw,4rem)] pr-[12vw]" : "no-scrollbar flex snap-x gap-4 overflow-x-auto px-5 pb-2"}
        >
          <Divider n="01" title="Materials" text="Eight families of stock, board, fabric and film." />
          {materials.map((m) => (
            <Card key={m.name} name={m.name} note={m.note}>
              <Swatch tone={m.tone} effect="matte" className="aspect-[4/5] w-full rounded-3xl border border-line" markClassName="w-[30%] opacity-60" />
            </Card>
          ))}
          <Divider n="02" title="Finishes" text="The same logo, eight different ways of catching light." />
          {finishes.map((f) => (
            <Card key={f.name} name={f.name} note={f.note}>
              <Swatch tone={f.tone} effect={f.effect} className="aspect-[4/5] w-full rounded-3xl border border-line" markClassName="w-[46%]" />
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ name, note, children }: { name: string; note: string; children: React.ReactNode }) {
  return (
    <figure className="group w-[62vw] shrink-0 snap-center sm:w-[280px] lg:w-[min(22vw,300px)]">
      <div className="transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-2">{children}</div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-3">
        <span className="text-lg font-medium tracking-tight">{name}</span>
        <span className="text-right text-sm text-muted">{note}</span>
      </figcaption>
    </figure>
  );
}

function Divider({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex w-[52vw] shrink-0 snap-center flex-col justify-end pb-12 sm:w-[240px]">
      <span className="eyebrow">{n}</span>
      <h3 className="display mt-3 text-4xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
