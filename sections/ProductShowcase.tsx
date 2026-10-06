import { ButtonLink } from "@/components/Button";
import { SectionHeading, SplitText } from "@/components/Reveal";
import { ProductCatalogue } from "@/products/ProductCatalogue";

export function ProductShowcase() {
  return (
    <section id="products" className="relative bg-bg py-13.5 lg:py-21.5">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="The catalogue">
            <SplitText segments={["Everything your brand needs ", { text: "to be remembered.", gradient: true }]} />
          </SectionHeading>
          <ButtonLink href="/products" variant="outline" cursor="EXPLORE" className="shrink-0">
            Explore Products
          </ButtonLink>
        </div>
        <div className="mt-10 lg:mt-12">
          <ProductCatalogue carousel />
        </div>
      </div>
    </section>
  );
}
