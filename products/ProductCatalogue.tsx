"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { categories, products, searchProducts, type CategoryId } from "@/data/products";
import { useStoredList, WISHLIST_KEY } from "@/lib/storage";
import { cn, EASE } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type Filter = "all" | "saved" | CategoryId;

/**
 * Filterable product grid. On the home page it becomes a swipeable carousel
 * on phones (`carousel`); on /products it adds search and a saved filter.
 */
export function ProductCatalogue({ carousel = false, withSearch = false }: { carousel?: boolean; withSearch?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { list: saved } = useStoredList(WISHLIST_KEY);

  // Deep links: /products?category=labels, /products?saved=1
  useEffect(() => {
    if (!withSearch) return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (params.get("saved")) setFilter("saved");
    else if (cat && categories.some((c) => c.id === cat)) setFilter(cat as CategoryId);
  }, [withSearch]);

  const tabs: { id: Filter; name: string }[] = [
    { id: "all", name: "All" },
    ...categories.map((c) => ({ id: c.id as Filter, name: c.name })),
    ...(withSearch && (saved.length > 0 || filter === "saved") ? [{ id: "saved" as Filter, name: `Saved (${saved.length})` }] : []),
  ];

  const shown = useMemo(() => {
    const base = query.trim() ? searchProducts(query) : products;
    if (filter === "all") return base;
    if (filter === "saved") return base.filter((p) => saved.includes(p.slug));
    return base.filter((p) => p.category === filter);
  }, [filter, query, saved]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Product categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setFilter(t.id)}
                className={cn("relative shrink-0 rounded-full border px-4 py-2.5 text-sm transition-colors", active ? "border-transparent text-bg" : "border-line text-muted hover:border-ink hover:text-ink")}
              >
                {active && <motion.span layoutId={`filter-pill-${carousel ? "home" : "page"}`} className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{t.name}</span>
              </button>
            );
          })}
        </div>

        {withSearch && (
          <label className="flex h-12 w-full items-center gap-3 rounded-full border border-line px-4 focus-within:border-ink lg:w-80">
            <Search className="size-4 text-muted" aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
          </label>
        )}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? "product" : "products"}
      </p>

      <div
        className={cn(
          "mt-6",
          carousel
            ? "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-4 xl:gap-y-10"
            : "grid grid-cols-1 gap-x-6 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
              className={cn(carousel && "w-[78vw] shrink-0 snap-center sm:w-auto")}
            >
              <ProductCard product={p} compact={carousel} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {shown.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
          {filter === "saved" ? "Nothing saved yet. Tap the heart on any product to keep it here." : "No products match that search. Try “boxes”, “labels” or “stickers”."}
        </p>
      )}
    </div>
  );
}
