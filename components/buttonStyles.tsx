import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Kept free of "use client" so server components can style plain links as buttons.

export const VARIANTS = {
  primary: "bg-ink text-bg hover:bg-brand hover:text-onbrand",
  brand: "bg-brand text-onbrand hover:bg-ink hover:text-bg",
  outline: "border border-line text-ink hover:border-ink",
  ghost: "text-ink hover:text-brand px-0!",
} as const;

export const buttonClass = (variant: keyof typeof VARIANTS = "primary", className?: string) =>
  cn(
    "group relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-tight transition-colors duration-300 disabled:opacity-50",
    VARIANTS[variant],
    className,
  );

export const Arrow = () => (
  <ArrowUpRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
);
