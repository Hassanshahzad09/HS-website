"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Desktop-only follower. Any element with `data-cursor="VIEW"` (or EXPLORE,
 * QUOTE, DRAG, DISCOVER…) expands it and shows that word.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      setLabel(el?.getAttribute("data-cursor") ?? "");
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[110]" style={{ x: sx, y: sy }} aria-hidden="true">
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-[0.62rem] font-semibold tracking-[0.18em] text-onbrand"
        animate={{ width: label ? 84 : 10, height: label ? 84 : 10, opacity: visible ? (label ? 0.96 : 0.7) : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}
