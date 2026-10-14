import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { brandKits, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, priority: 1 },
    { url: `${site.url}/products`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/quote`, lastModified: now, priority: 0.8 },
    { url: `${site.url}/about`, lastModified: now, priority: 0.8 },
    { url: `${site.url}/portfolio`, lastModified: now, priority: 0.8 },
    { url: `${site.url}/ai-studio`, lastModified: now, priority: 0.9 },
    { url: `${site.url}/pricing`, lastModified: now, priority: 0.7 },
    { url: `${site.url}/faq`, lastModified: now, priority: 0.6 },
    { url: `${site.url}/privacy`, lastModified: now, priority: 0.2 },
    { url: `${site.url}/terms`, lastModified: now, priority: 0.2 },
    ...brandKits.map((k) => ({ url: `${site.url}/kits/${k.id}`, lastModified: now, priority: 0.7 })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
