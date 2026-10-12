"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { AiBadge } from "@/components/AiBadge";
import { buttonClass } from "@/components/buttonStyles";
import { Field } from "@/components/Field";
import { LogoMark } from "@/components/Logo";
import { isEmail } from "@/lib/enquiry";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn, EASE } from "@/lib/utils";

type Mode = "login" | "signup" | "reset" | "update";

const BENEFITS = ["Save designs to projects", "5 free AI Studio credits", "Full-size mockup downloads", "Track your quote requests"];

// Supabase's messages are written for developers; these are the ones a customer can hit.
const friendly = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again or reset your password.";
  if (m.includes("not confirmed")) return "Please confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("already registered")) return "An account with this email already exists. Log in instead.";
  if (m.includes("rate limit") || m.includes("security purposes")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("different from the old")) return "Choose a password you haven't used before.";
  return message;
};

/** Login / sign-up / password reset, backed by Supabase Auth. */
export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  // A reset link lands here: show the new-password form. Anyone already signed in goes to their account.
  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const recovering = window.location.hash.includes("type=recovery");
    if (recovering) setMode("update");
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    if (!recovering) {
      sb.auth.getSession().then(({ data: s }) => {
        if (s.session) router.replace("/account");
      });
    }
    return () => data.subscription.unsubscribe();
  }, [router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const go = (m: Mode) => {
    setMode(m);
    setErrors({});
    setNotice("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (mode === "signup" && !form.name.trim()) err.name = "Enter your name.";
    if (mode !== "update" && !isEmail(form.email)) err.email = "Enter a valid email address.";
    if (mode !== "reset" && form.password.length < 8) err.password = "Use at least 8 characters.";
    setErrors(err);
    if (Object.keys(err).length || busy) return;

    const sb = supabaseBrowser();
    if (!sb) return setNotice("Accounts aren't available right now. Please try again later.");
    setBusy(true);
    setNotice("");
    const email = form.email.trim().toLowerCase();
    const origin = window.location.origin;
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password: form.password });
        if (error) return setNotice(friendly(error.message));
        router.push("/account");
      } else if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password: form.password, options: { data: { full_name: form.name.trim() }, emailRedirectTo: `${origin}/account` } });
        if (error) return setNotice(friendly(error.message));
        if (data.session) router.push("/account");
        else if (data.user?.identities?.length === 0) setNotice("An account with this email already exists. Log in instead.");
        else setNotice(`Almost there. We sent a confirmation link to ${email}. Open it to activate your account.`);
      } else if (mode === "reset") {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/login` });
        if (error) return setNotice(friendly(error.message));
        setNotice("If an account exists for that email, a reset link is on its way.");
      } else {
        const { error } = await sb.auth.updateUser({ password: form.password });
        if (error) return setNotice(friendly(error.message));
        router.push("/account");
      }
    } catch {
      setNotice("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  // Google only works once the provider is switched on in Supabase, so ask before redirecting.
  const google = async () => {
    const sb = supabaseBrowser();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const off = () => setNotice("Google sign-in isn't switched on yet. Please use your email and password.");
    if (!sb || !url || !key) return off();
    try {
      const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } }).then((r) => r.json());
      if (!settings?.external?.google) return off();
      await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/account` } });
    } catch {
      off();
    }
  };

  const copy = {
    login: { title: "Welcome back", sub: "Log in to your designs, projects and quotes.", cta: "Log in" },
    signup: { title: "Create your account", sub: "Free to start. No card needed.", cta: "Create free account" },
    reset: { title: "Reset your password", sub: "We'll email you a link to set a new one.", cta: "Send reset link" },
    update: { title: "Choose a new password", sub: "Enter a new password for your account.", cta: "Save new password" },
  }[mode];

  return (
    <section className="relative overflow-hidden bg-bg pb-20 pt-28 lg:pt-32">
      <div className="blob -left-40 top-20 size-[32rem] bg-brand/20" aria-hidden="true" />
      <div className="container-x relative grid items-stretch gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        {/* Form */}
        <div className="mx-auto flex w-full max-w-md flex-col justify-center py-4">
          {(mode === "login" || mode === "signup") && (
            <div role="tablist" aria-label="Account" className="glass-btn mb-8 grid grid-cols-2 rounded-full p-1 active:scale-100">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} role="tab" type="button" aria-selected={mode === m} onClick={() => go(m)} className={cn("relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors", mode === m ? "text-bg" : "text-muted hover:text-ink")}>
                  {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{m === "login" ? "Log in" : "Sign up"}</span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              <h1 className="display text-[clamp(2rem,4vw,3rem)]">{copy.title}</h1>
              <p className="mt-2 text-muted">{copy.sub}</p>

              {(mode === "login" || mode === "signup") && (
                <>
                  <button type="button" onClick={google} className={buttonClass("outline", "mt-7 w-full")}>
                    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    Continue with Google
                  </button>
                  <p className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-muted">
                    <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
                  </p>
                </>
              )}

              <form onSubmit={submit} noValidate className={cn("space-y-4", (mode === "reset" || mode === "update") && "mt-7")}>
                {mode === "signup" && <Field id="name" label="Full name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} placeholder="Your name" />}
                {mode !== "update" && <Field id="email" label="Work email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@brand.com" />}
                {mode !== "reset" && (
                  <div className="relative">
                    <Field id="password" label={mode === "update" ? "New password" : "Password"} type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={set("password")} error={errors.password} placeholder="At least 8 characters" className="pr-12" />
                    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-[2.35rem] grid size-9 place-items-center rounded-full text-muted hover:text-ink">
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                )}
                {mode === "login" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-muted">
                      <input type="checkbox" className="size-4 accent-[var(--brand)]" /> Remember me
                    </label>
                    <button type="button" onClick={() => go("reset")} className="link-underline">
                      Forgot password?
                    </button>
                  </div>
                )}
                <button type="submit" disabled={busy} aria-busy={busy} className={buttonClass("brand", "w-full disabled:opacity-60")}>
                  {busy ? "Please wait…" : copy.cta}
                </button>
              </form>

              {notice && (
                <p role="status" className="mt-4 flex items-start gap-2 rounded-2xl bg-bg2 p-4 text-sm text-muted">
                  <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /> {notice}
                </p>
              )}

              <p className="mt-6 text-center text-sm text-muted">
                {mode === "login" && (
                  <>
                    New here?{" "}
                    <button type="button" onClick={() => go("signup")} className="link-underline text-ink">
                      Create a free account
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => go("login")} className="link-underline text-ink">
                      Log in
                    </button>
                  </>
                )}
                {mode === "reset" && (
                  <button type="button" onClick={() => go("login")} className="link-underline text-ink">
                    ← Back to log in
                  </button>
                )}
              </p>
              {mode === "signup" && <p className="mt-4 text-center text-xs text-muted">By creating an account you agree to our terms and privacy policy.</p>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Brand panel */}
        <div className="relative hidden min-h-[40rem] overflow-hidden rounded-[2rem] lg:block">
          <Image src="/products/photo/shopping-bags-foil.webp" alt="Black shopping bag with a gold foil crest" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
            <Link href="/" className="inline-flex items-center gap-3 self-start" aria-label="Heritage Shapes — home">
              <LogoMark className="h-7 w-auto" />
              <span className="font-brand tracking-[0.14em]">Heritage Shapes</span>
            </Link>
            <div>
              <AiBadge className="text-xs" />
              <p className="display mt-4 max-w-md text-4xl">See it on your brand. Get it made.</p>
              <ul className="mt-6 space-y-2.5 text-white/90">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="grid size-5 place-items-center rounded-full bg-white/20">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
