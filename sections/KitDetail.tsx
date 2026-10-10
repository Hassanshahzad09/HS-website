import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { brandKits, type BrandKit } from "@/data/site";

/** One branding kit: the full infographic, then each item with its features and where to order it. */
export function KitDetail({ kit }: { kit: BrandKit }) {
  const others = brandKits.filter((k) => k.id !== kit.id);

  return (
    <div className="container-x pb-24 pt-28 lg:pt-32">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="link-underline hover:text-ink">Home</Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link href="/#kits" className="link-underline hover:text-ink">Branding kits</Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-ink">{kit.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow">Branding kit · {kit.name}</p>
          <h1 className="display mt-4 text-[clamp(2.3rem,5.2vw,4.5rem)]">{kit.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{kit.text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/quote" variant="brand" cursor="QUOTE">
            Get a quote for this kit
          </ButtonLink>
        </div>
      </div>

      <div className="relative mt-10 aspect-[2752/1536] overflow-hidden rounded-[2rem] border border-line bg-bg2">
        <Image src={kit.image} alt={kit.alt} fill priority sizes="(min-width: 1480px) 1350px, 92vw" className="object-cover" />
      </div>

      <section aria-labelledby="kit-items" className="mt-20">
        <h2 id="kit-items" className="display text-[clamp(1.8rem,3.5vw,3rem)]">
          What&rsquo;s in the kit
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kit.items.map((it, i) => (
            <li key={it.name} className="flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface">
              <div className="relative aspect-[3/2] bg-bg2">
                <Image src={it.image} alt={it.name} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-medium tracking-tight">{it.name}</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {it.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <Check className="size-4 shrink-0 text-brand" aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  {it.product ? (
                    <Link href={`/products/${it.product}`} className="link-underline text-sm font-medium">
                      View product →
                    </Link>
                  ) : (
                    <Link href="/quote" className="link-underline text-sm font-medium">
                      Ask for a quote →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="other-kits" className="mt-24">
        <h2 id="other-kits" className="display text-[clamp(1.8rem,3.5vw,3rem)]">
          Other kits
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {others.map((k) => (
            <li key={k.id}>
              <Link href={`/kits/${k.id}`} className="group block">
                <span className="relative block aspect-[2752/1536] overflow-hidden rounded-[1.5rem] border border-line bg-bg2 transition-colors group-hover:border-brand">
                  <Image src={k.image} alt={k.alt} fill sizes="(min-width: 768px) 30vw, 92vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </span>
                <span className="mt-3 block font-medium tracking-tight">{k.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
