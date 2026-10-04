"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { MouseEvent } from "react";
import { categoryName, type Product } from "@/data/products";
import { useStoredList, WISHLIST_KEY } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const { list, toggle } = useStoredList(WISHLIST_KEY);
  const saved = list.includes(product.slug);

  // Subtle 3D tilt toward the pointer.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 7);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const href = `/products/${product.slug}`;

  return (
    <motion.article className={cn("group relative", className)} style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }} onMouseMove={onMove} onMouseLeave={reset}>
      <Link
        href={href}
        data-cursor="EXPLORE"
        aria-label={`Explore ${product.name}`}
        className="relative block aspect-square overflow-hidden rounded-[1.75rem] border border-line bg-bg2 transition-[border-color,box-shadow] duration-500 group-hover:border-brand group-hover:shadow-[0_24px_60px_-30px_var(--brand)]"
      >
        <Image
          src={product.image}
          alt={`${product.name} — ${product.shortDescription}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 78vw"
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-expo)] group-hover:rotate-[0.8deg] group-hover:scale-[1.08]"
        />
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em]">{categoryName(product.category)}</span>
        <span className="absolute bottom-3 right-3 grid size-11 translate-y-3 place-items-center rounded-full bg-brand text-onbrand opacity-0 transition-all duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </span>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product.slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
        className={cn("glass absolute right-3 top-3 grid size-10 place-items-center rounded-full transition-colors", saved ? "text-brand" : "text-ink hover:text-brand")}
      >
        <Heart className={cn("size-[17px]", saved && "fill-current")} />
      </button>

      <div className="px-1 pt-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-1">
        <h3 className="text-lg font-medium tracking-tight">
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{product.shortDescription}</p>
        <div className="mt-3 flex items-center gap-5 text-sm">
          <Link href={href} className="link-underline font-medium">
            Explore product →
          </Link>
          <Link href={`/quote?product=${product.slug}`} data-cursor="QUOTE" className="link-underline text-muted hover:text-ink">
            Request quote
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
