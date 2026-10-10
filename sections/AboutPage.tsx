import Image from "next/image";
import Link from "next/link";
import { Check, Factory, Globe2, PackageSearch } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { MaskReveal, Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { stats } from "@/data/site";
import { Global } from "@/sections/Global";

const YEARS = { value: 6, suffix: "+", label: "Years of experience" };

// Where each part of the work happens. Matches the roles marked on the world map.
const BASES = [
  {
    icon: PackageSearch,
    place: "China",
    role: "Sourcing",
    text: "Board, films, ribbon, hardware and specialist stock are sourced from mills and suppliers we have worked with for years, then checked before they ship to the factory.",
  },
  {
    icon: Factory,
    place: "Pakistan",
    role: "Production",
    text: "Printing, weaving, cutting, finishing and assembly happen on our production floor, where every run is made against the sample you approved.",
  },
  {
    icon: Globe2,
    place: "United Kingdom",
    role: "Operations",
    text: "Client relationships, project management and export coordination are run from the UK, so you have one point of contact from first brief to delivery.",
  },
];

// The full manufacturing journey, in more detail than the homepage summary.
const STEPS = [
  { title: "Brief", text: "We learn the product, the customer and the budget, and agree what the packaging needs to do." },
  { title: "Design and dieline", text: "Sizes, structure, material and finish are specified, with dielines prepared for your artwork." },
  { title: "Material sourcing", text: "Stock, films, ribbon and trims are sourced through our network in China and checked on arrival." },
  { title: "Sampling", text: "A physical sample is made and sent to you, so decisions are made on the real object, not a screen." },
  { title: "Production", text: "Printing, foiling, weaving, cutting and assembly in Pakistan, run to the approved sample." },
  { title: "Quality control", text: "Colour, registration and construction are inspected by hand at each stage and again before packing." },
  { title: "Packing and export", text: "Packed for the journey, with export paperwork handled by our team, and shipped to your door." },
];

const VALUES = [
  { title: "Made to order", text: "Nothing is a stock item with a logo added. Every piece is specified around your product." },
  { title: "Sample first", text: "You approve a physical sample before full production. The run is made to match it." },
  { title: "One team, end to end", text: "Sourcing, production and delivery under one roof of responsibility, with one contact." },
  { title: "Honest timelines", text: "Dates agreed up front, updates at each stage, and early warning if anything moves." },
];

const PHOTOS = {
  hero: { src: "/images/portfolio-sartor-rowe-photo.webp", alt: "A printed canvas tote held up for inspection in the print workshop" },
  ribbon: { src: "/images/portfolio-maison-dauphine-photo.webp", alt: "Foil-printed satin ribbon being measured by hand in the workshop" },
  labels: { src: "/images/portfolio-maison-aurelia-labels-photo.webp", alt: "Woven and care labels being sorted and inspected by hand" },
  cards: { src: "/images/portfolio-element-atelier-photo.webp", alt: "A letterpress thank-you card checked before packing" },
};

const figures = [YEARS, ...stats.filter((s) => ["Clients", "Projects Delivered", "Countries Reached"].includes(s.label))];

export function AboutPage() {
  return (
    <>
      {/* Intro */}
      <section className="bg-bg pb-16 pt-32 lg:pb-24 lg:pt-40">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Reveal y={12}>
              <p className="eyebrow mb-5">About Heritage Shapes</p>
            </Reveal>
            <h1 className="display text-[clamp(2.4rem,5.4vw,4.8rem)]">
              <SplitText segments={["Six years of making packaging ", { text: "people keep.", gradient: true }]} />
            </h1>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Heritage Shapes is a printing and packaging studio for brands that want the bag, the label, the ribbon and the card to say the same thing. For more than six years we have sourced, produced and delivered custom packaging for fashion, jewellery, beauty and food brands across nine countries.
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/quote" variant="brand" cursor="QUOTE">
                Start a project
              </ButtonLink>
              <ButtonLink href="/portfolio" variant="outline" cursor="VIEW">
                See our work
              </ButtonLink>
            </Reveal>
          </div>
          <MaskReveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-bg2">
            <Image src={PHOTOS.hero.src} alt={PHOTOS.hero.alt} fill priority sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover" />
          </MaskReveal>
        </div>
      </section>

      {/* Figures */}
      <section className="bg-bg2 py-12 lg:py-16" aria-label="Heritage Shapes in numbers">
        <dl className="container-x grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {figures.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.08} className="flex flex-col-reverse border-t border-line pt-5">
              <dt className="eyebrow mt-2">{f.label}</dt>
              <dd className="display text-gradient text-[clamp(2.4rem,5vw,4.2rem)]">
                {f.value}
                {f.suffix}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Who we are */}
      <section className="bg-bg py-16 lg:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <MaskReveal className="relative order-2 aspect-[4/5] overflow-hidden rounded-[2rem] bg-bg2 lg:order-1">
            <Image src={PHOTOS.labels.src} alt={PHOTOS.labels.alt} fill sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover" />
          </MaskReveal>
          <div className="order-1 lg:order-2">
            <SectionHeading eyebrow="Who we are">
              <SplitText segments={["Makers first, ", { text: "suppliers second.", serif: true }]} />
            </SectionHeading>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
                <p>We started with a simple frustration: brands spending months on a logo, then handing customers packaging that looked like everyone else&rsquo;s. Heritage Shapes exists to close that gap.</p>
                <p>Our team brings together designers, production specialists and quality inspectors who care about the details a customer notices last and remembers longest: the weight of a bag, the crispness of a woven label, the shine of a foil line.</p>
                <p>We work with start-ups placing their first order and established houses refreshing a full retail suite, and treat both with the same attention.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Three countries */}
      <section className="bg-bg2 py-16 lg:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="How we are set up" text="Each part of the work happens where it is done best, and one team connects them.">
            <SplitText segments={["Three countries, ", { text: "one team.", gradient: true }]} />
          </SectionHeading>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {BASES.map((b, i) => (
              <Reveal key={b.place} delay={i * 0.1} className="h-full">
                <li className="flex h-full flex-col rounded-[2rem] border border-line bg-surface p-8">
                  <b.icon className="size-7 text-brand" strokeWidth={1.5} aria-hidden="true" />
                  <p className="eyebrow mt-6 text-gold">{b.role}</p>
                  <h3 className="display mt-2 text-3xl">{b.place}</h3>
                  <p className="mt-4 leading-relaxed text-muted">{b.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Global />

      {/* Manufacturing process */}
      <section id="manufacturing" className="bg-bg py-16 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Our manufacturing process" text="Seven stages, from the first conversation to the box arriving at your door. You see and approve the work at every point that matters.">
              <SplitText segments={["How your packaging ", { text: "gets made.", serif: true }]} />
            </SectionHeading>
            <MaskReveal className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[2rem] bg-bg2 lg:block">
              <Image src={PHOTOS.ribbon.src} alt={PHOTOS.ribbon.alt} fill sizes="40vw" className="object-cover" />
            </MaskReveal>
          </div>
          <ol className="border-t border-line">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.04}>
                <li className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-line py-7">
                  <span className="display text-gradient text-3xl tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-xl font-medium tracking-tight">{s.title}</span>
                    <span className="mt-2 block leading-relaxed text-muted">{s.text}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>


      {/* Values */}
      <section className="bg-bg py-16 lg:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow="What we stand by">
              <SplitText segments={["The way we ", { text: "work.", serif: true }]} />
            </SectionHeading>
            <ul className="mt-8 space-y-6">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <li className="flex gap-4">
                    <Check className="mt-1 size-5 shrink-0 text-brand" aria-hidden="true" />
                    <span>
                      <span className="block text-lg font-medium tracking-tight">{v.title}</span>
                      <span className="mt-1 block text-muted">{v.text}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
          <MaskReveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-bg2">
            <Image src={PHOTOS.cards.src} alt={PHOTOS.cards.alt} fill sizes="(min-width: 1024px) 44vw, 92vw" className="object-cover" />
          </MaskReveal>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-bg pb-24">
        <div className="container-x">
          <Reveal className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink p-8 text-bg sm:flex-row sm:items-center sm:p-12">
            <p className="display max-w-xl text-[clamp(1.6rem,3vw,2.6rem)]">Ready to make packaging your customers keep?</p>
            <ButtonLink href="/quote" variant="brand" cursor="QUOTE" className="shrink-0">
              Start your project
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
