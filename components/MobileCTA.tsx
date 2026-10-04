"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Arrow, buttonClass } from "./Button";

/** Sticky bottom call-to-action on phones, shown once the hero is scrolled past. */
export function MobileCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Hidden while a form (quote builder, contact) is on screen so it never covers their buttons.
    const overForm = () =>
      ["quote", "contact"].some((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect();
        return r ? r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4 : false;
      });
    const onScroll = () => setShow(window.scrollY > 500 && !overForm());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname.startsWith("/quote")) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }} transition={{ duration: 0.4 }}>
          <Link href="/quote" className={buttonClass("brand", "w-full shadow-xl shadow-black/20")}>
            Request a Quote <Arrow />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
