"use client";

import { Factory, Globe, Layers, ScanSearch, Shapes, Sparkles, type LucideIcon } from "lucide-react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { benefits } from "@/data/site";
import { cn } from "@/lib/utils";

const ICONS: Record<(typeof benefits)[number]["icon"], LucideIcon> = {
  shapes: Shapes,
  sparkles: Sparkles,
  scan: ScanSearch,
  layers: Layers,
  factory: Factory,
  globe: Globe,
};

const STEP_MS = 1300;
const HOLD_STEPS = 2; // pause with every step complete before starting again

/**
 * The six reasons as a progress line: each step lights up in turn, the line between steps
 * fills, and the current step glows. Runs while the section is on screen, then loops.
 * Elements carry `keep-motion` so the effect still plays when the device asks for less motion
 * (it is slow and does not move the page).
 */
export function Why() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setTick((n) => (n + 1) % (benefits.length + 1 + HOLD_STEPS)), STEP_MS);
    return () => clearInterval(t);
  }, [inView]);

  // 0..5 = that step is in progress; 6 and above = all done (held briefly).
  const active = Math.min(tick, benefits.length);
  const state = (i: number) => (i < active ? "done" : i === active ? "current" : "next");

  return (
    <section className="bg-bg2 py-12 lg:py-16">
      <div className="container-x">
        <SectionHeading eyebrow="Why Heritage Shapes">
          <SplitText segments={["Six reasons brands ", { text: "stay.", serif: true }]} />
        </SectionHeading>

        <div ref={ref} className="mt-10 rounded-[2rem] border border-line bg-surface/60 px-5 py-8 sm:px-8 lg:px-6 lg:py-12">
          <ol className="grid gap-0 lg:grid-cols-6 lg:gap-4">
            {benefits.map((b, i) => {
              const Icon = ICONS[b.icon];
              const s = state(i);
              const last = i === benefits.length - 1;
              const lineFilled = i < active;
              return (
                <li key={b.title} className="relative flex gap-5 pb-6 last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:pb-0 lg:text-center">
                  {/* Connector to the next step: down on phones, across on large screens. */}
                  {!last && (
                    <>
                      <span className="absolute left-7 top-14 h-[calc(100%-3.5rem)] w-0.5 -translate-x-1/2 overflow-hidden rounded-full bg-line lg:hidden" aria-hidden="true">
                        <span className={cn("keep-motion absolute inset-x-0 top-0 bg-gradient-to-b from-brand to-gold transition-[height] duration-[1100ms] ease-out", lineFilled ? "h-full" : "h-0")} />
                      </span>
                      <span className="absolute left-[calc(50%+2.25rem)] right-[calc(-50%+2.25rem)] top-7 hidden h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-line lg:block" aria-hidden="true">
                        <span className={cn("keep-motion absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-gold transition-[width] duration-[1100ms] ease-out", lineFilled ? "w-full" : "w-0")} />
                      </span>
                    </>
                  )}

                  {/* Step circle */}
                  <span className="relative grid size-14 shrink-0 place-items-center">
                    {s === "current" && <span className="keep-motion absolute inset-0 animate-[pulse-ring_2s_ease-out_infinite] rounded-full bg-brand/25" aria-hidden="true" />}
                    <span
                      className={cn(
                        "keep-motion relative grid size-14 place-items-center rounded-full border transition-all duration-500",
                        s === "done" && "border-brand/30 bg-brand/10 text-brand",
                        s === "current" && "border-transparent bg-surface text-brand shadow-[0_0_0_2px_var(--brand),0_0_0_7px_color-mix(in_srgb,var(--brand)_14%,transparent),0_14px_34px_-12px_var(--brand)]",
                        s === "next" && "border-line bg-surface text-muted",
                      )}
                    >
                      <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </span>

                  {/* Text */}
                  <div className={cn("keep-motion min-w-0 pt-1 transition-opacity duration-500 lg:mt-4 lg:pt-0", s === "next" ? "opacity-55" : "opacity-100")}>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">Step 0{i + 1}</p>
                    <h3 className="mt-1 text-lg font-medium tracking-tight">{b.title}</h3>
                    <span className={cn("keep-motion mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-500", s === "next" ? "border-line text-muted" : "border-brand/25 bg-brand/5 text-brand")}>{b.tag}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
