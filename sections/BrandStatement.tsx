"use client";

import { useEffect, useRef } from "react";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const WAVE = "M0 60 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1200 110, 1350 60 S 1650 10, 1800 60";

type Word = string | { text: string; keep?: boolean };

// `keep` words stay in the gradient once the reading head has passed them.
const LINES: Word[][] = [
  ["Your", "packaging", "isn’t", "just", "packaging."],
  ["It", "is", "the", { text: "first", keep: true }, { text: "physical", keep: true }, { text: "impression", keep: true }, "of", "your", "brand."],
];

const DIM = "color-mix(in srgb, var(--ink) 30%, var(--bg-2))";
const GRADIENT = "linear-gradient(100deg, var(--brand) 0%, var(--brand-2) 100%)";
const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Scroll-read statement: words start dim, a few words at the reading head
 * light up in the gradient, and everything behind it settles to ink.
 */
function Statement() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const n = words.length;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the heading enters near the bottom of the screen, 1 once its end reaches mid-screen.
      const at = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35)) * (n + 4);
      const head = at - 1.2;
      words.forEach((w, i) => {
        const lit = i <= head && (i >= head - 2.4 || (head >= n - 1 && i === n - 1) || w.dataset.word === "keep");
        w.style.setProperty("-webkit-text-fill-color", lit ? "transparent" : "currentColor");
        w.style.color = 1 - Math.pow(1 - clamp((at - i) / 2.4), 3) > 0.55 ? "var(--ink)" : DIM;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <h2 ref={ref} className="display mx-auto max-w-6xl text-center text-[clamp(2.1rem,4.8vw,4.5rem)]">
      {LINES.map((line, li) => (
        <span key={li} className={cn("block", li > 0 && "mt-3 lg:mt-5")}>
          {line.map((word, wi) => {
            const w = typeof word === "string" ? { text: word } : word;
            return (
              <span key={wi}>
                <span
                  data-word={w.keep ? "keep" : ""}
                  className="-mb-[0.14em] inline-block bg-clip-text pb-[0.14em]"
                  style={{ color: DIM, backgroundImage: GRADIENT, WebkitTextFillColor: "currentColor", transition: "color .9s var(--ease-expo), -webkit-text-fill-color .9s var(--ease-expo)" }}
                >
                  {w.text}
                </span>{" "}
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

export function BrandStatement() {
  return (
    <section id="about" className="relative z-10 -mt-[45svh] overflow-hidden rounded-t-[2.5rem] bg-bg2 py-17.5 shadow-[0_-30px_80px_-40px_rgba(0,0,0,.35)] lg:-mt-[60vh] lg:rounded-t-[4rem] lg:py-25.5">
      {/* slow background waves */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-60" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 1800 120" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-full w-[200%]" style={{ animation: `drift ${26 + i * 9}s linear infinite`, bottom: `${i * 26}px`, opacity: 0.5 - i * 0.13 }}>
            <path d={WAVE} fill="none" stroke="var(--brand)" strokeWidth={1.2} />
            <path d={WAVE} fill="none" stroke="var(--brand)" strokeWidth={1.2} transform="translate(900 0)" />
          </svg>
        ))}
      </div>

      <div className="container-x relative">
        <Reveal y={12}>
          <p className="eyebrow mb-8 text-center">About Heritage Shapes</p>
        </Reveal>
        <Statement />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="font-serif text-3xl italic leading-snug sm:text-4xl">Where Packaging Meets Legacy.</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              We are a printing and packaging studio working with brands that want the box, the label and the ribbon to say the same thing. Every piece is made to order, sampled before production, and finished by people who notice a millimetre.
            </p>
            <div className="mt-8">
              <ButtonLink href="/#process" variant="outline">
                See how we work
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
