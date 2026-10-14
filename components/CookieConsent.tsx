"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { buttonClass } from "./buttonStyles";

/*
 * Cookie consent. Google Analytics only loads after the visitor clicks Accept; until then,
 * and after Reject, no analytics cookies are set. The choice is remembered in this browser.
 */

const KEY = "hs-consent";
const REOPEN = "hs:cookie-settings";
const GA_ID = "G-ER4N63J9ED";
type Choice = "granted" | "denied";

const read = (): Choice | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

export function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = read();
    setChoice(saved);
    setOpen(saved === null);
    const reopen = () => setOpen(true);
    window.addEventListener(REOPEN, reopen);
    return () => window.removeEventListener(REOPEN, reopen);
  }, []);

  const decide = (c: Choice) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    // Analytics that already loaded cannot be unloaded mid-visit; tell it to stop and refresh.
    if (choice === "granted" && c === "denied") {
      (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
      document.cookie.split(";").forEach((ck) => {
        const name = ck.split("=")[0].trim();
        if (name.startsWith("_ga")) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./, "")}`;
      });
    }
    setChoice(c);
    setOpen(false);
  };

  const analytics = process.env.NODE_ENV === "production" && choice === "granted";

  return (
    <>
      {analytics && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
      {open && (
        <div role="dialog" aria-live="polite" aria-label="Cookie choices" className="keep-motion fixed inset-x-3 bottom-3 z-[120] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md">
          <div className="glass rounded-[1.5rem] border border-line p-5 text-sm shadow-[0_30px_80px_-30px_rgba(0,0,0,.45)]">
            <p className="font-medium text-ink">
              Cookies <span aria-hidden="true">🍪</span>
            </p>
            <p className="mt-1.5 leading-relaxed text-muted">
              We use cookies to run the site and, if you agree, to understand how visitors use it.{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-ink">
                Privacy policy
              </Link>
              .
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => decide("granted")} className={buttonClass("brand", "min-h-10 flex-1 py-2")}>
                Accept
              </button>
              <button type="button" onClick={() => decide("denied")} className={buttonClass("outline", "min-h-10 flex-1 py-2")}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** A link that reopens the cookie banner, for the footer and the privacy policy. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(REOPEN))} className={className}>
      Cookie settings
    </button>
  );
}
