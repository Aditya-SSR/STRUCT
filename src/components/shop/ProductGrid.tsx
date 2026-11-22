"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, Flip, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { PRODUCTS } from "@/data/products";
import FilterBar, { type CutFilter, type ColourFilter } from "./FilterBar";
import ProductCard from "./ProductCard";

/** Filter bar + the four SKUs. Filtering reflows the grid with GSAP Flip: leavers fade out, the rest glide. */
export default function ProductGrid() {
  const root = useRef<HTMLDivElement>(null);
  const [cut, setCut] = useState<CutFilter>("all");
  const [colour, setColour] = useState<ColourFilter>("all");

  const matches = (c: CutFilter, k: ColourFilter, p: (typeof PRODUCTS)[number]) =>
    (c === "all" || p.cut === c) && (k === "all" || p.colorway === k);
  const shown = PRODUCTS.filter((p) => matches(cut, colour, p)).length;

  // Flip state captured in the click handler, played in the layout effect after React has re-rendered
  const pending = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const change = (nextCut: CutFilter, nextColour: ColourFilter) => {
    if (nextCut === cut && nextColour === colour) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-flip-id]", root.current);
    if (!prefersReducedMotion() && cards.length) {
      Flip.killFlipsOf(cards);
      pending.current = Flip.getState(cards);
    }
    setCut(nextCut);
    setColour(nextColour);
  };

  useGSAP(
    () => {
      const state = pending.current;
      if (!state) return;
      pending.current = null;
      Flip.from(state, {
        duration: 0.95,
        ease: "power4.inOut",
        absolute: true,
        stagger: 0.05,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.9, delay: 0.4, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.5, ease: "power2.out" }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { scope: root, dependencies: [cut, colour] },
  );

  return (
    <section
      id="objects"
      data-header-tone="light"
      aria-label="SUIT-01 SKUs"
      className="tone-blanc pad-x relative py-16 md:py-24"
    >
      <div ref={root}>
        <FilterBar
          cut={cut}
          colour={colour}
          onCut={(v) => change(v, colour)}
          onColour={(v) => change(cut, v)}
          shown={shown}
          total={PRODUCTS.length}
        />
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.sku} product={p} index={i} hidden={!matches(cut, colour, p)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
