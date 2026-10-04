import { ButtonLink } from "@/components/Button";
import { Reveal, SplitText } from "@/components/Reveal";

const WAVE = "M0 60 C 150 10, 300 110, 450 60 S 750 10, 900 60 S 1200 110, 1350 60 S 1650 10, 1800 60";

export function BrandStatement() {
  return (
    <section id="about" className="relative z-10 -mt-[45svh] overflow-hidden rounded-t-[2.5rem] bg-bg2 py-28 shadow-[0_-30px_80px_-40px_rgba(0,0,0,.35)] lg:-mt-[60vh] lg:rounded-t-[4rem] lg:py-44">
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
          <p className="eyebrow mb-8">About Heritage Shapes</p>
        </Reveal>
        <h2 className="display max-w-6xl text-[clamp(2.3rem,6.4vw,6rem)]">
          <SplitText segments={["Your packaging isn’t ", { text: "just", serif: true }, " packaging."]} />
          <SplitText delay={0.35} className="mt-3 text-muted lg:mt-5" segments={["It is the ", { text: "first physical impression", gradient: true }, " of your brand."]} />
        </h2>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_1.1fr]">
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
