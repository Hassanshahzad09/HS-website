import { Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { testimonials } from "@/data/site";

export function Testimonials() {
  return (
    <section className="bg-bg2 py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="In their words">
          <SplitText segments={["What it feels like ", { text: "on the other side.", serif: true }]} />
        </SectionHeading>

        <ul className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {testimonials.map((t, i) => (
            <li key={t.name} className="w-[84vw] shrink-0 snap-center sm:w-[60vw] lg:w-auto">
              <Reveal delay={i * 0.1} className="h-full">
                <figure className="flex h-full flex-col rounded-[2rem] border border-line bg-surface p-8 lg:p-10">
                  <span className="font-serif text-7xl leading-[0.6] text-brand" aria-hidden="true">
                    “
                  </span>
                  <blockquote className="mt-4 text-xl leading-snug tracking-tight sm:text-2xl">{t.quote}</blockquote>
                  <figcaption className="mt-auto flex items-center gap-4 pt-10">
                    <span className="grid size-11 place-items-center rounded-full bg-bg2 font-serif text-lg italic" aria-hidden="true">
                      {t.name[0]}
                    </span>
                    <span>
                      <span className="block font-medium">{t.name}</span>
                      <span className="block text-sm text-muted">
                        {t.role}, {t.company}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
