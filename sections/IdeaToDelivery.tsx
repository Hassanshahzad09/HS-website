"use client";

import Image from "next/image";
import { Check, Package } from "lucide-react";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/Logo";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { journey } from "@/data/site";
import { cn, EASE } from "@/lib/utils";

const Cutout = ({ name, className }: { name: string; className?: string }) => (
  <Image src={`/mockups/cutout-${name}.webp`} alt="" width={800} height={800} sizes="(min-width: 1024px) 30vw, 60vw" className={cn("h-auto", className)} />
);

/** One visual per stage: the same package, from pencil line to parcel. */
const VISUALS: ReactNode[] = [
  // Idea — a dashed sketch
  <svg key="idea" viewBox="0 0 741 568" className="w-[55%]" fill="none" stroke="var(--brand)" strokeWidth={10} strokeDasharray="22 16" strokeLinecap="round">
    <path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z" />
    <path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z" />
  </svg>,
  // Design — a dieline with swatches
  <div key="design" className="flex w-[70%] flex-col items-center gap-6">
    <svg viewBox="0 0 400 300" className="w-full" fill="none" stroke="var(--ink)" strokeWidth={1.5}>
      <rect x="130" y="90" width="140" height="120" />
      <rect x="130" y="20" width="140" height="70" strokeDasharray="6 5" />
      <rect x="130" y="210" width="140" height="70" strokeDasharray="6 5" />
      <rect x="40" y="90" width="90" height="120" strokeDasharray="6 5" />
      <rect x="270" y="90" width="90" height="120" strokeDasharray="6 5" />
      <g transform="translate(168 122) scale(.088)" stroke="var(--brand)" strokeWidth={46}>
        <path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z" />
        <path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z" />
      </g>
    </svg>
    <div className="flex gap-2">
      {["#05649a", "#0d3f5f", "#c9a66b", "#efe8da", "#17191c"].map((c) => (
        <span key={c} className="size-8 rounded-full border border-line" style={{ background: c }} />
      ))}
    </div>
  </div>,
  // Prototype — a single white sample
  <Cutout key="proto" name="box-ivory" className="w-[72%]" />,
  // Production — the run
  <div key="prod" className="relative aspect-square w-[80%]">
    <Cutout name="box" className="absolute left-0 top-[6%] w-[62%] opacity-70" />
    <Cutout name="box" className="absolute right-0 top-[14%] w-[62%] opacity-85" />
    <Cutout name="box" className="absolute left-[19%] top-[34%] w-[62%]" />
  </div>,
  // Quality check
  <div key="qc" className="relative w-[70%]">
    <Cutout name="box" className="w-full" />
    <span className="absolute inset-[6%] rounded-full border border-dashed border-brand" />
    <span className="absolute right-[8%] top-[8%] grid size-14 place-items-center rounded-full bg-brand text-onbrand shadow-lg">
      <Check className="size-7" />
    </span>
  </div>,
  // Delivery — the finished set
  <div key="ship" className="relative aspect-square w-[84%]">
    <Cutout name="bag" className="absolute left-0 top-0 w-[66%]" />
    <Cutout name="box" className="absolute bottom-0 right-0 w-[60%]" />
    <Cutout name="ribbon" className="absolute bottom-[2%] left-[4%] w-[50%]" />
  </div>,
];

function Stage({ i, title, text, active, onActive }: { i: number; title: string; text: string; active: boolean; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  return (
    <li ref={ref} className="flex min-h-[38vh] flex-col justify-center pl-12 lg:min-h-[52vh]">
      <span className="eyebrow">Step 0{i + 1}</span>
      <h3 className={cn("display mt-3 text-[clamp(1.8rem,3.4vw,3rem)] transition-all duration-700", active ? "text-ink" : "text-muted opacity-40")}>{title}</h3>
      <p className={cn("mt-3 max-w-sm text-lg leading-relaxed text-muted transition-opacity duration-700", !active && "opacity-40")}>{text}</p>
    </li>
  );
}

/** Scroll story: a sticky visual morphs through six stages while the copy scrolls past. */
export function IdeaToDelivery() {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 55%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const top = useTransform(p, (v) => `${v * 100}%`);

  return (
    <section className="bg-bg py-13.5 lg:py-21.5">
      <div className="container-x">
        <SectionHeading eyebrow="How it happens">
          <SplitText segments={["From idea ", { text: "to delivery.", gradient: true }]} />
        </SectionHeading>

        <div className="mt-10 grid gap-6 lg:mt-4 lg:grid-cols-2 lg:gap-16">
          <div className="sticky top-[4.5rem] z-10 -mx-5 h-[34svh] bg-bg/90 px-5 backdrop-blur-md lg:top-0 lg:mx-0 lg:h-screen lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
            <div className="relative mx-auto grid h-full max-w-[560px] place-items-center" aria-hidden="true">
              <div className="blob left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 bg-brand/15" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="relative grid aspect-square h-full max-h-[520px] place-items-center"
                  initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.06, rotate: 3 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {VISUALS[active]}
                </motion.div>
              </AnimatePresence>
              <LogoMark className="absolute bottom-4 right-0 hidden w-10 text-line lg:block" />
            </div>
          </div>

          <ol ref={listRef} className="relative lg:py-[24vh]">
            {/* progress rail with a travelling parcel */}
            <span className="absolute bottom-0 left-[11px] top-0 w-px bg-line lg:bottom-[24vh] lg:top-[24vh]" aria-hidden="true">
              <motion.span className="absolute inset-x-0 top-0 origin-top bg-brand" style={{ height: top }} />
              <motion.span className="absolute left-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-onbrand shadow-lg" style={{ top }}>
                <Package className="size-4" />
              </motion.span>
            </span>
            {journey.map((s, i) => (
              <Stage key={s.title} i={i} title={s.title} text={s.text} active={i === active} onActive={setActive} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
