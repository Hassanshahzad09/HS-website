import { Factory, Globe, Layers, ScanSearch, Shapes, Sparkles, type LucideIcon } from "lucide-react";
import { Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { benefits } from "@/data/site";

const ICONS: Record<(typeof benefits)[number]["icon"], LucideIcon> = {
  shapes: Shapes,
  sparkles: Sparkles,
  scan: ScanSearch,
  layers: Layers,
  factory: Factory,
  globe: Globe,
};

export function Why() {
  return (
    <section className="bg-bg2 py-13.5 lg:py-21.5">
      <div className="container-x">
        <SectionHeading eyebrow="Why Heritage Shapes">
          <SplitText segments={["Six reasons brands ", { text: "stay.", serif: true }]} />
        </SectionHeading>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = ICONS[b.icon];
            return (
              <li key={b.title} className="group bg-bg2 transition-colors duration-500 hover:bg-surface">
                <Reveal delay={(i % 3) * 0.08} className="flex h-full flex-col p-8 lg:p-10">
                  <div className="flex items-center justify-between">
                    <Icon className="size-7 text-brand transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={1.25} aria-hidden="true" />
                    <span className="eyebrow">0{i + 1}</span>
                  </div>
                  <h3 className="mt-10 text-2xl font-medium tracking-tight">{b.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{b.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
