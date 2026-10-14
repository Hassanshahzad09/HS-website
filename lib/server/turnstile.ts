import "server-only";

/**
 * Checks a Cloudflare Turnstile token with Cloudflare. When no secret key is configured the
 * check is switched off and every request passes, so the site works before the keys are added.
 */
export async function verifyTurnstile(token: unknown, req: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim();
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8_000) });
    const out = await res.json();
    return out?.success === true;
  } catch {
    // If Cloudflare cannot be reached, fail closed: free previews cost real money.
    return false;
  }
}
