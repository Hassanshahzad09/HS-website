"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryName, products, searchProducts } from "@/data/products";
import { EASE } from "@/lib/utils";

const SUGGESTIONS = ["Labels", "Ribbons", "Stickers", "Bags", "Pouches"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchProducts(query), [query]);
  const shown = query.trim() ? results : products.filter((p) => p.featured);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] sm:p-8 sm:pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <button type="button" aria-label="Close search" className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl"
            initial={{ y: -24, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <form
              className="flex items-center gap-3 border-b border-line px-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) {
                  router.push(`/products/${results[0].slug}`);
                  onClose();
                }
              }}
            >
              <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-muted"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-bg2">
                <X className="size-5" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              {!query.trim() && (
                <div className="flex flex-wrap gap-2 px-2 pb-3 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-ink hover:text-ink">
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <p className="eyebrow px-2 pb-2 pt-1" aria-live="polite">
                {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Popular"}
              </p>
              {query.trim() && results.length === 0 ? (
                <div className="px-2 pb-6 pt-2 text-muted">
                  Nothing matches “{query}”. We make custom pieces too —{" "}
                  <Link href="/quote" onClick={onClose} className="text-ink underline underline-offset-4">
                    tell us what you need
                  </Link>
                  .
                </div>
              ) : (
                <ul>
                  {shown.map((p, i) => (
                    <motion.li key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.035, duration: 0.35 }}>
                      <Link href={`/products/${p.slug}`} onClick={onClose} className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-bg2 focus-visible:bg-bg2">
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-bg2">
                          <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.name}</span>
                          <span className="block text-sm text-muted">{categoryName(p.category)}</span>
                        </span>
                        <ArrowUpRight className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
