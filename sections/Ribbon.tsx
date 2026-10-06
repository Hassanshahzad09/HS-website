"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { ButtonLink } from "@/components/Button";
import { Reveal, SplitText } from "@/components/Reveal";
import { ribbonUses } from "@/data/site";

const PATH = "M-60 210 C 180 40, 380 380, 640 200 S 1000 20, 1180 210 S 1460 400, 1680 150";

/** A satin ribbon unrolls across the section as it scrolls into view. */
export function Ribbon() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 40%"] });
  const print = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]); // gold repeat appears once the ribbon is laid
  const draw = useSpring(useTransform(scrollYProgress, [0, 0.85], [0, 1]), { stiffness: 80, damping: 24 });

  return (
    <section ref={ref} className="on-dark relative overflow-hidden bg-bg py-17.5 text-ink lg:py-25.5">
      <svg viewBox="0 0 1600 420" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 h-[70%] w-full -translate-y-1/2" aria-hidden="true">
        <defs>
          <linearGradient id="ribbon-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#05649a" />
            <stop offset=".3" stopColor="#2e9bd1" />
            <stop offset=".5" stopColor="#0a4f78" />
            <stop offset=".75" stopColor="#3ba4db" />
            <stop offset="1" stopColor="#05649a" />
          </linearGradient>
        </defs>
        {/* shadow, body, highlight, printed repeat */}
        <motion.path d={PATH} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={64} style={{ pathLength: draw }} transform="translate(8 16)" />
        <motion.path d={PATH} fill="none" stroke="url(#ribbon-sheen)" strokeWidth={60} style={{ pathLength: draw }} />
        <motion.path d={PATH} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={10} style={{ pathLength: draw }} transform="translate(0 -18)" />
        <motion.path d={PATH} fill="none" stroke="#d9b27a" strokeWidth={2} strokeDasharray="2 26" strokeLinecap="round" style={{ opacity: print }} />
      </svg>

      <div className="container-x relative">
        <Reveal y={12}>
          <p className="eyebrow mb-6">Ribbons</p>
        </Reveal>
        <h2 className="display max-w-5xl text-[clamp(2rem,4.5vw,4rem)] [text-shadow:0_2px_30px_rgba(0,0,0,.55)]">
          <SplitText segments={["Details are what make a brand ", { text: "feel premium.", serif: true }]} />
        </h2>

        <ul className="mt-10 flex flex-wrap gap-2.5">
          {ribbonUses.map((u, i) => (
            <motion.li key={u} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }} className="glass rounded-full border border-line px-5 py-2.5 text-sm">
              {u}
            </motion.li>
          ))}
        </ul>

        <Reveal className="mt-10" delay={0.3}>
          <ButtonLink href="/products/ribbons" variant="brand" cursor="EXPLORE">
            Explore Ribbons
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
