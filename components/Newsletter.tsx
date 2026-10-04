"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { isEmail, submitEnquiry } from "@/lib/enquiry";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setState("error");
    setState("busy");
    const res = await submitEnquiry({ type: "newsletter", email });
    setState(res.ok ? "done" : "error");
  };

  if (state === "done")
    return (
      <p className="flex items-center gap-2 text-sm" role="status">
        <Check className="size-4 text-brand" /> You&apos;re on the list. New work and finishes, a few times a year.
      </p>
    );

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="newsletter" className="eyebrow mb-3 block">
        Newsletter
      </label>
      <div className="flex items-center border-b border-line focus-within:border-ink">
        <input
          id="newsletter"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState("idle");
          }}
          placeholder="Your email"
          autoComplete="email"
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "newsletter-error" : undefined}
          className="h-12 w-full bg-transparent outline-none placeholder:text-muted"
        />
        <button type="submit" disabled={state === "busy"} aria-label="Subscribe" className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-brand hover:text-onbrand">
          <ArrowRight className="size-4" />
        </button>
      </div>
      {state === "error" && (
        <p id="newsletter-error" className="mt-2 text-sm text-gold" role="alert">
          Please enter a valid email address.
        </p>
      )}
    </form>
  );
}
