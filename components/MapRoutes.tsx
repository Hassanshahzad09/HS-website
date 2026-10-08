"use client";

import { motion } from "motion/react";
import { origin, routes } from "@/data/site";
import { project } from "@/lib/map";

/** Animated shipping lanes drawn over the dotted map (rendered inside its <svg>). */
export function MapRoutes() {
  const [ox, oy] = project(origin.lon, origin.lat);
  return (
    <g>
      {routes.map((r, i) => {
        const [x, y] = project(r.lon, r.lat);
        const lift = Math.hypot(x - ox, y - oy) * 0.28;
        // Northern lanes arc over the top; southern ones leave sideways so they clear the origin label below the dot.
        const d = y > oy + 10 ? `M${ox} ${oy}Q${x} ${oy} ${x} ${y}` : `M${ox} ${oy}Q${(ox + x) / 2} ${Math.min(oy, y) - lift} ${x} ${y}`;
        return (
          <g key={r.label}>
            <motion.path d={d} fill="none" stroke="var(--brand)" strokeWidth={1.4} strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: "-20%" }} transition={{ duration: 1.6, delay: 0.3 + i * 0.15, ease: "easeInOut" }} />
            <motion.g initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-20%" }} transition={{ delay: 1.6 + i * 0.15, duration: 0.5 }} style={{ transformOrigin: `${x}px ${y}px` }}>
              <circle cx={x} cy={y} r={4} fill="var(--brand)" />
              <text x={x + r.dx} y={y + r.dy} textAnchor={r.anchor} fontSize={12} fill="var(--ink)" style={{ letterSpacing: "0.06em" }}>
                {r.label}
                {"role" in r && (
                  <tspan x={x + r.dx} dy={12} fontSize={9.5} fill="var(--gold)" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {r.role}
                  </tspan>
                )}
              </text>
            </motion.g>
          </g>
        );
      })}

      <circle cx={ox} cy={oy} r={5} fill="var(--gold)" />
      <circle cx={ox} cy={oy} r={5} fill="none" stroke="var(--gold)" strokeWidth={1.2} style={{ transformOrigin: `${ox}px ${oy}px`, animation: "pulse-ring 2.4s ease-out infinite" }} />
      <text x={ox} y={oy + 20} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--gold)" style={{ letterSpacing: "0.06em" }}>
        {origin.label}
        <tspan x={ox} dy={12} fontSize={9.5} fontWeight={500} style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {origin.role}
        </tspan>
      </text>
    </g>
  );
}
