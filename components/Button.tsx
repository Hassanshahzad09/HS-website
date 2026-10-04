"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Arrow, buttonClass, type VARIANTS } from "./buttonStyles";

/** Pulls its child slightly toward the pointer. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span className={cn("inline-block", className)} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </motion.span>
  );
}

export { Arrow, buttonClass };

export function ButtonLink({
  href,
  children,
  variant = "primary",
  cursor,
  className,
  magnetic = true,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  cursor?: string;
  className?: string;
  magnetic?: boolean;
}) {
  const link = (
    <Link href={href} className={buttonClass(variant, className)} data-cursor={cursor}>
      {children}
      <Arrow />
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
