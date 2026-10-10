// Everything business-specific lives here. Values marked PLACEHOLDER are
// sample content — replace them with your real details before launch.

export const site = {
  name: "Heritage Shapes",
  tagline: "Where Packaging Meets Legacy.",
  title: "Heritage Shapes | Premium Printing & Packaging Solutions",
  description:
    "Heritage Shapes creates premium custom printing, packaging, labels, stickers and branded products for businesses looking to make a lasting impression.",
  url: "https://www.heritageshapes.com", // PLACEHOLDER domain
  email: "hello@heritageshapes.com", // PLACEHOLDER
  whatsapp: { label: "+92 300 0000000", href: "https://wa.me/923000000000" }, // PLACEHOLDER
  location: "Pakistan — shipping worldwide",
  social: [
    { name: "Instagram", href: "https://www.instagram.com/" }, // PLACEHOLDER links
    { name: "LinkedIn", href: "https://www.linkedin.com/" },
    { name: "Facebook", href: "https://www.facebook.com/" },
  ],
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "AI Studio", href: "/ai-studio", ai: true },
  { label: "Contact", href: "/#contact" },
];

/** PLACEHOLDER figures — edit freely. */
export const stats = [
  { value: 50, suffix: "+", label: "Clients" },
  { value: 250, suffix: "+", label: "Projects Delivered" },
  { value: 10, suffix: "+", label: "Custom Products" },
  { value: 9, suffix: "+", label: "Countries Reached" },
];

export const benefits = [
  { icon: "shapes", title: "Custom Solutions", text: "Nothing off the shelf. Size, structure and material are drawn around your product." },
  { icon: "sparkles", title: "Premium Finishes", text: "Foil, emboss, soft touch and spot UV, layered with a designer's restraint." },
  { icon: "scan", title: "Quality Focus", text: "Every run is checked against the approved sample before it is packed." },
  { icon: "layers", title: "Flexible Quantities", text: "Short runs for a launch, larger runs when it works. We size the order to you." },
  { icon: "factory", title: "Reliable Production", text: "Clear timelines, agreed up front, with updates at each stage." },
  { icon: "globe", title: "International Shipping", text: "Packed for the journey and shipped to brands across borders." },
] as const;

// Complete branding kits by industry, each shown as one infographic plus a photo per item.
// An item's `product` is a slug from data/products.ts when we sell it as a standalone product.
export type KitItem = { name: string; features: string[]; image: string; product?: string };
export type BrandKit = { id: string; name: string; title: string; image: string; alt: string; text: string; items: KitItem[] };

const item = (kit: string, n: number, name: string, features: string[], product?: string): KitItem => ({ name, features, image: `/kits/${kit}-${n}.webp`, product });

export const brandKits: BrandKit[] = [
  {
    id: "fashion",
    name: "Fashion Brands",
    title: "Complete clothing packaging",
    image: "/kits/fashion.webp",
    alt: "Clothing packaging kit for a fashion brand: woven labels, hang tags, zipper bags, tissue paper and ribbons",
    text: "From the label stitched into the collar to the bag the garment ships in. One palette, one logo, matched across thread, paper and film.",
    items: [
      item("fashion", 2, "Premium Woven Labels", ["HD weaving", "Soft touch", "Custom design"], "woven-labels"),
      item("fashion", 3, "Luxury Hang Tags", ["Premium board", "Cotton string", "Eyelet finish"]),
      item("fashion", 4, "Premium Zipper Bags", ["Frosted look", "Durable material", "Custom printing"], "zippers"),
      item("fashion", 5, "Custom Tissue Paper", ["Premium paper", "Custom print", "Elegant finish"]),
      item("fashion", 6, "Premium Ribbons", ["Luxury satin", "Fine grosgrain", "Custom printing"], "ribbons"),
    ],
  },
  {
    id: "jewellery",
    name: "Jewellery Brands",
    title: "Complete jewellery packaging",
    image: "/kits/jewellery.webp",
    alt: "Jewellery packaging kit: velvet pouches, hang tags, small rigid boxes, thank you cards and ribbons",
    text: "Small pieces deserve a slow reveal. Velvet pouches, rigid boxes, foil tags, ribbon and a card, made to feel as considered as what is inside.",
    items: [
      item("jewellery", 2, "Premium Velvet Pouches", ["Rich velvet", "Soft drawstring", "Custom design"], "pouches"),
      item("jewellery", 3, "Luxury Hang Tags", ["Premium board", "Metallic foil", "Eyelet finish"]),
      item("jewellery", 4, "Small Rigid Boxes", ["Rigid board", "Velvet insert", "Gold foil logo"]),
      item("jewellery", 5, "Thank You Cards", ["Premium paper", "Gold foil", "Elegant finish"], "thank-you-cards"),
      item("jewellery", 6, "Premium Ribbons", ["Luxury satin", "Fine grosgrain", "Custom printing"], "ribbons"),
    ],
  },
  {
    id: "cafe",
    name: "Cafés & Food",
    title: "Complete café packaging",
    image: "/kits/cafe.webp",
    alt: "Café packaging kit: paper bags, beverage cups, takeaway food boxes, menu cards and branded napkins",
    text: "Packaging that looks good on the counter and on the way home. Cups, boxes and bags for takeaway, and print for the table.",
    items: [
      item("cafe", 2, "Premium Paper Bags", ["Strong handles", "Kraft and coloured", "Custom design"], "shopping-bags"),
      item("cafe", 3, "Luxury Beverage Cups", ["Double wall", "Secure lids", "Custom sleeves"]),
      item("cafe", 4, "Takeaway Food Boxes", ["Eco-friendly", "Grease resistant", "Gold foil logo"]),
      item("cafe", 5, "Menu Cards", ["Premium board", "Gold foil", "Custom size"], "flyers"),
      item("cafe", 6, "Branded Accessories", ["Soft tissue", "Biodegradable", "Custom embossing"]),
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    title: "Complete beauty packaging",
    image: "/kits/beauty.webp",
    alt: "Beauty packaging kit: paper bags, cosmetic boxes, serum and dropper boxes, thank you cards and stickers",
    text: "Calm colours and tactile finishes for products people use every day. Boxes sized to each bottle, bags for the counter, and seals that close every order.",
    items: [
      item("beauty", 2, "Premium Paper Bags", ["Strong handles", "Kraft and coloured", "Custom design"], "shopping-bags"),
      item("beauty", 3, "Luxury Cosmetic Boxes", ["Heavy board", "Vibrant print", "Gold foil details"]),
      item("beauty", 4, "Serum & Dropper Boxes", ["Rigid inserts", "Custom printing", "Gold foil logo"]),
      item("beauty", 5, "Thank You Cards", ["Premium board", "Gold foil", "Custom size"], "thank-you-cards"),
      item("beauty", 6, "Branded Stickers", ["Waterproof", "Matte and glossy", "Custom die-cut"], "stickers"),
    ],
  },
];

export const getKit = (id: string) => brandKits.find((k) => k.id === id);

export const ribbonUses = ["Packaging", "Gift Wrapping", "Fashion", "Events", "Branding"];

// Fictional demonstration projects — not real clients.
export const portfolio = [
  { id: "maison-aurelia", name: "Maison Aurélia", category: "Luxury Fashion", product: "Shopping Bag • Ribbon • Card • Labels • Tissue", finish: "Gold Foil • Soft Touch", text: "A burgundy retail suite, from the bag to the care label, where gold foil is the only thing that catches light.", ratio: "4 / 5", photo: "/images/portfolio-maison-aurelia-photo.webp" },
  { id: "nocturne-jewellers", name: "Nocturne Jewellers", category: "Fine Jewellery", product: "Shopping Bag • Ribbon Handles", finish: "Gold Foil • Matte Black", text: "A matte black bag with a gold foil crest and satin ribbon handles, made to be carried out of the boutique.", ratio: "4 / 5", photo: "/images/portfolio-nocturne-jewellers-photo.webp" },
  { id: "aurelia-vendome", name: "Aurelia Vendôme", category: "Fine Jewellery", product: "Ring Box • Shopping Bag • Certificate • Business Card", finish: "Gold Foil • Velvet", text: "Charcoal velvet ring boxes, a foil-stamped bag and a gold-edged certificate card for a Paris fine jewellery house.", ratio: "2000 / 1116", photo: "/images/portfolio-aurelia-vendome-photo.webp" },
  { id: "sartor-rowe", name: "Sartor & Rowe", category: "Retail", product: "Tote Bag", finish: "Screen Print • Natural Canvas", text: "Natural canvas totes screen-printed in navy and checked by hand as they come off the press.", ratio: "4 / 5", photo: "/images/portfolio-sartor-rowe-photo.webp" },
  { id: "maison-aurelia-labels", name: "Maison Aurélia", category: "Luxury Fashion", product: "Woven Label • Care Label", finish: "Gold Thread • Satin", text: "Woven brand labels and satin care labels for the same house, sorted and inspected by hand before packing.", ratio: "4 / 5", photo: "/images/portfolio-maison-aurelia-labels-photo.webp" },
  { id: "maison-dauphine", name: "Maison Dauphine", category: "Luxury Fashion", product: "Printed Ribbon", finish: "Gold Foil • Satin", text: "Forest-green satin ribbon foil-printed with the house name, measured and checked by hand in the workshop.", ratio: "4 / 5", photo: "/images/portfolio-maison-dauphine-photo.webp" },
  { id: "element-atelier", name: "Élément Atelier", category: "E-commerce", product: "Thank You Card • Envelope", finish: "Letterpress • Cotton Stock", text: "Letterpress thank-you cards on textured cotton stock, paired with kraft envelopes for every order.", ratio: "4 / 5", photo: "/images/portfolio-element-atelier-photo.webp" },
  { id: "kura-monogram", name: "Kura Monogram", category: "Lifestyle", product: "Tote Bag", finish: "White Screen Print • Black Canvas", text: "A black canvas tote with a bold white monogram, printed edge-sharp on heavy cotton.", ratio: "4 / 5", photo: "/images/portfolio-kura-monogram-photo.webp" },
  { id: "aurelia-vendome-bag", name: "Aurelia Vendôme", category: "Fine Jewellery", product: "Shopping Bag", finish: "Gold Foil • Grosgrain Handles", text: "The house carrier bag on its own: charcoal board, a small gold foil monogram and grosgrain handles.", ratio: "2000 / 1091", photo: "/images/portfolio-aurelia-vendome-bag-photo.webp" },
  { id: "forma-skin", name: "Forma Skin", category: "Beauty", product: "Pouch • Card", finish: "Matte • Deboss", text: "Blush board and terracotta ink for a skincare line that wanted to feel warm, not clinical.", ratio: "1 / 1" },
  { id: "roast-and-ritual", name: "Roast & Ritual", category: "Food", product: "Stand-up Pouch • Stickers", finish: "Kraft • Matte", text: "Kraft pouches with a deep green label, designed to look right beside the grinder.", ratio: "4 / 5" },
  { id: "northline", name: "Northline", category: "Lifestyle", product: "Bag • Woven Label", finish: "Matte • Emboss", text: "One cobalt blue, held consistently across paper and thread.", ratio: "4 / 3" },
  { id: "atelier-27", name: "Atelier 27", category: "Fashion", product: "Woven Label • Care Label • Tag", finish: "High-density Weave", text: "A full trim set for a small studio: neck label, care label and a moulded hang tag.", ratio: "1 / 1" },
  { id: "velora", name: "Velora", category: "E-commerce", product: "Mailer Box • Card • Sticker", finish: "Soft Touch • Gloss", text: "An unboxing built for the doorstep, with a card and seal in every order.", ratio: "4 / 5" },
].map((p) => ({ ...p, image: p.photo ?? `/images/portfolio-${p.id}.webp` }));

// PLACEHOLDER testimonials — sample content to be replaced with real client quotes before launch.
// Ratings are out of 5, in half-star steps.
export const testimonials = [
  { quote: "Heritage Shapes transformed our packaging from ordinary to something customers actually remembered.", name: "Sarah M.", role: "Founder", company: "Fashion label", rating: 5 },
  { quote: "The sample arrived looking exactly like the render. The production run looked exactly like the sample.", name: "Daniel R.", role: "Operations Lead", company: "Skincare brand", rating: 5 },
  { quote: "We came for boxes and left with labels, ribbon and cards that finally look like one brand.", name: "Amna K.", role: "Creative Director", company: "Online boutique", rating: 4.5 },
  { quote: "Our woven labels are sharp even at the smallest size. Customers comment on them, which never happened before.", name: "Bilal H.", role: "Founder", company: "Streetwear brand", rating: 5 },
  { quote: "Clear timelines and honest updates. One shipment slipped by a few days, but they told us early and sorted it.", name: "Megan W.", role: "Buyer", company: "Home goods store", rating: 4 },
  { quote: "The foil on our jewellery bags is perfect. It feels like a much bigger house than we are.", name: "Hira S.", role: "Owner", company: "Jewellery studio", rating: 5 },
  { quote: "Butter paper, cups and bags all in one order, all in our green. The café finally looks finished.", name: "Tyler B.", role: "Co-founder", company: "Café", rating: 4.5 },
  { quote: "Good quality and fair pricing for short runs. A couple of revisions on the dieline, but the result was worth it.", name: "James T.", role: "Brand Manager", company: "Candle company", rating: 4 },
];

// PLACEHOLDER — fill in your real Trustpilot profile link and figures; leave `url` empty to hide the badge.
export const trustpilot = { url: "", reviews: 123 };

// PLACEHOLDER answers — edit to match your actual terms.
export const faqs = [
  { q: "Do you offer custom packaging?", a: "Yes. Every order is made to your specification: size, structure, material, print and finish. Nothing we produce is a stock item with a logo added." },
  { q: "What is the minimum order quantity?", a: "It depends on the product. Stickers and cards start low, while moulded or woven items need a larger run to be economical. Each product page lists a starting quantity, and we will confirm it in your quote." },
  { q: "Can I request a sample?", a: "Yes. We make a physical sample for approval before full production, so you can check size, colour and finish on the real object." },
  { q: "What printing finishes are available?", a: "Matte, gloss, soft touch, embossing, debossing, hot foil, spot UV and die cutting. Finishes can be combined, and we will advise which suit your material." },
  { q: "Do you provide international shipping?", a: "Yes. We ship internationally and pack each order for the journey. Shipping cost and transit time are included in your quotation." },
  { q: "Can you produce custom sizes?", a: "Yes. Send us your product dimensions and we will build the dieline around it." },
  { q: "Can I provide my own artwork?", a: "Yes. Print-ready PDF or AI files are ideal. If you only have a logo, we can prepare the artwork on our dieline for your approval." },
  { q: "How do I request a quotation?", a: "Use the quote builder on this site, or message us on WhatsApp or email with the product, quantity and any reference images. We reply with pricing and a timeline." },
];

// Shipping lanes drawn on the world map (longitude / latitude).
export const origin = { label: "Pakistan", role: "Production", lon: 72, lat: 31 };
// `role` adds a second line under the label: operations are run from the UK, materials are sourced in China.
export const routes = [
  { label: "United Kingdom", role: "Operations", lon: -1.5, lat: 52.5, dx: -10, dy: 15, anchor: "end" },
  { label: "Europe", lon: 14, lat: 47, dx: 10, dy: 16, anchor: "start" },
  { label: "UAE", lon: 54.4, lat: 24.4, dx: 2, dy: 18, anchor: "end" },
  { label: "Saudi Arabia", lon: 45, lat: 24, dx: -9, dy: 4, anchor: "end" },
  { label: "USA", lon: -96, lat: 38, dx: 0, dy: 19, anchor: "middle" },
  { label: "Canada", lon: -104, lat: 56, dx: 0, dy: -11, anchor: "middle" },
  { label: "China", role: "Sourcing", lon: 120, lat: 30, dx: 9, dy: 2, anchor: "start" },
  { label: "Japan", lon: 139, lat: 36, dx: 9, dy: 4, anchor: "start" },
  { label: "Singapore", lon: 103.8, lat: 1.4, dx: -9, dy: 4, anchor: "end" },
  { label: "Australia", lon: 134, lat: -25, dx: 0, dy: 19, anchor: "middle" },
] as const;
