"use client";

import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { ButtonLink } from "@/components/Button";
import { useSiteReady } from "@/components/Preloader";
import { SplitText } from "@/components/Reveal";
import { rating, stats } from "@/data/site";
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
  { src: "photo-card", alt: "Foil-stamped thank you card", cls: "left-[-6%] top-[2%] w-[32%]", depth: 0.4, far: true, d: 9, r: -6, to: [70, 90] },
  { src: "photo-label", alt: "Woven garment label", cls: "left-[62%] top-[-2%] w-[36%]", depth: 0.6, far: true, d: 8, r: 6, to: [-70, 110] },
  { src: "photo-bag", alt: "Custom shopping bag", cls: "left-[22%] top-[4%] w-[54%]", depth: 1, d: 7, r: -2, to: [10, 40] },
  { src: "photo-tote", alt: "Printed canvas tote bag", cls: "left-[50%] top-[42%] w-[50%]", depth: 1.5, d: 7.5, r: 4, to: [-60, -40] },
  { src: "photo-ribbon", alt: "Printed ribbon", cls: "left-[-2%] top-[46%] w-[50%]", depth: 1.9, d: 6.5, r: 0, to: [30, -90] },
];

// Words typed after "brands" in the headline. The first is also the widest, so it reserves the space.
const WORDS = ["memorable.", "iconic.", "timeless."];

function TypedWord({ play }: { play: boolean }) {
  const [text, setText] = useState(WORDS[0]);

  useEffect(() => {
    if (!play) return;
    let word = 0;
    let len = WORDS[0].length;
    let deleting = true;
    let timer: number;
    const tick = () => {
      if (deleting) {
        len--;
        if (len === 0) {
          deleting = false;
          word = (word + 1) % WORDS.length;
        }
      } else {
        len++;
      }
      setText(WORDS[word].slice(0, len));
      const full = !deleting && len === WORDS[word].length;
      if (full) deleting = true;
      timer = window.setTimeout(tick, full ? 1800 : len === 0 ? 350 : deleting ? 45 : 95);
    };
    timer = window.setTimeout(tick, 3000);
    return () => window.clearTimeout(timer);
  }, [play]);

  return (
    <span className="inline-grid">
      <span className="invisible col-start-1 row-start-1 pr-[0.1em]">{WORDS[0]}</span>
      <span className="col-start-1 row-start-1 whitespace-nowrap">
        <span className="text-gradient">{text}</span>
        <span className="ml-[0.04em] inline-block h-[0.82em] w-[0.05em] translate-y-[0.08em] animate-pulse bg-brand" />
      </span>
    </span>
  );
}

function Float({ item, i, mx, my, progress, ready }: { item: FloatItem; i: number; mx: MotionValue<number>; my: MotionValue<number>; progress: MotionValue<number>; ready: boolean }) {
  const px = useTransform(mx, (v) => v * item.depth * 16);
  const py = useTransform(my, (v) => v * item.depth * 12);
  const sx = useTransform(progress, [0, 1], [0, item.to[0]]);
  const sy = useTransform(progress, [0, 1], [0, item.to[1]]);
  return (
    <motion.div className={cn("absolute", item.cls, item.far && "opacity-85")} style={{ x: sx, y: sy }}>
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
      <div className="sticky top-0 h-[100svh] min-h-[40rem] overflow-hidden" onMouseMove={onMove}>
        <div className="blob -left-40 top-10 size-[34rem] bg-brand/20" aria-hidden="true" />
        <div className="blob -right-32 bottom-0 size-[30rem] bg-gold/20" aria-hidden="true" />

        <div className="container-x relative grid h-full grid-rows-[auto_1fr] items-center gap-4 pb-6 pt-24 lg:grid-cols-[1.08fr_1fr] lg:grid-rows-1 lg:gap-6 lg:pb-10">
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 lg:-mt-14">
            <h1 className="display text-[clamp(2.2rem,4.8vw,4.4rem)]">
              <SplitText play={ready} delay={0.1} stagger={0.08} segments={["Packaging\nthat makes"]} />
              <span className="block" role="text" aria-label={`brands ${WORDS[0]}`}>
                {[<span key="brands" className="text-gradient">brands</span>, <TypedWord key="typed" play={ready} />].map((word, i) => (
                  <span key={i} aria-hidden="true" className={cn("inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom", i === 0 && "mr-[0.22em]")}>
                    <motion.span className="inline-block will-change-transform" initial={{ y: "115%" }} animate={ready ? { y: 0 } : undefined} transition={{ duration: 1, delay: 0.34 + i * 0.08, ease: EASE }}>
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
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
              <TrustBadge />
            </motion.div>
          </motion.div>

          <motion.div style={{ scale: visualScale, opacity: visualOpacity }} className="relative mx-auto aspect-square h-full max-h-[42svh] lg:h-auto lg:max-h-none lg:w-full lg:max-w-[42.5rem]" data-cursor="DISCOVER">
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

const clients = stats.find((st) => st.label === "Clients");
const countries = stats.find((st) => st.label === "Countries Reached");

/** Star icon, filled to `fill` (0 to 1) so a 4.8 rating shows the last star 80% full. */
function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block size-3.5" aria-hidden="true">
      <svg viewBox="0 0 20 20" className="absolute inset-0 size-full fill-line"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" /></svg>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <svg viewBox="0 0 20 20" className="size-3.5 fill-gold"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" /></svg>
      </span>
    </span>
  );
}

/** Trust line under the hero buttons. The stars appear only once `rating` in data/site.ts has a real source. */
function TrustBadge() {
  if (!clients) return null;
  return (
    <div className="glass-btn mt-6 inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 active:scale-100 lg:mt-8">
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand text-onbrand shadow-[0_6px_16px_-6px_var(--brand)]">
        {/* Small gold star accent on top of the badge (decorative, not a rating). */}
        <svg viewBox="0 0 20 20" className="absolute -right-1 -top-1 size-4 fill-gold drop-shadow-[0_1px_2px_rgba(0,0,0,.25)]" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" /></svg>
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2l7 3v6c0 4.5-3 8.5-7 11-4-2.5-7-6.5-7-11V5z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </svg>
      </span>
      {rating && (
        <span className="flex items-center gap-2 border-r border-line pr-3">
          <span className="flex gap-0.5" role="img" aria-label={`Rated ${rating.value} out of 5 on ${rating.source}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} fill={Math.max(0, Math.min(1, (rating?.value ?? 0) - i))} />
            ))}
          </span>
          <span className="text-sm font-semibold tabular-nums">{rating.value.toFixed(1)}</span>
        </span>
      )}
      <span className="text-sm leading-tight">
        <span className="font-semibold">
          Trusted by {clients.value}
          {clients.suffix} clients
        </span>
        {countries && (
          <span className="text-muted">
            {" "}
            in {countries.value}
            {countries.suffix} countries
          </span>
        )}
      </span>
    </div>
  );
}
