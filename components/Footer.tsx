import Link from "next/link";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { LogoMark } from "./Logo";
import { Newsletter } from "./Newsletter";

const columns = [
  {
    title: "Products",
    links: [...products.filter((p) => p.featured).map((p) => ({ label: p.name, href: `/products/${p.slug}` })), { label: "All products", href: "/products" }],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Process", href: "/#process" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Branding kits", href: "/#kits" },
      { label: "FAQ", href: "/faq" },
      { label: "Request a quote", href: "/quote" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-bg pb-28 pt-20 text-ink md:pb-10">
      <div className="blob -right-40 -top-40 size-[32rem] bg-brand/20" aria-hidden="true" />
      <div className="container-x relative">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Heritage Shapes — home">
              <LogoMark className="h-9 w-auto text-brand" />
              <span className="font-brand text-xl tracking-[0.14em]">Heritage Shapes</span>
            </Link>
            <p className="mt-6 font-serif text-3xl italic text-ink/90">{site.tagline}</p>
            <div className="mt-10 max-w-sm">
              <Newsletter />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="eyebrow mb-5">{col.title}</h3>
                <ul className="space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="link-underline text-ink/80 hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h3 className="eyebrow mb-5">Contact</h3>
              <ul className="space-y-3 text-sm text-ink/80">
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline break-all hover:text-ink">
                    {site.email}
                  </a>
                </li>
                <li>
                  <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="link-underline hover:text-ink">
                    WhatsApp {site.whatsapp.label}
                  </a>
                </li>
                <li>{site.location}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-line pt-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            {site.social.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noreferrer" className="link-underline hover:text-ink">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
