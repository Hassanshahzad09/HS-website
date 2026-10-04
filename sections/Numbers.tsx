"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { stats } from "@/data/site";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(value);
    const controls = animate(0, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
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
    <section className="bg-bg py-20 lg:py-28" aria-label="Heritage Shapes in numbers">
      <div className="container-x">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse border-t border-line pt-6">
              <dt className="eyebrow mt-3">{s.label}</dt>
              <dd className="display text-gradient text-[clamp(3.2rem,8vw,7rem)]">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
