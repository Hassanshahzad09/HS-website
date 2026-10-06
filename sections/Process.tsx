"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { process } from "@/data/site";
import { cn } from "@/lib/utils";

/** Five-stage timeline: horizontal on desktop, vertical on mobile, lit by scroll. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(process.length - 1, Math.floor(v * process.length))));

  return (
    <section id="process" className="bg-bg2 py-13.5 lg:py-21.5">
      <div className="container-x">
        <SectionHeading eyebrow="Our process" text="Five stages, one point of contact, and a physical sample before anything is committed.">
          <SplitText segments={["From first call ", { text: "to final carton.", gradient: true }]} />
        </SectionHeading>

        <div ref={ref} className="relative mt-12 lg:mt-16">
          {/* track + animated progress line */}
          <div className="absolute left-[11px] top-0 h-full w-px bg-line lg:left-0 lg:top-[11px] lg:h-px lg:w-full" aria-hidden="true">
            <motion.div className="hidden h-full w-full origin-left bg-brand lg:block" style={{ scaleX: line }} />
            <motion.div className="h-full w-full origin-top bg-brand lg:hidden" style={{ scaleY: line }} />
          </div>

          <ol className="grid gap-12 lg:grid-cols-5 lg:gap-8">
            {process.map((s, i) => {
              const on = i <= active;
              return (
                <li key={s.n} className="relative pl-12 lg:pl-0 lg:pt-14" aria-current={i === active ? "step" : undefined}>
                  <span className={cn("absolute left-0 top-0 grid size-[23px] place-items-center rounded-full border bg-bg2 transition-colors duration-500", on ? "border-brand" : "border-line")} aria-hidden="true">
                    <span className={cn("size-[9px] rounded-full transition-all duration-500", on ? "scale-100 bg-brand" : "scale-50 bg-line")} />
                  </span>
                  <p className={cn("display text-[clamp(2.4rem,3.8vw,3.5rem)] transition-colors duration-700", on ? "text-gradient" : "text-line")}>{s.n}</p>
                  <h3 className={cn("mt-3 text-2xl font-medium tracking-tight transition-colors duration-500", !on && "text-muted")}>{s.title}</h3>
                  <p className="mt-3 max-w-xs leading-relaxed text-muted">{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
