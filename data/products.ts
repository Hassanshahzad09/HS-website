// Central product catalogue. Add a product here and it appears in the
// catalogue, search, quote builder, sitemap and its own /products/[slug] page.

export type CategoryId = "packaging" | "labels" | "stickers" | "print" | "accessories";

export type Tone = "paper" | "kraft" | "card" | "board" | "fabric" | "pvc" | "silicone" | "clear" | "metal" | "leather" | "satin";
export type Effect = "print" | "matte" | "gloss" | "soft" | "emboss" | "deboss" | "foil" | "uv" | "diecut";

export type Material = { name: string; tone: Tone };
export type Finish = { name: string; effect: Effect };

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  why: string[];
  materials: Material[];
  finishes: Finish[];
  customization: string[];
  applications: string[];
  /** Placeholder — replace with your real minimum order quantity. */
  moq: string;
  featured?: boolean;
  tags: string[];
};

export const categories: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "packaging", name: "Packaging", blurb: "Paper bags, totes and pouches that carry your brand out the door." },
  { id: "labels", name: "Labels & Tags", blurb: "The small, stitched-in details customers notice last and remember longest." },
  { id: "stickers", name: "Stickers", blurb: "Transfers and stickers for apparel, glass, packaging and everything between." },
  { id: "print", name: "Print", blurb: "Flyers and cards with the weight and finish of something worth keeping." },
  { id: "accessories", name: "Brand Accessories", blurb: "Ribbons and trims that finish a product the way you intended." },
];

export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)!.name;

/* Shared material and finish definitions ---------------------------------- */

const M = {
  kraft: { name: "Kraft Paper", tone: "kraft" },
  art: { name: "Art Card", tone: "paper" },
  textured: { name: "Textured Paper", tone: "paper" },
  corrugated: { name: "Corrugated Board", tone: "card" },
  foilLam: { name: "Foil Laminate", tone: "metal" },
  clearFilm: { name: "Clear Film", tone: "clear" },
  matteFilm: { name: "Matte Film", tone: "pvc" },
  metal: { name: "Metal", tone: "metal" },
  polyester: { name: "Woven Polyester", tone: "fabric" },
  cotton: { name: "Cotton", tone: "fabric" },
  canvas: { name: "Cotton Canvas", tone: "fabric" },
  jute: { name: "Jute", tone: "kraft" },
  satin: { name: "Satin", tone: "satin" },
  grosgrain: { name: "Grosgrain", tone: "fabric" },
  nylon: { name: "Nylon Tape", tone: "fabric" },
  vinyl: { name: "White Vinyl", tone: "paper" },
  petFilm: { name: "PET Transfer Film", tone: "clear" },
  paper: { name: "Coated Paper", tone: "paper" },
} satisfies Record<string, Material>;

const F = {
  matte: { name: "Matte", effect: "matte" },
  gloss: { name: "Gloss", effect: "gloss" },
  soft: { name: "Soft Touch", effect: "soft" },
  foil: { name: "Foil", effect: "foil" },
  emboss: { name: "Embossed", effect: "emboss" },
  deboss: { name: "Debossed", effect: "deboss" },
  uv: { name: "Spot UV", effect: "uv" },
  diecut: { name: "Die Cut", effect: "diecut" },
  print: { name: "Full-Colour Print", effect: "print" },
} satisfies Record<string, Finish>;

// Supplied photography: one full shot for cards plus three 4:3 crops for the product page.
const photo = (slug: string) => ({
  image: `/products/photo/${slug}.webp`,
  gallery: [1, 2, 3].map((n) => `/products/photo/${slug}-${n}.webp`),
});

export const products: Product[] = [
  {
    id: "p01",
    name: "Shopping Bags",
    slug: "shopping-bags",
    category: "packaging",
    shortDescription: "Paper bags with the structure, handles and finish of a luxury purchase.",
    description:
      "The bag is what leaves the store with your customer and travels the street with your name on it. We build each one around your product: board weight, gusset, handle and finish chosen to feel right in the hand.",
    ...photo("shopping-bags"),
    why: ["Reinforced tops and bases that hold their shape", "Rope, ribbon, twisted or die-cut handles", "Printed inside and out if you want it"],
    materials: [M.art, M.kraft, M.textured],
    finishes: [F.matte, F.gloss, F.soft, F.foil, F.emboss, F.uv],
    customization: ["Any size", "Handle type and colour", "Inside print", "Ribbon closure"],
    applications: ["Fashion retail", "Beauty", "Gifting", "Events"],
    moq: "From 250 units",
    featured: true,
    tags: ["bags", "paper bag", "carrier", "retail", "luxury"],
  },
  {
    id: "p02",
    name: "Pouches",
    slug: "pouches",
    category: "packaging",
    shortDescription: "Stand-up and flat pouches, printed edge to edge and built to stay fresh.",
    description:
      "Flexible packaging that still looks composed on a shelf. Choose the barrier, the zipper and the window, and we print your artwork right across the seals.",
    ...photo("cotton-pouches"),
    why: ["Resealable zippers and tear notches", "Barrier layers for food and cosmetics", "Clear windows cut to your shape"],
    materials: [M.matteFilm, M.kraft, M.foilLam, M.clearFilm],
    finishes: [F.matte, F.gloss, F.soft, F.uv, F.print],
    customization: ["Stand-up or flat", "Zipper and valve", "Window shape", "Hang hole"],
    applications: ["Coffee and tea", "Snacks", "Cosmetics", "Supplements"],
    moq: "From 500 units",
    featured: true,
    tags: ["pouch", "pouches", "stand-up", "food packaging", "zip"],
  },
  {
    id: "p04",
    name: "Tote Bags",
    slug: "tote-bags",
    category: "packaging",
    shortDescription: "Cotton and canvas totes printed with your logo, made to be carried again.",
    description:
      "A tote keeps working long after the purchase. We cut and stitch yours in the fabric weight you choose, reinforce the handles, and print your artwork so it holds through washing and daily use.",
    ...photo("tote-bags"),
    why: ["Reinforced, cross-stitched handles", "Natural, dyed or black fabric", "Screen print or full-colour transfer"],
    materials: [M.canvas, M.cotton, M.jute],
    finishes: [F.print, F.matte],
    customization: ["Any size", "Handle length", "Gusset and inner pocket", "Zip or button closure"],
    applications: ["Retail", "Events", "Grocery", "Corporate gifting"],
    moq: "From 100 units",
    tags: ["tote", "tote bag", "bags", "canvas", "cotton", "reusable"],
  },
  {
    id: "p08",
    name: "Zippers",
    slug: "zippers",
    category: "accessories",
    shortDescription: "Metal and nylon zippers with custom pullers carrying your mark.",
    description:
      "A branded puller is one of the quietest signs of a considered garment. Choose the tape, teeth and slider, and we cast or mould a puller with your logo.",
    ...photo("zippers"),
    why: ["Custom logo pullers in metal or rubber", "Teeth in gold, silver, gunmetal or matched colour", "Cut to length for your patterns"],
    materials: [M.nylon, M.metal],
    finishes: [F.matte, F.gloss, F.emboss, F.deboss],
    customization: ["Length and gauge", "Teeth finish", "Puller shape", "Tape colour"],
    applications: ["Jackets", "Bags", "Denim", "Leather goods"],
    moq: "From 500 units",
    tags: ["zipper", "zippers", "zip", "puller", "trims"],
  },
  {
    id: "p09",
    name: "Flyers",
    slug: "flyers",
    category: "print",
    shortDescription: "Sharp, colour-true flyers on stock that feels deliberate.",
    description:
      "Print still works when it is printed well. We run flyers on papers with real weight, keep colour consistent across the run, and trim them clean.",
    ...photo("flyers"),
    why: ["Accurate colour across the whole run", "Single or double sided", "Folded formats on request"],
    materials: [M.paper, M.art, M.textured],
    finishes: [F.matte, F.gloss, F.soft, F.uv],
    customization: ["A4, A5, DL or custom", "Paper weight", "Folds", "Rounded corners"],
    applications: ["Launches", "Retail inserts", "Events", "Menus"],
    moq: "From 500 units",
    tags: ["flyer", "flyers", "leaflet", "print", "brochure"],
  },
  {
    id: "p10",
    name: "Ribbons",
    slug: "ribbons",
    category: "accessories",
    shortDescription: "Satin and grosgrain ribbon printed with your logo, roll after roll.",
    description:
      "Ribbon is the last thing tied and the first thing touched. We print or foil your logo along satin, grosgrain or cotton, in the width and repeat you choose.",
    ...photo("ribbons"),
    why: ["Colour matched to your palette", "Foil, raised or flat print", "Supplied on rolls or pre-cut"],
    materials: [M.satin, M.grosgrain, M.cotton],
    finishes: [F.print, F.foil, F.emboss],
    customization: ["Width", "Logo repeat", "Edge style", "Pre-tied bows"],
    applications: ["Gift wrapping", "Packaging", "Fashion", "Events"],
    moq: "From 5 rolls",
    featured: true,
    tags: ["ribbon", "ribbons", "satin", "grosgrain", "gift wrap"],
  },
  {
    id: "p11",
    name: "Woven Labels",
    slug: "woven-labels",
    category: "labels",
    shortDescription: "Fine-thread woven labels with crisp lettering and soft edges.",
    description:
      "A woven label is read every time a garment is put on. We weave yours in high-density thread so small type stays legible and the edges stay comfortable on skin.",
    ...photo("woven-labels"),
    why: ["High-density weave for fine detail", "Soft, heat-cut edges", "Centre, end or mitre folds"],
    materials: [M.polyester, M.cotton, M.satin],
    finishes: [F.matte, F.gloss, F.diecut],
    customization: ["Fold type", "Thread colours", "Size", "Iron-on backing"],
    applications: ["Apparel", "Accessories", "Home textiles", "Footwear"],
    moq: "From 500 units",
    featured: true,
    tags: ["labels", "woven", "neck label", "garment", "clothing"],
  },
  {
    id: "p12",
    name: "Care Labels",
    slug: "care-labels",
    category: "labels",
    shortDescription: "Printed care and content labels that stay readable wash after wash.",
    description:
      "Care labels carry the information a garment legally needs, and they should not scratch. We print on soft satin or cotton with inks that hold through washing.",
    ...photo("care-labels"),
    why: ["Wash-fast printing", "Soft satin that sits flat", "Multi-language and size sets"],
    materials: [M.satin, M.cotton, M.polyester],
    finishes: [F.print, F.matte],
    customization: ["Symbols and languages", "Size runs", "Fold type", "Print colour"],
    applications: ["Apparel", "Bedding", "Uniforms", "Kidswear"],
    moq: "From 1,000 units",
    tags: ["labels", "care label", "wash label", "garment", "satin"],
  },
  {
    id: "p13",
    name: "Thank You Cards",
    slug: "thank-you-cards",
    category: "print",
    shortDescription: "Thick cards with foil and emboss, slipped into every order.",
    description:
      "A card in the parcel is the cheapest way to make an order feel personal. We print on heavy stock and add foil, emboss or a painted edge so it gets kept.",
    ...photo("thank-you-cards"),
    why: ["Heavy stock with real presence", "Foil, emboss and edge colour", "Matching envelopes available"],
    materials: [M.art, M.textured, M.kraft],
    finishes: [F.foil, F.emboss, F.deboss, F.soft, F.uv],
    customization: ["Size", "Double-sided print", "QR or discount code", "Envelopes"],
    applications: ["E-commerce orders", "Boutiques", "Weddings", "Subscriptions"],
    moq: "From 250 units",
    tags: ["thank you", "cards", "insert", "print", "ecommerce"],
  },
  {
    id: "p14",
    name: "Stickers",
    slug: "stickers",
    category: "stickers",
    shortDescription: "DTF, UV DTF, glossy and matte stickers, cut to any shape.",
    description:
      "Every kind of sticker we make, in one place. DTF transfers heat-press onto fabric with a soft, flexible feel. UV DTF transfers peel and press onto glass, metal and plastic, leaving only the raised, glossy artwork. Plain stickers are printed on vinyl or paper and finished in high gloss or a calm, writable matte.",
    ...photo("stickers"),
    why: ["DTF for fabric: full colour, soft, wash-fast", "UV DTF for hard surfaces: raised, glossy, no background", "Plain gloss or matte: die-cut singles, kiss-cut sheets or rolls"],
    materials: [M.vinyl, M.paper, M.petFilm, M.clearFilm],
    finishes: [F.gloss, F.matte, F.print, F.uv, F.diecut],
    customization: ["Sticker type", "Any shape and size", "Sheets, rolls or singles", "Waterproof vinyl"],
    applications: ["Apparel", "Glassware and bottles", "Packaging seals", "Product labels"],
    moq: "From 50 sheets",
    tags: ["stickers", "sticker", "dtf", "uv dtf", "transfer", "glossy", "matte", "die cut", "vinyl", "labels"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const byCategory = (id: CategoryId) => products.filter((p) => p.category === id);

/** Simple scored search across name, tags, category and description. */
export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products
    .map((p) => {
      const name = p.name.toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score += 6;
      else if (name.includes(q)) score += 4;
      if (p.tags.some((t) => t.includes(q) || q.includes(t))) score += 3;
      if (categoryName(p.category).toLowerCase().includes(q)) score += 2;
      if (p.shortDescription.toLowerCase().includes(q)) score += 1;
      return { p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}
