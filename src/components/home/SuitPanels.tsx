"use client";
import type { RefObject } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import { PRODUCTS } from "@/data/products";
import GateReveal from "./parts/GateReveal";
import HomeImg from "./parts/HomeImg";

/**
 * The horizontal strip of the four SKUs. ONE line runs through the whole track at belt height, across every panel
 * and every gap — mix-blend-difference makes it white on the black bodies and black on the white ones.
 */
export default function SuitPanels({
  trackRef,
  lineRef,
  seen,
}: {
  trackRef: RefObject<HTMLDivElement | null>;
  lineRef: RefObject<HTMLDivElement | null>;
  /** seen[0] = lead block, seen[1..4] = the four panels */
  seen: boolean[];
}) {
  return (
    <div
      data-strip
      className="pointer-events-none absolute inset-0 z-[6] flex items-center group-data-[static]:pointer-events-auto group-data-[static]:relative group-data-[static]:inset-auto group-data-[static]:overflow-x-auto group-data-[static]:py-16"
      style={{ visibility: "hidden" }}
    >
      <div
        ref={trackRef}
        className="relative flex w-max items-start gap-[clamp(1rem,3vw,3rem)] px-[var(--margin)] [--ih:54svh] md:[--ih:62svh]"
      >
        {/* lead block: sits below the line */}
        <div className="flex h-[var(--ih)] w-[min(78vw,26rem)] shrink-0 flex-col justify-end gap-3 pb-1">
          <GateReveal open={seen[0]} as="p" head={false} speed={2} className="t-label opacity-60">
            [ FIG. 08 — FOUR BODIES, ONE LINE ]
          </GateReveal>
          <GateReveal open={seen[0]} as="p" speed={1.1} className="font-display text-[clamp(1.4rem,2.6vw,2.75rem)] uppercase leading-[0.98] tracking-[-0.035em]">
            THE LINE CONTINUES ACROSS EVERY PIECE.
          </GateReveal>
        </div>

        {PRODUCTS.map((p, i) => (
          // pointer-only link: the track is moved by the pin, so keyboard users use the CTA that follows (tabIndex -1 avoids scrolling the clipped plate)
          <TransitionLink
            key={p.sku}
            href={`/suit-01/${p.slug}`}
            tabIndex={-1}
            draggable={false}
            data-cursor="VIEW"
            className="pointer-events-auto block shrink-0"
          >
            <figure className="m-0 w-[min(66vw,24rem)] md:w-[clamp(15rem,23vw,25rem)]">
              <div className="relative h-[var(--ih)] overflow-hidden bg-bone">
                <HomeImg
                  k={p.images[0]}
                  alt={`${p.title} — SUIT-01 in ${p.colorway === "noir" ? "black with white" : "white with black"} load lines, ${p.cut}'s cut`}
                  sizes="(min-width: 768px) 25vw, 66vw"
                  position="50% 40%"
                />
              </div>
              <figcaption className="mt-4 flex flex-col gap-1.5">
                <GateReveal open={seen[i + 1]} as="p" head={false} speed={2} className="t-label opacity-60">
                  {p.sku}
                </GateReveal>
                <GateReveal open={seen[i + 1]} as="p" head={false} speed={1.4} className="font-display text-[clamp(0.9rem,1.4vw,1.4rem)] uppercase leading-none tracking-[-0.02em]">
                  {`${p.colorway} / ${p.cut}`}
                </GateReveal>
                <GateReveal open={seen[i + 1]} as="p" head={false} speed={1.6} className="t-dots text-[1.25rem] opacity-80">
                  {`${p.units.remaining} / ${p.units.total}`}
                </GateReveal>
              </figcaption>
            </figure>
          </TransitionLink>
        ))}

        {/* the line: belt height of the figures, through everything */}
        <div
          ref={lineRef}
          aria-hidden
          className="absolute left-0 top-[calc(var(--ih)*0.43)] h-[2px] w-full origin-left bg-paper mix-blend-difference"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
