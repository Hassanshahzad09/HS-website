import type { CSSProperties } from "react";
import type { Effect, Tone } from "@/data/products";
import { cn } from "@/lib/utils";

const MARK = (
  <>
    <path d="M198 542V284.5A258.5 258.5 0 0 1 715 284.5V542Z" />
    <path d="M26 542V374.5A171.5 171.5 0 0 1 369 374.5V542Z" />
  </>
);

/** How each finish renders the logo on top of a material tone. */
const EFFECT: Record<Effect, { mark: CSSProperties; overlay?: CSSProperties; stroke?: string }> = {
  print: { mark: { color: "var(--brand)" } },
  matte: { mark: { color: "var(--on)", opacity: 0.8 } },
  gloss: {
    mark: { color: "var(--on)" },
    overlay: { background: "linear-gradient(115deg, transparent 20%, rgba(255,255,255,.55) 38%, transparent 52%, transparent 70%, rgba(255,255,255,.25) 80%, transparent 90%)" },
  },
  soft: {
    mark: { color: "var(--on)", opacity: 0.7 },
    overlay: { background: "radial-gradient(90% 70% at 30% 20%, rgba(255,255,255,.22), transparent 70%)", backdropFilter: "blur(0.5px)" },
  },
  emboss: { mark: { color: "rgba(127,127,127,.12)", filter: "drop-shadow(-1.5px -1.5px 0.5px rgba(255,255,255,.75)) drop-shadow(2px 2.5px 2px rgba(0,0,0,.4))" } },
  deboss: { mark: { color: "rgba(0,0,0,.2)", filter: "drop-shadow(1.5px 1.5px 0.5px rgba(255,255,255,.5)) drop-shadow(-1px -1px 0.5px rgba(0,0,0,.35))" } },
  foil: { mark: { filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))" }, stroke: "url(#hs-foil)" },
  uv: { mark: { filter: "drop-shadow(0 0 6px rgba(255,255,255,.25))" }, stroke: "url(#hs-uv)" },
  diecut: { mark: { color: "var(--bg)", fill: "var(--bg)", filter: "drop-shadow(0 1.5px 0 rgba(255,255,255,.35)) drop-shadow(0 -1px 1px rgba(0,0,0,.4))" } },
};

/** A material chip with the logo applied in a given finish. */
export function Swatch({ tone, effect = "matte", className, markClassName }: { tone: Tone; effect?: Effect; className?: string; markClassName?: string }) {
  const fx = EFFECT[effect];
  return (
    <div className={cn(`tone-${tone}`, "grid place-items-center overflow-hidden", className)} aria-hidden="true">
      <svg viewBox="0 0 741 568" fill={effect === "diecut" ? "currentColor" : "none"} stroke={fx.stroke ?? "currentColor"} strokeWidth={effect === "diecut" ? 0 : 46} className={cn("w-[38%] transition-all duration-500", markClassName)} style={fx.mark}>
        <defs>
          <linearGradient id="hs-foil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8c6a32" />
            <stop offset=".35" stopColor="#f3dca5" />
            <stop offset=".6" stopColor="#b88a45" />
            <stop offset="1" stopColor="#f6e6b8" />
          </linearGradient>
          <linearGradient id="hs-uv" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".12" />
            <stop offset=".45" stopColor="#fff" stopOpacity=".6" />
            <stop offset=".6" stopColor="#fff" stopOpacity=".15" />
            <stop offset="1" stopColor="#fff" stopOpacity=".4" />
          </linearGradient>
        </defs>
        {MARK}
      </svg>
      {fx.overlay && <span className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={fx.overlay} />}
    </div>
  );
}
