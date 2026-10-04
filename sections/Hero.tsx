"use client";

import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type CSSProperties, type MouseEvent } from "react";
import { ButtonLink } from "@/components/Button";
import { useSiteReady } from "@/components/Preloader";
import { SplitText } from "@/components/Reveal";
import { cn, EASE } from "@/lib/utils";

type FloatItem = {
  src: string;
  alt: string;
  cls: string;
  depth: number; // parallax strength — higher feels closer
  far?: boolean;
  d: number; // float duration (s)
  r: number; // resting rotation (deg)
  to: [number, number]; // where it drifts as the hero scrolls away
};

const ITEMS: FloatItem[] = [
  { src: "card", alt: "Foil-stamped thank you card", cls: "left-[-6%] top-[2%] w-[32%]", depth: 0.4, far: true, d: 9, r: -6, to: [70, 90] },
  { src: "label", alt: "Woven garment label", cls: "left-[62%] top-[-2%] w-[36%]", depth: 0.6, far: true, d: 8, r: 6, to: [-70, 110] },
  { src: "bag", alt: "Custom shopping bag", cls: "left-[22%] top-[4%] w-[54%]", depth: 1, d: 7, r: -2, to: [10, 40] },
  { src: "pouch", alt: "Printed stand-up pouch", cls: "left-[-4%] top-[40%] w-[42%]", depth: 1.3, d: 8.5, r: -4, to: [90, -20] },
  { src: "box", alt: "Rigid gift box", cls: "left-[48%] top-[44%] w-[54%]", depth: 1.5, d: 7.5, r: 0, to: [-60, -40] },
  { src: "ribbon", alt: "Printed ribbon", cls: "left-[12%] top-[70%] w-[52%]", depth: 1.9, d: 6.5, r: 0, to: [30, -90] },
  { src: "sticker", alt: "Die-cut sticker", cls: "left-[72%] top-[28%] w-[15%]", depth: 2.3, d: 6, r: 8, to: [-110, 30] },
];

function Float({ item, i, mx, my, progress, ready }: { item: FloatItem; i: number; mx: MotionValue<number>; my: MotionValue<number>; progress: MotionValue<number>; ready: boolean }) {
  const px = useTransform(mx, (v) => v * item.depth * 16);
  const py = useTransform(my, (v) => v * item.depth * 12);
  const sx = useTransform(progress, [0, 1], [0, item.to[0]]);
  const sy = useTransform(progress, [0, 1], [0, item.to[1]]);
  return (
    <motion.div className={cn("absolute", item.cls, item.far && "opacity-85 blur-[1.5px]")} style={{ x: sx, y: sy }}>
      <motion.div style={{ x: px, y: py }}>
        <motion.div initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={ready ? { opacity: 1, scale: 1, y: 0 } : undefined} transition={{ duration: 1.2, delay: 0.25 + i * 0.09, ease: EASE }}>
          <div className="floaty" style={{ "--d": `${item.d}s`, "--r": `${item.r}deg`, "--delay": `${-i * 1.3}s` } as CSSProperties}>
            <Image src={`/mockups/cutout-${item.src}.webp`} alt={item.alt} width={800} height={800} priority={!item.far} sizes="(min-width: 1024px) 28vw, 44vw" className="h-auto w-full select-none" draggable={false} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = useSiteReady();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  const textY = useTransform(progress, [0, 0.6], [0, -140]);
  const textOpacity = useTransform(progress, [0, 0.45], [1, 0]);
  const visualScale = useTransform(progress, [0, 0.8], [1, 0.78]);
  const visualOpacity = useTransform(progress, [0.45, 0.85], [1, 0.25]);

  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    mx.set((e.clientX / window.innerWidth - 0.5) * 2);
    my.set((e.clientY / window.innerHeight - 0.5) * 2);
  };

  return (
    <section ref={ref} className="relative h-[150svh] lg:h-[175vh]" aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden" onMouseMove={onMove}>
        <div className="blob -left-40 top-10 size-[34rem] bg-brand/20" aria-hidden="true" />
        <div className="blob -right-32 bottom-0 size-[30rem] bg-gold/20" aria-hidden="true" />

        <div className="container-x relative grid h-full grid-rows-[auto_1fr] items-center gap-4 pb-6 pt-24 lg:grid-cols-[1.08fr_1fr] lg:grid-rows-1 lg:gap-6 lg:pb-10">
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10">
            <motion.p className="eyebrow mb-5 lg:mb-7" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : undefined} transition={{ duration: 1, delay: 0.1 }}>
              Custom • Premium • International
            </motion.p>
            <h1 className="display text-[clamp(2.7rem,7.4vw,7.2rem)]">
              <SplitText play={ready} delay={0.1} stagger={0.08} segments={["Packaging\nthat makes\n", { text: "brands memorable.", gradient: true }]} />
            </h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.7, ease: EASE }}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg lg:mt-8">Custom printing and packaging solutions crafted for brands that care about every detail.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-9">
                <ButtonLink href="/products" variant="primary" cursor="EXPLORE">
                  Explore Products
                </ButtonLink>
                <ButtonLink href="/quote" variant="outline" cursor="QUOTE">
                  Request a Quote
                </ButtonLink>
              </div>
            </motion.div>
          </motion.div>

          <motion.div style={{ scale: visualScale, opacity: visualOpacity }} className="relative mx-auto aspect-square h-full max-h-[42svh] lg:h-auto lg:max-h-none lg:w-full lg:max-w-[680px]" data-cursor="DISCOVER">
            {ITEMS.map((item, i) => (
              <Float key={item.src} item={item} i={i} mx={mx} my={my} progress={progress} ready={ready} />
            ))}
          </motion.div>
        </div>

        <motion.div style={{ opacity: textOpacity }} className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex" aria-hidden="true">
          <span className="eyebrow text-[0.62rem]">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <motion.span className="absolute inset-x-0 top-0 h-4 bg-ink" animate={{ y: [-16, 40] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
          </span>
        </motion.div>
      </div>
    </section>
  );
}
