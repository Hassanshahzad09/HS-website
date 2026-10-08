"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/site";
import { useStoredList, WISHLIST_KEY } from "@/lib/storage";
import { cn, EASE } from "@/lib/utils";
import { Arrow, buttonClass } from "./Button";
import { Logo } from "./Logo";
import { SearchOverlay } from "./SearchOverlay";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { list: saved } = useStoredList(WISHLIST_KEY);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ctrl/Cmd+K or "/" opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-bg">
        Skip to content
      </a>
      {/* Full-width and clear at the top of the page; on scroll it eases into a floating glass capsule. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[80]">
        <div
          className={cn(
            "keep-motion pointer-events-auto mx-auto flex items-center justify-between gap-6 rounded-full border transition-all duration-[900ms] ease-[var(--ease-expo)]",
            scrolled || menu
              ? "mt-3 h-[3.75rem] w-[calc(100%-1.5rem)] max-w-[1180px] border-line bg-[color-mix(in_srgb,var(--glass)_70%,transparent)] px-3 shadow-[0_18px_50px_-24px_rgba(0,0,0,.4),inset_0_1px_0_rgba(255,255,255,.35)] backdrop-blur-xl backdrop-saturate-150 sm:pl-6 sm:pr-2.5"
              : "mt-0 h-[4.5rem] w-full max-w-[1480px] border-transparent bg-transparent px-[clamp(1.25rem,4vw,4rem)] shadow-none",
          )}
        >
          <Link href="/" aria-label="Heritage Shapes — home" className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-sm">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={cn("link-underline py-2 transition-colors hover:text-ink", isActive(item.href) ? "text-ink" : "text-muted")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setSearch(true)} aria-label="Search products" className="grid size-11 place-items-center rounded-full glass-btn hover:text-brand">
              <Search className="size-[18px]" />
            </button>
            <Link href="/products?saved=1" aria-label={`Saved products (${saved.length})`} className="relative hidden size-11 place-items-center rounded-full glass-btn hover:text-brand sm:grid">
              <Heart className="size-[18px]" />
              {saved.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-brand text-[10px] font-semibold text-onbrand">{saved.length}</span>}
            </Link>
            <ThemeToggle />
            <span className="ml-1 hidden md:block">
              <Link href="/quote" data-cursor="QUOTE" className={buttonClass("primary")}>
                Get a Quote <Arrow />
              </Link>
            </span>
            <button type="button" onClick={() => setMenu((m) => !m)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-menu" className="grid size-11 place-items-center rounded-full glass-btn lg:hidden">
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[70] flex flex-col bg-bg px-6 pb-8 pt-28 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <li key={item.label} className="overflow-hidden">
                    <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.12 + i * 0.06, duration: 0.7, ease: EASE }}>
                      <Link href={item.href} onClick={() => setMenu(false)} className="display flex items-baseline gap-4 py-2 text-[clamp(2rem,9vw,3.2rem)]">
                        <span className="eyebrow w-6">0{i + 1}</span>
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div className="mt-auto space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Link href="/quote" onClick={() => setMenu(false)} className={buttonClass("brand", "w-full")}>
                Get a Quote <Arrow />
              </Link>
              <div className="flex justify-between text-sm text-muted">
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <a href={site.whatsapp.href} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
