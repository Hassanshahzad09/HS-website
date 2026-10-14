import type { ReactNode } from "react";

/** Plain reading layout for the privacy policy and terms. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-bg pb-20 pt-32 lg:pt-40">
      <div className="container-x">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.6rem)]">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
          <div className="mt-8 text-lg leading-relaxed text-muted">{intro}</div>
          <div className="legal mt-10 space-y-10 leading-relaxed text-ink/85 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
            {children}
          </div>
        </article>
      </div>
    </section>
  );
}
