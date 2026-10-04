// Central product catalogue. Add a product here and it appears in the
// catalogue, search, quote builder, sitemap and its own /products/[slug] page.

export type CategoryId = "packaging" | "labels" | "stickers" | "print" | "promotional" | "accessories";

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
  { id: "packaging", name: "Packaging", blurb: "Bags, boxes and pouches that carry your brand out the door." },
  { id: "labels", name: "Labels & Tags", blurb: "The small, stitched-in details customers notice last and remember longest." },
  { id: "stickers", name: "Stickers", blurb: "Transfers and stickers for apparel, glass, packaging and everything between." },
  { id: "print", name: "Print", blurb: "Flyers and cards with the weight and finish of something worth keeping." },
  { id: "promotional", name: "Promotional Products", blurb: "Everyday objects that keep your name on the desk and in the hand." },
  { id: "accessories", name: "Brand Accessories", blurb: "Ribbons and trims that finish a product the way you intended." },
];

export const categoryName = (id: CategoryId) => categories.find((c) => c.id === id)!.name;

/* Shared material and finish definitions ---------------------------------- */

const M = {
  kraft: { name: "Kraft Paper", tone: "kraft" },
  art: { name: "Art Card", tone: "paper" },
  textured: { name: "Textured Paper", tone: "paper" },
  board: { name: "Premium Rigid Board", tone: "board" },
  corrugated: { name: "Corrugated Board", tone: "card" },
  foilLam: { name: "Foil Laminate", tone: "metal" },
  clearFilm: { name: "Clear Film", tone: "clear" },
  matteFilm: { name: "Matte Film", tone: "pvc" },
  silicone: { name: "Silicone", tone: "silicone" },
  pvc: { name: "Soft PVC", tone: "pvc" },
  leather: { name: "PU Leather", tone: "leather" },
  metal: { name: "Metal", tone: "metal" },
  acrylic: { name: "Acrylic", tone: "clear" },
  polyester: { name: "Woven Polyester", tone: "fabric" },
  cotton: { name: "Cotton", tone: "fabric" },
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

const img = (slug: string) => ({
  image: `/products/${slug}.webp`,
  gallery: [`/products/${slug}.webp`, `/products/${slug}-2.webp`, `/products/${slug}-3.webp`],
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
    ...img("shopping-bags"),
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
    ...img("pouches"),
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
    id: "p03",
    name: "Rigid Boxes",
    slug: "rigid-boxes",
    category: "packaging",
    shortDescription: "Heavy board, wrapped by hand, closing with a quiet magnetic snap.",
    description:
      "A rigid box turns opening into an occasion. Magnetic, lift-off, drawer or book style, wrapped in the paper and finish you choose, with inserts cut to hold the product exactly.",
    ...img("rigid-boxes"),
    why: ["Dense board that protects and presents", "Custom inserts in card, foam or fabric", "Finishes layered the way you design them"],
    materials: [M.kraft, M.art, M.board],
    finishes: [F.matte, F.gloss, F.soft, F.foil, F.emboss, F.deboss],
    customization: ["Magnetic, drawer or lift-off", "Custom inserts", "Ribbon pulls", "Printed interior"],
    applications: ["Luxury fashion", "Jewellery", "Electronics", "Corporate gifting"],
    moq: "From 200 units",
    featured: true,
    tags: ["rigid boxes", "box", "gift box", "magnetic", "luxury"],
  },
  {
    id: "p04",
    name: "Rubber & Silicone Tags",
    slug: "silicone-tags",
    category: "labels",
    shortDescription: "Raised, soft-touch tags moulded with your logo in crisp relief.",
    description:
      "Moulded tags give garments and bags a tactile signature. Your logo is cut into a mould, so every edge is sharp and every piece is identical, in the exact colour you specify.",
    ...img("silicone-tags"),
    why: ["2D and 3D raised logos", "Colour matched to your palette", "Sew-on, heat-press or hang-tag formats"],
    materials: [M.silicone, M.pvc],
    finishes: [F.matte, F.gloss, F.emboss, F.deboss],
    customization: ["Shape and size", "Raised or recessed logo", "Sew channel", "Ball chain or string"],
    applications: ["Denim", "Outerwear", "Bags", "Sportswear"],
    moq: "From 500 units",
    tags: ["tags", "rubber", "silicone", "pvc", "labels", "patch"],
  },
  {
    id: "p05",
    name: "Custom Logo Diaries",
    slug: "custom-diaries",
    category: "promotional",
    shortDescription: "Notebooks and diaries bound in your colours, marked with your logo.",
    description:
      "A diary sits on a desk for a year. We bind yours with the cover, paper and details that suit your brand, then press your logo into the cover so it lasts as long as the pages do.",
    ...img("custom-diaries"),
    why: ["Debossed, foiled or printed covers", "Ruled, dotted or dated pages", "Elastic closures, ribbons and pen loops"],
    materials: [M.leather, M.textured, M.kraft],
    finishes: [F.deboss, F.foil, F.emboss, F.soft],
    customization: ["A4, A5 or pocket", "Page layout", "Branded first pages", "Gift boxing"],
    applications: ["Corporate gifts", "Events", "Onboarding kits", "Hospitality"],
    moq: "From 100 units",
    tags: ["diary", "diaries", "notebook", "corporate", "gift"],
  },
  {
    id: "p06",
    name: "Ball Pens",
    slug: "ball-pens",
    category: "promotional",
    shortDescription: "Smooth-writing pens, branded with a clean print or precise engraving.",
    description:
      "The most-used promotional product there is, done properly: balanced barrels, reliable refills and your logo applied so it survives a pocket.",
    ...img("ball-pens"),
    why: ["Metal and soft-touch barrels", "Laser engraving or full-colour print", "Individual sleeves or gift boxes"],
    materials: [M.metal, M.pvc],
    finishes: [F.matte, F.gloss, F.soft, F.print],
    customization: ["Barrel colour", "Ink colour", "Engraving", "Presentation box"],
    applications: ["Conferences", "Hotels", "Offices", "Giveaways"],
    moq: "From 250 units",
    tags: ["pen", "pens", "ball pen", "stationery", "corporate"],
  },
  {
    id: "p07",
    name: "Key Chains",
    slug: "keychains",
    category: "promotional",
    shortDescription: "Leather, metal, acrylic and rubber key chains shaped around your logo.",
    description:
      "Small, carried daily, and surprisingly personal. We cut, mould or cast key chains in the material that fits your brand and finish them with solid hardware.",
    ...img("keychains"),
    why: ["Custom shapes, not stock blanks", "Sturdy rings and clasps", "Works as a gift or a product in itself"],
    materials: [M.leather, M.metal, M.acrylic, M.pvc],
    finishes: [F.emboss, F.deboss, F.print, F.gloss],
    customization: ["Shape", "Hardware colour", "Double-sided branding", "Backing card"],
    applications: ["Automotive", "Hospitality", "Merchandise", "Real estate"],
    moq: "From 200 units",
    tags: ["keychain", "key chain", "keyring", "merchandise"],
  },
  {
    id: "p08",
    name: "Zippers",
    slug: "zippers",
    category: "accessories",
    shortDescription: "Metal and nylon zippers with custom pullers carrying your mark.",
    description:
      "A branded puller is one of the quietest signs of a considered garment. Choose the tape, teeth and slider, and we cast or mould a puller with your logo.",
    ...img("zippers"),
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
    ...img("flyers"),
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
    ...img("ribbons"),
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
    ...img("woven-labels"),
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
    ...img("care-labels"),
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
    ...img("thank-you-cards"),
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
    name: "DTF Stickers",
    slug: "dtf-stickers",
    category: "stickers",
    shortDescription: "Full-colour transfers that press onto fabric with a soft, flexible hand.",
    description:
      "Direct-to-film transfers put detailed, full-colour artwork onto almost any fabric with a heat press. No weeding, no minimum colours, and a print that stretches with the garment.",
    ...img("dtf-stickers"),
    why: ["Photographic detail and gradients", "Works on cotton, polyester and blends", "Soft feel that survives washing"],
    materials: [M.petFilm],
    finishes: [F.print, F.matte, F.gloss],
    customization: ["Any size", "Gang sheets", "Single cut transfers", "White underbase"],
    applications: ["T-shirts", "Hoodies", "Tote bags", "Sportswear"],
    moq: "From 50 sheets",
    tags: ["stickers", "dtf", "transfer", "apparel", "heat press"],
  },
  {
    id: "p15",
    name: "UV DTF Stickers",
    slug: "uv-dtf-stickers",
    category: "stickers",
    shortDescription: "Raised, glossy transfers that bond to glass, metal and plastic.",
    description:
      "UV DTF stickers peel and press onto hard surfaces with no heat, leaving only the artwork behind. The result is a raised, glossy mark that looks printed onto the object itself.",
    ...img("uv-dtf-stickers"),
    why: ["No background, only your artwork", "Scratch and water resistant", "Applies by hand in seconds"],
    materials: [M.clearFilm],
    finishes: [F.uv, F.gloss],
    customization: ["Any shape", "Cup wraps", "Metallic effects", "Sheets or singles"],
    applications: ["Glassware", "Bottles", "Packaging", "Electronics"],
    moq: "From 50 sheets",
    tags: ["stickers", "uv dtf", "transfer", "glass", "cup wrap"],
  },
  {
    id: "p16",
    name: "Plain Stickers — Glossy & Matte",
    slug: "glossy-matte-stickers",
    category: "stickers",
    shortDescription: "Die-cut and sheet stickers in a bright gloss or a calm matte.",
    description:
      "The everyday sticker, made carefully. Printed on durable vinyl or paper, cut to any shape, and finished in high gloss for colour that pops or matte for a softer, writable surface.",
    ...img("glossy-matte-stickers"),
    why: ["Kiss-cut sheets or individual die-cuts", "Gloss for vivid colour, matte for a quiet finish", "Waterproof vinyl option"],
    materials: [M.vinyl, M.paper, M.clearFilm],
    finishes: [F.gloss, F.matte, F.diecut],
    customization: ["Any shape", "Sheets, rolls or singles", "Waterproof", "Back print"],
    applications: ["Packaging seals", "Product labels", "Laptops", "Giveaways"],
    moq: "From 100 units",
    tags: ["stickers", "glossy", "matte", "plain", "die cut", "vinyl", "labels"],
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
