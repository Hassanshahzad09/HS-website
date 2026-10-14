// Cloudflare Turnstile bot check, run invisibly before a visitor's free AI Studio design.
// Without a site key configured it does nothing and returns null.

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
let ready: Promise<Turnstile> | null = null;
let widget: string | null = null;
let pending: ((token: string | null) => void) | null = null;

function load(): Promise<Turnstile> {
  ready ??= new Promise((resolve, reject) => {
    const w = window as unknown as { turnstile?: Turnstile; onTurnstileLoad?: () => void };
    if (w.turnstile) return resolve(w.turnstile);
    w.onTurnstileLoad = () => resolve(w.turnstile!);
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
    s.async = true;
    s.onerror = () => {
      ready = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return ready;
}

/** A fresh one-time token proving a person is using the page, or null when the check is not set up or fails. */
export async function turnstileToken(): Promise<string | null> {
  if (!SITE_KEY) return null;
  try {
    const ts = await load();
    if (!widget) {
      const box = document.createElement("div");
      box.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:130";
      document.body.appendChild(box);
      widget = ts.render(box, {
        sitekey: SITE_KEY,
        execution: "execute",
        appearance: "interaction-only",
        callback: (t: string) => pending?.(t),
        "error-callback": () => pending?.(null),
        "expired-callback": () => pending?.(null),
      });
    } else ts.reset(widget);
    return await new Promise<string | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 30_000);
      pending = (t) => {
        clearTimeout(timer);
        pending = null;
        resolve(t);
      };
      ts.execute(widget!);
    });
  } catch {
    return null;
  }
}
