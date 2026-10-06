import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { Reveal, SplitText } from "@/components/Reveal";
import { ProductCatalogue } from "@/products/ProductCatalogue";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse custom packaging, labels, stickers, print and branded products from Heritage Shapes. Explore materials and finishes, then request a quote.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <div className="relative overflow-hidden pb-24 pt-32 lg:pt-40">
      <div className="blob -right-32 top-0 size-[30rem] bg-brand/15" aria-hidden="true" />
      <div className="container-x relative">
        <p className="eyebrow mb-5">The catalogue</p>
        <h1 className="display max-w-5xl text-[clamp(2.3rem,5.2vw,4.5rem)]">
          <SplitText segments={["Everything your brand needs ", { text: "to be remembered.", gradient: true }]} />
        </h1>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-lg text-muted">Ten product lines, each made to order. Filter by category, save what you like, and open any product to configure it.</p>
        </Reveal>

        <div className="mt-14">
          <ProductCatalogue withSearch />
        </div>

        <Reveal className="mt-24 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-line bg-surface p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="display text-[clamp(1.4rem,2.3vw,2rem)]">Need something that isn&apos;t listed?</h2>
            <p className="mt-3 max-w-lg text-muted">Most of what we make starts as a custom request. Describe it and we will tell you how we would build it.</p>
          </div>
          <ButtonLink href="/#contact" variant="primary" className="shrink-0">
            Talk to Us
          </ButtonLink>
        </Reveal>
      </div>
    </div>
  );
}
