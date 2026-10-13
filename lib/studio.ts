import type { Product } from "@/data/products";

// Shared by the Studio screen and the server.

// Products the Studio can visualise at launch (PRD: 6 to 8 products).
export const STUDIO_SLUGS = ["shopping-bags", "tote-bags", "pouches", "thank-you-cards", "woven-labels", "ribbons", "stickers", "butter-paper"];

export type StudioConfig = { colour: string; material: string; finish: string; logoType: string; size: string; placement: string };

/** The sample photo that best matches the chosen finish, standing in for a generated image. */
export function sampleImage(p: Product, c: { finish: string; logoType: string }) {
  const effect = p.logoTypes ? p.logoTypes.find((l) => l.name === c.logoType)?.effect : p.finishes.find((f) => f.name === c.finish)?.effect;
  return p.variants?.find((v) => v.effect === effect)?.image ?? p.image;
}
