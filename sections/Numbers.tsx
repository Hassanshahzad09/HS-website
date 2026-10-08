"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/site";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  // Rendered with the real figure, then counts up from 1 (never 0) when it scrolls into view.
  const [n, setN] = useState(value);

  useEffect(() => {
    if (!inView) return setN(1);
    const controls = animate(1, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.max(1, Math.round(v))), onComplete: () => setN(value) });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">
        {n}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}

export function Numbers() {
  return (
    <section className="bg-bg py-11.5 lg:py-17.5" aria-label="Heritage Shapes in numbers">
      <div className="container-x">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse border-t border-line pt-6">
              <dt className="eyebrow mt-3">{s.label}</dt>
              <dd className="display text-gradient text-[clamp(2.6rem,6vw,5.2rem)]">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
