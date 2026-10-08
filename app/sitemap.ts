import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    { url: `${site.url}/products`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/quote`, lastModified: now, priority: 0.8 },
    { url: `${site.url}/faq`, lastModified: now, priority: 0.6 },
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
