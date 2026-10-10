import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small "AI" pill shown next to links to the AI Studio. */
export function AiBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-brand to-brand2 px-1.5 py-px align-middle text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.08em] text-white", className)}>
      <Sparkles className="size-2.5" strokeWidth={2.5} aria-hidden="true" />
      AI
    </span>
  );
}
