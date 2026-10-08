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
  { label: "About", href: "/#about" },
  { label: "Process", href: "/#process" },
  { label: "Contact", href: "/#contact" },
];

/** PLACEHOLDER figures — edit freely. */
export const stats = [
  { value: 10, suffix: "+", label: "Custom Products" },
  { value: 250, suffix: "+", label: "Projects Delivered" },
  { value: 8, suffix: "", label: "Finishing Options" },
  { value: 4, suffix: "", label: "Regions Reached" },
];

export const benefits = [
  { icon: "shapes", title: "Custom Solutions", text: "Nothing off the shelf. Size, structure and material are drawn around your product." },
  { icon: "sparkles", title: "Premium Finishes", text: "Foil, emboss, soft touch and spot UV, layered with a designer's restraint." },
  { icon: "scan", title: "Quality Focus", text: "Every run is checked against the approved sample before it is packed." },
  { icon: "layers", title: "Flexible Quantities", text: "Short runs for a launch, larger runs when it works. We size the order to you." },
  { icon: "factory", title: "Reliable Production", text: "Clear timelines, agreed up front, with updates at each stage." },
  { icon: "globe", title: "International Shipping", text: "Packed for the journey and shipped to brands across borders." },
] as const;

export const process = [
  { n: "01", title: "Discover", text: "We learn the product, the customer and the moment the packaging has to win." },
  { n: "02", title: "Design", text: "Structure, material and finish are specified, with dielines ready for your artwork." },
  { n: "03", title: "Sample", text: "You hold a physical sample before anything goes to full production." },
  { n: "04", title: "Produce", text: "The approved sample becomes the standard every piece is made to." },
  { n: "05", title: "Deliver", text: "Checked, packed and shipped to your door, wherever that is." },
];

// Complete branding kits by industry. `items` are product slugs from data/products.ts.
export const brandKits = [
  {
    id: "fashion",
    name: "Fashion Brands",
    title: "Fashion brand kit",
    image: "/mockups/set-branded.webp",
    alt: "Fashion branding kit: shopping bags, gift box, hang tag, woven label and printed cards",
    text: "From the label stitched into the collar to the bag that leaves the store. One palette, one logo, matched across thread, paper and fabric.",
    items: ["woven-labels", "care-labels", "shopping-bags", "tote-bags", "ribbons", "thank-you-cards"],
  },
  {
    id: "jewellery",
    name: "Jewellery Brands",
    title: "Jewellery brand kit",
    image: "/products/photo/shopping-bags-foil.webp",
    alt: "Black jewellery shopping bag with a gold foil crest and ribbon handles",
    text: "Small pieces deserve a slow reveal. Foil-stamped bags, soft pouches, ribbon and a card, made to feel as considered as what is inside.",
    items: ["shopping-bags", "pouches", "ribbons", "thank-you-cards", "stickers"],
  },
  {
    id: "food",
    name: "Food Brands",
    title: "Food brand kit",
    image: "/products/photo/tote-bags-colour.webp",
    alt: "Canvas tote bag printed with a full-colour citrus illustration",
    text: "Packaging that looks good on the counter and on the way home. Seals and labels for every pack, bags for takeaway, and print for the table.",
    items: ["stickers", "shopping-bags", "tote-bags", "flyers", "thank-you-cards"],
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    title: "Beauty and skincare kit",
    image: "/products/photo/shopping-bags-deboss.webp",
    alt: "Sage green shopping bag with a debossed crest for a botanical apothecary",
    text: "Calm colours and tactile finishes for products people use every day. Debossed bags, pouches for gifting, and seals that close every order.",
    items: ["shopping-bags", "pouches", "stickers", "ribbons", "thank-you-cards"],
  },
];

export const labelTypes = [
  { name: "Woven Labels", slug: "woven-labels", image: "/products/photo/woven-labels-1.webp", text: "Thread by thread. Lettering that stays sharp at a few millimetres tall." },
  { name: "Care Labels", slug: "care-labels", image: "/products/photo/care-labels-1.webp", text: "Soft satin, wash-fast ink, and the information your garment needs." },
];

export const ribbonUses = ["Packaging", "Gift Wrapping", "Fashion", "Events", "Branding"];

// Fictional demonstration projects — not real clients.
export const portfolio = [
  { id: "maison-aurelia", name: "Maison Aurélia", category: "Luxury Fashion", product: "Shopping Bag • Ribbon • Card • Labels • Tissue", finish: "Gold Foil • Soft Touch", text: "A burgundy retail suite, from the bag to the care label, where gold foil is the only thing that catches light.", ratio: "4 / 5", photo: "/images/portfolio-maison-aurelia-photo.webp" },
  { id: "forma-skin", name: "Forma Skin", category: "Beauty", product: "Pouch • Card", finish: "Matte • Deboss", text: "Blush board and terracotta ink for a skincare line that wanted to feel warm, not clinical.", ratio: "1 / 1" },
  { id: "roast-and-ritual", name: "Roast & Ritual", category: "Food", product: "Stand-up Pouch • Stickers", finish: "Kraft • Matte", text: "Kraft pouches with a deep green label, designed to look right beside the grinder.", ratio: "4 / 5" },
  { id: "northline", name: "Northline", category: "Lifestyle", product: "Bag • Woven Label", finish: "Matte • Emboss", text: "One cobalt blue, held consistently across paper and thread.", ratio: "4 / 3" },
  { id: "atelier-27", name: "Atelier 27", category: "Fashion", product: "Woven Label • Care Label • Tag", finish: "High-density Weave", text: "A full trim set for a small studio: neck label, care label and a moulded hang tag.", ratio: "1 / 1" },
  { id: "velora", name: "Velora", category: "E-commerce", product: "Mailer Box • Card • Sticker", finish: "Soft Touch • Gloss", text: "An unboxing built for the doorstep, with a card and seal in every order.", ratio: "4 / 5" },
].map((p) => ({ ...p, image: p.photo ?? `/images/portfolio-${p.id}.webp` }));

// PLACEHOLDER testimonials — sample content to be replaced with real client quotes.
export const testimonials = [
  { quote: "Heritage Shapes transformed our packaging from ordinary to something customers actually remembered.", name: "Sara M.", role: "Founder", company: "Fashion label" },
  { quote: "The sample arrived looking exactly like the render. The production run looked exactly like the sample.", name: "Daniel R.", role: "Operations Lead", company: "Skincare brand" },
  { quote: "We came for boxes and left with labels, ribbon and cards that finally look like one brand.", name: "Amna K.", role: "Creative Director", company: "Online boutique" },
];

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
export const origin = { label: "Pakistan", lon: 72, lat: 31 };
export const routes = [
  { label: "United Kingdom", lon: -1.5, lat: 52.5, dx: -10, dy: -12, anchor: "end" },
  { label: "Europe", lon: 14, lat: 47, dx: 10, dy: 16, anchor: "start" },
  { label: "UAE", lon: 54.4, lat: 24.4, dx: -10, dy: 18, anchor: "end" },
  { label: "USA", lon: -77, lat: 39, dx: 0, dy: -14, anchor: "middle" },
] as const;
