import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Kept free of "use client" so server components can style plain links as buttons.

export const VARIANTS = {
  primary: "glass-btn [--gb:color-mix(in_srgb,var(--ink)_80%,transparent)] text-bg hover:[--gb:color-mix(in_srgb,var(--brand)_82%,transparent)] hover:text-onbrand",
  brand: "glass-btn [--gb:color-mix(in_srgb,var(--brand)_82%,transparent)] text-onbrand hover:[--gb:color-mix(in_srgb,var(--ink)_80%,transparent)] hover:text-bg",
  outline: "glass-btn text-ink hover:[--gb:color-mix(in_srgb,var(--surface)_64%,transparent)]",
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
