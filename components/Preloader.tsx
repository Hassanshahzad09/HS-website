"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "@/lib/utils";

const DURATION = 1500;

/** Shown once per browser session: logo draws in, a thin line fills, the page is revealed. */
export function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (document.documentElement.dataset.loaded) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem("hs-loaded", "1");
      } catch {}
      window.dispatchEvent(new Event("hs-ready"));
    }, DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.dataset.loaded = "1")}>
      {show && (
        <motion.div
          className="preloader fixed inset-0 z-[120] flex flex-col items-center justify-center gap-7 bg-bg"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
          role="status"
          aria-label="Loading Heritage Shapes"
        >
          <svg viewBox="0 0 741 568" fill="none" stroke="var(--brand)" strokeWidth={52} className="h-16 w-auto">
            <motion.path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeInOut" }} />
            <motion.path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, delay: 0.15, ease: "easeInOut" }} />
          </svg>
          <motion.span className="font-brand text-lg tracking-[0.2em]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
            Heritage Shapes
          </motion.span>
          <span className="h-px w-44 overflow-hidden bg-line">
            <motion.span className="block h-full origin-left bg-brand" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: DURATION / 1000 - 0.1, ease: "easeInOut" }} />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** True once the preloader has finished (immediately on repeat visits). */
export function useSiteReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (document.documentElement.dataset.loaded) {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener("hs-ready", on);
    const fallback = setTimeout(on, DURATION + 400);
    return () => {
      window.removeEventListener("hs-ready", on);
      clearTimeout(fallback);
    };
  }, []);
  return ready;
}
