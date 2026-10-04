import { cn } from "@/lib/utils";

/** The Heritage Shapes double-arch mark, redrawn from the supplied logo. */
export function LogoMark({ className, strokeWidth = 52, stroke = "currentColor" }: { className?: string; strokeWidth?: number; stroke?: string }) {
  return (
    <svg viewBox="0 0 741 568" fill="none" stroke={stroke} strokeWidth={strokeWidth} className={className} aria-hidden="true">
      <path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z" />
      <path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-7 w-auto text-brand" />
      {!compact && <span className="font-brand text-[1.05rem] leading-none tracking-[0.14em]">Heritage Shapes</span>}
    </span>
  );
}
