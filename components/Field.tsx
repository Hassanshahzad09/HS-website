import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-2xl border bg-transparent px-4 py-3.5 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-ink";

function Wrap({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-medium">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-gold">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { id: string; label: string; error?: string; optional?: boolean };

export function Field({ id, label, error, optional, className, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={cn(base, error ? "border-gold" : "border-line", className)} {...props} />
    </Wrap>
  );
}

export function TextArea({ id, label, error, optional, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <textarea id={id} name={id} rows={4} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={cn(base, "resize-y", error ? "border-gold" : "border-line", className)} {...props} />
    </Wrap>
  );
}

export function Select({ id, label, error, optional, className, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <select id={id} name={id} aria-invalid={Boolean(error)} className={cn(base, "appearance-none [&>option]:bg-surface [&>option]:text-ink", error ? "border-gold" : "border-line", className)} {...props}>
        {children}
      </select>
    </Wrap>
  );
}
