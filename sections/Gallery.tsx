import Image from "next/image";
import { Arrow, buttonClass } from "@/components/buttonStyles";
import { MaskReveal, SectionHeading, SplitText } from "@/components/Reveal";
import { gallery, site } from "@/data/site";
import { cn } from "@/lib/utils";

// Which tiles span two columns / rows in the 4-column grid.
const SPAN = ["sm:col-span-2 sm:row-span-2", "", "", "", "", "sm:col-span-2", "", ""];

export function Gallery() {
  const instagram = site.social.find((s) => s.name === "Instagram")!;
  return (
    <section className="bg-bg py-13.5 lg:py-21.5">
      <div className="container-x">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="From the studio">
            <SplitText segments={["Close-ups, textures, ", { text: "work in progress.", serif: true }]} />
          </SectionHeading>
          <a href={instagram.href} target="_blank" rel="noreferrer" data-cursor="DISCOVER" className={buttonClass("outline", "shrink-0 self-start sm:self-auto")}>
            Follow the journey <Arrow />
          </a>
        </div>

        <ul className="mt-10 grid auto-rows-[44vw] grid-cols-2 gap-3 sm:auto-rows-[22vw] sm:grid-cols-4 sm:gap-4 xl:auto-rows-[320px]">
          {gallery.map((g, i) => (
            <li key={g.src} className={cn("group", SPAN[i])}>
              <MaskReveal delay={(i % 4) * 0.06} className="relative size-full overflow-hidden rounded-3xl bg-bg2">
                <Image src={g.src} alt={g.alt} fill sizes="(min-width: 640px) 50vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-[1.07]" />
              </MaskReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
