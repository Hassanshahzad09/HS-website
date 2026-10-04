"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { ButtonLink } from "@/components/Button";

/** Words light up one at a time as `progress` moves through [from, to]. */
function ScrollLine({ text, progress, from, to, className }: { text: string; progress: MotionValue<number>; from: number; to: number; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={className} aria-label={text}>
      {words.map((w, i) => (
        <Word key={i} progress={progress} start={from + ((to - from) * i) / words.length} end={from + ((to - from) * (i + 1)) / words.length}>
          {w}
        </Word>
      ))}
    </p>
  );
}

function Word({ children, progress, start, end }: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [14, 0]);
  return (
    <motion.span aria-hidden="true" className="mr-[0.24em] inline-block" style={{ opacity, y }}>
      {children}
    </motion.span>
  );
}

const PRODUCTS = [
  { src: "bag", cls: "left-[8%] top-[18%] w-[24%]", from: [-260, -120] },
  { src: "box", cls: "left-[62%] top-[14%] w-[26%]", from: [280, -140] },
  { src: "pouch", cls: "left-[38%] top-[8%] w-[20%]", from: [0, -260] },
  { src: "card", cls: "left-[4%] top-[58%] w-[24%]", from: [-300, 160] },
  { src: "ribbon", cls: "left-[36%] top-[62%] w-[28%]", from: [0, 300] },
  { src: "label", cls: "left-[70%] top-[60%] w-[22%]", from: [300, 180] },
];

function Piece({ item, progress }: { item: (typeof PRODUCTS)[number]; progress: MotionValue<number> }) {
  const x = useTransform(progress, [0.52, 0.72], [item.from[0], 0]);
  const y = useTransform(progress, [0.52, 0.72], [item.from[1], 0]);
  const scale = useTransform(progress, [0.52, 0.72], [0.5, 1]);
  return (
    <motion.div className={`absolute ${item.cls}`} style={{ x, y, scale }}>
      <Image src={`/mockups/cutout-${item.src}.webp`} alt="" width={800} height={800} sizes="30vw" className="h-auto w-full" />
    </motion.div>
  );
}

/** The signature section: a pinned, dark, scroll-driven statement. */
export function Cinematic() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const line1 = useTransform(p, [0, 0.04, 0.22, 0.28], [0, 1, 1, 0]);
  const line2 = useTransform(p, [0.26, 0.3, 0.48, 0.54], [0, 1, 1, 0]);
  const pieces = useTransform(p, [0.52, 0.62, 0.8, 0.9], [0, 1, 1, 0.22]);
  const final = useTransform(p, [0.82, 0.92], [0, 1]);
  const finalY = useTransform(p, [0.82, 0.92], [40, 0]);
  const finalEvents = useTransform(p, (v) => (v > 0.84 ? "auto" : "none"));
  const glow = useTransform(p, [0, 0.6, 1], [0.15, 0.5, 0.8]);

  const big = "display mx-auto max-w-5xl text-center text-[clamp(2.4rem,7.5vw,7rem)]";

  return (
    <section ref={ref} className="on-dark relative h-[360vh] bg-black text-ink" aria-label="Your brand has a story">
      <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden">
        <motion.div className="blob left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 bg-brand/40" style={{ opacity: glow }} aria-hidden="true" />

        <motion.div className="container-x absolute" style={{ opacity: line1 }}>
          <ScrollLine text="Your brand has a story." progress={p} from={0.02} to={0.16} className={big} />
        </motion.div>

        <motion.div className="container-x absolute" style={{ opacity: line2 }}>
          <ScrollLine text="We give it a shape people can hold." progress={p} from={0.3} to={0.44} className={big} />
        </motion.div>

        <motion.div className="absolute inset-0 mx-auto max-w-6xl" style={{ opacity: pieces }} aria-hidden="true">
          {PRODUCTS.map((item) => (
            <Piece key={item.src} item={item} progress={p} />
          ))}
        </motion.div>

        <motion.div className="container-x absolute text-center" style={{ opacity: final, y: finalY, pointerEvents: finalEvents }}>
          <h2 className={big}>
            Let’s shape your next <span className="text-gradient">impression.</span>
          </h2>
          <div className="mt-10">
            <ButtonLink href="/quote" variant="brand" cursor="QUOTE" className="px-8 py-4 text-base">
              Start a Project
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
