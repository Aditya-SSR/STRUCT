"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP, Flip, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { GARMENTS, type Garment } from "@/data/drop";
import FilterBar, { type LayerFilter, type SortKey } from "./FilterBar";
import GarmentCard from "./GarmentCard";

const order = (list: Garment[], sort: SortKey) =>
  sort === "default" ? list : [...list].sort((a, b) => (sort === "asc" ? a.price.usd - b.price.usd : b.price.usd - a.price.usd));

/** Filter bar + the eight garments. Filtering / sorting reflows the grid with GSAP Flip. */
export default function GarmentGrid() {
  const root = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<LayerFilter>("all");
  const [sort, setSort] = useState<SortKey>("default");

  const match = (g: Garment) => layer === "all" || g.layer === layer;
  const shown = GARMENTS.filter(match).length;
  const list = order(GARMENTS, sort);

  // Flip state is captured in the click handler and played after React has re-rendered
  const pending = useRef<ReturnType<typeof Flip.getState> | null>(null);

  const change = (nextLayer: LayerFilter, nextSort: SortKey) => {
    if (nextLayer === layer && nextSort === sort) return;
    const cards = gsap.utils.toArray<HTMLElement>("[data-flip-id]", root.current);
    if (!prefersReducedMotion() && cards.length) {
      Flip.killFlipsOf(cards);
      pending.current = Flip.getState(cards);
    }
    setLayer(nextLayer);
    setSort(nextSort);
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
        stagger: 0.04,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.9, delay: 0.4, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.5, ease: "power2.out" }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    },
    { scope: root, dependencies: [layer, sort] },
  );

  return (
    <section
      id="garments"
      data-header-tone="light"
      aria-label="DROP-01 garments"
      className="tone-blanc pad-x relative py-14 md:py-24"
    >
      <div ref={root}>
        <FilterBar
          layer={layer}
          sort={sort}
          onLayer={(v) => change(v, sort)}
          onSort={(v) => change(layer, v)}
          shown={shown}
          total={GARMENTS.length}
        />
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-10 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {list.map((g, i) => (
            <GarmentCard key={g.sku} garment={g} index={i} hidden={!match(g)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
