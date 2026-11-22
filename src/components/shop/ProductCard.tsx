"use client";
import { useRef } from "react";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink";
import SplitReveal from "@/components/ui/SplitReveal";
import { Datum } from "@/components/ui/Datum";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import type { Product } from "@/data/products";
import StockChip from "./StockChip";
import { imgSrc, fmtPrice, variantLabel } from "./shop-utils";

type Props = {
  product: Product;
  /** position in the grid, used to stagger the scroll-in */
  index?: number;
  /** removed from layout (filter) — the Flip in ProductGrid animates the change */
  hidden?: boolean;
  compact?: boolean;
};

const CARD_SIZES = "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw";
const FULL = "inset(0% 0% 0% 0%)";
const SHUT = "inset(100% 0% 0% 0%)";

/** One SUIT-01 SKU: hairline 3:4 frame, corner datums, hover wipes to the second image. */
export default function ProductCard({ product: p, index = 0, hidden, compact }: Props) {
  const root = useRef<HTMLLIElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [first, second] = p.images;

  useGSAP(
    () => {
      if (!reveal.current || !inner.current || !frame.current) return;
      if (prefersReducedMotion()) {
        gsap.set(reveal.current, { clipPath: FULL });
        gsap.set(inner.current, { scale: 1 });
        return;
      }
      const scrollTrigger = { trigger: frame.current, start: "top 90%", once: true };
      const delay = (index % 4) * 0.09;
      gsap.fromTo(reveal.current, { clipPath: SHUT }, { clipPath: FULL, duration: 1.3, delay, ease: "expo.out", scrollTrigger });
      gsap.fromTo(inner.current, { scale: 1.2 }, { scale: 1, duration: 1.7, delay, ease: "expo.out", scrollTrigger });
    },
    { scope: root },
  );

  return (
    <li
      ref={root}
      data-flip-id={p.sku}
      className={`${hidden ? "hidden" : "block"} ${compact ? "w-[72vw] shrink-0 snap-start sm:w-auto" : ""}`}
    >
      <TransitionLink
        href={`/suit-01/${p.slug}`}
        data-cursor="VIEW"
        aria-label={`${p.title} — ${p.units.remaining} left. View product`}
        className="group block outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
      >
        <div ref={frame} className="relative aspect-[3/4] border hairline bg-bone">
          <div ref={reveal} className="absolute inset-0 overflow-hidden" style={{ clipPath: SHUT }}>
            <div ref={inner} className="absolute inset-0">
              <Image
                src={imgSrc(first)}
                alt={`${p.title}: the full structure, front`}
                fill
                sizes={CARD_SIZES}
                className="object-cover"
                style={{ objectPosition: p.focus }}
              />
              {second && (
                <div
                  className="absolute inset-0 transition-[clip-path] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
                  aria-hidden
                >
                  <Image src={imgSrc(second)} alt="" fill sizes={CARD_SIZES} className="object-cover" />
                </div>
              )}
            </div>
          </div>
          {/* datums at the frame corners */}
          <Datum className="absolute -left-[6px] -top-[6px] text-ink" size={11} />
          <Datum className="absolute -right-[6px] -top-[6px] text-ink" size={11} />
          <Datum className="absolute -bottom-[6px] -left-[6px] text-ink" size={11} />
          <Datum className="absolute -bottom-[6px] -right-[6px] text-ink" size={11} />
          <span aria-hidden className="t-label absolute left-3 top-3 text-paper mix-blend-difference">
            {p.sku}
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <h3 className="min-w-0">
            <SplitReveal as="span" className="t-h3 block" speed={1.4} head={false}>
              {p.name}
            </SplitReveal>
            <SplitReveal as="span" className="t-h3 mt-1 block text-smoke" speed={1.4} head={false} delay={0.1}>
              {variantLabel(p)}
            </SplitReveal>
          </h3>
          <StockChip remaining={p.units.remaining} className="shrink-0 pt-1" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t hairline pt-3">
          <SplitReveal as="p" className="t-body" speed={2} head={false}>
            {fmtPrice(p)}
          </SplitReveal>
          <span className="t-label text-smoke" aria-hidden>
            VIEW →
          </span>
        </div>
      </TransitionLink>
    </li>
  );
}
