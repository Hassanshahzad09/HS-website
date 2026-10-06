"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn, EASE } from "@/lib/utils";

const viewport = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Fade + translate a block into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  scale,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: scale ?? 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewport}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

type Segment = string | { text: string; gradient?: boolean; serif?: boolean };

/**
 * Word-by-word masked text reveal. Pass plain strings or segments flagged
 * `gradient` / `serif`; use "\n" inside a string for a line break.
 */
export function SplitText({
  segments,
  className,
  delay = 0,
  play,
  stagger = 0.06,
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  /** Control the animation manually instead of on scroll. */
  play?: boolean;
  stagger?: number;
}) {
  const label = segments.map((s) => (typeof s === "string" ? s : s.text)).join("").replace(/\n/g, " ");
  let i = 0;
  const controlled = play !== undefined;
  return (
    <motion.span
      className={cn("block", className)}
      aria-label={label}
      role="text"
      initial="hidden"
      {...(controlled ? { animate: play ? "show" : "hidden" } : { whileInView: "show", viewport })}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {segments.map((seg, si) => {
        const s = typeof seg === "string" ? { text: seg } : seg;
        return s.text.split(/(\n| )/).map((word, wi) => {
          if (word === "\n") return <br key={`${si}-${wi}`} aria-hidden="true" />;
          if (word === " " || word === "") return word === " " ? " " : null;
          i++;
          return (
            <span key={`${si}-${wi}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
              <motion.span
                className={cn("inline-block will-change-transform", s.gradient && "text-gradient", s.serif && "font-serif italic font-normal tracking-normal")}
                variants={{ hidden: { y: "115%" }, show: { y: 0 } }}
                transition={{ duration: 1, ease: EASE }}
              >
                {word}
              </motion.span>
            </span>
          );
        });
      })}
    </motion.span>
  );
}

/** Clip-path image/mask reveal. */
export function MaskReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={viewport}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  children,
  text,
  className,
  center,
}: {
  eyebrow: string;
  children: ReactNode;
  text?: string;
  className?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-4xl", center && "mx-auto text-center", className)}>
      <Reveal y={12}>
        <p className="eyebrow mb-5">{eyebrow}</p>
      </Reveal>
      <h2 className="display text-[clamp(1.9rem,4vw,3.5rem)]">{children}</h2>
      {text && (
        <Reveal delay={0.15}>
          <p className={cn("mt-6 max-w-xl text-lg leading-relaxed text-muted", center && "mx-auto")}>{text}</p>
        </Reveal>
      )}
    </div>
  );
}
