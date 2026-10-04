import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryName, getProduct, products } from "@/data/products";
import { site } from "@/data/site";
import { ProductDetail } from "@/products/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `Custom ${product.name}`,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `Custom ${product.name} | ${site.name}`, description: product.shortDescription, images: [product.image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const url = `${site.url}/products/${product.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      category: categoryName(product.category),
      image: product.gallery.map((g) => site.url + g),
      brand: { "@type": "Brand", name: site.name },
      material: product.materials.map((m) => m.name).join(", "),
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Products", item: `${site.url}/products` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ProductDetail key={product.slug} product={product} />
    </>
  );
}
