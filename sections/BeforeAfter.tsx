"use client";

import Image from "next/image";
import { MoveHorizontal } from "lucide-react";
import { useState } from "react";
import { MaskReveal, SectionHeading, SplitText } from "@/components/Reveal";

/** Draggable comparison: unbranded packaging on the left, branded on the right. */
export function BeforeAfter() {
  const [pos, setPos] = useState(50);

  return (
    <section className="bg-bg py-24 lg:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="Standard vs branded" text="Same bag, same box, same pouch. Drag the handle to see what colour, foil, a ribbon and a seal do to them.">
          <SplitText segments={["Small details. ", { text: "Big difference.", gradient: true }]} />
        </SectionHeading>

        <MaskReveal className="mt-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line bg-bg2 sm:aspect-[16/10]" data-cursor="DRAG">
            <Image src="/mockups/after.webp" alt="Branded packaging: navy bag with gold foil logo, printed box, pouch, ribbon and sticker" fill sizes="(min-width: 1480px) 1350px, 92vw" className="object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Image src="/mockups/before.webp" alt="Standard packaging: plain kraft bag, box and pouch with no branding" fill sizes="(min-width: 1480px) 1350px, 92vw" className="object-cover" />
            </div>

            <span className="glass absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em]">Standard</span>
            <span className="glass absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em]">Branded</span>

            <div className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,.15)]" style={{ left: `${pos}%` }}>
              <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0e1418] shadow-lg">
                <MoveHorizontal className="size-5" aria-hidden="true" />
              </span>
            </div>

            {/* The range input is the whole interaction: drag, click and arrow keys all work. */}
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Comparison slider: move left for branded, right for standard"
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </div>
        </MaskReveal>
      </div>
    </section>
  );
}
