"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("hs-theme", next);
    } catch {}
    window.setTimeout(() => root.classList.remove("theme-transition"), 600);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("relative grid size-11 place-items-center overflow-hidden rounded-full border border-line transition-colors hover:border-ink", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme ?? "none"} initial={{ y: 14, opacity: 0, rotate: -40 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: -14, opacity: 0, rotate: 40 }} transition={{ duration: 0.25 }}>
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
