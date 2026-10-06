import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { Providers } from "@/components/Providers";
import { site } from "@/data/site";
// Self-hosted fonts (no request to Google at build or run time).
import "@fontsource-variable/inter-tight";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/500.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  keywords: ["custom packaging", "shopping bags", "pouches", "woven labels", "DTF stickers", "UV DTF", "printing", "branded products"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Heritage Shapes — Where Packaging Meets Legacy" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og.png"] },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
};

// Runs before paint: applies the saved theme and skips the preloader on repeat visits.
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('hs-theme');if(t!=='dark')t='light';d.dataset.theme=t;if(sessionStorage.getItem('hs-loaded'))d.dataset.loaded='1'}catch(e){d.dataset.theme='light'}})()`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/logo-mark.svg`,
  slogan: site.tagline,
  description: site.description,
  email: site.email,
  sameAs: site.social.map((s) => s.href),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      </head>
      <body>
        <Providers>
          <Preloader />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <MobileCTA />
        </Providers>
      </body>
    </html>
  );
}
