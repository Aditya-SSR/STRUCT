"use client";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import Image from "next/image";
import TransitionLink from "@/components/ui/TransitionLink";
import SplitReveal from "@/components/ui/SplitReveal";
import { Datum } from "@/components/ui/Datum";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import type { Garment } from "@/data/drop";
import { StockChip } from "./Bits";
import QuickAdd from "./QuickAdd";
import { CARD_SIZES, LAYER_LABEL, fmtPrice, imgSrc, isSoldOut } from "./drop-utils";

type Props = {
  garment: Garment;
  /** position in the grid, used to stagger the scroll-in */
  index?: number;
  /** removed from layout (filter) — the Flip in GarmentGrid animates the change */
  hidden?: boolean;
  /** fixed-width card for a horizontal scroller */
  compact?: boolean;
};

/** Stand-in for SplitReveal while a card is filtered out: same box, invisible, no animation. */
function Plain({ as: Tag = "div", className, children }: { as?: ElementType; className?: string; children: ReactNode; [k: string]: unknown }) {
  return (
    <Tag className={className} style={{ visibility: "hidden" }}>
      {children}
    </Tag>
  );
}

const FULL = "inset(0% 0% 0% 0%)";
const SHUT = "inset(100% 0% 0% 0%)";

/**
 * One DROP-01 garment. A single stretched link (the name) covers the card; the quick-add chips sit above it.
 * The landscape photograph is cropped to a 4:5 portrait around its centred subject; hover wipes to the side view.
 */
export default function GarmentCard({ garment: g, index = 0, hidden, compact }: Props) {
  const root = useRef<HTMLLIElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [front, side] = g.images;
  const out = isSoldOut(g);

  // A text reveal (SplitReveal) must never start, or be re-split, while its card is display:none or mid-Flip:
  // its scroll trigger would fire against a zero-size layout and the reveal would freeze half-resolved.
  // So a card that is filtered out before its text has played falls back to invisible placeholders (same
  // layout) and re-arms the real reveals once the Flip has settled. `seen` = the text had time to finish.
  const [armed, setArmed] = useState(!hidden);
  const [seen, setSeen] = useState(false);
  if (hidden && armed && !seen) setArmed(false);
  const live = armed;
  const Txt = live ? SplitReveal : Plain;

  useEffect(() => {
    if (hidden || armed) return;
    const t = setTimeout(() => setArmed(true), 1700);
    return () => clearTimeout(t);
  }, [hidden, armed]);

  useGSAP(
    () => {
      if (!reveal.current || !inner.current || !frame.current) return;
      ScrollTrigger.create({
        trigger: copy.current ?? frame.current,
        start: "bottom 84%",
        onEnter: () => {
          if (root.current && root.current.offsetParent !== null) setTimeout(() => setSeen(true), 2500);
        },
      });
      if (prefersReducedMotion()) {
        gsap.set(reveal.current, { clipPath: FULL });
        gsap.set(inner.current, { scale: 1 });
        return;
      }
      const scrollTrigger = { trigger: frame.current, start: "top 92%", once: true };
      const delay = (index % 4) * 0.09;
      gsap.fromTo(reveal.current, { clipPath: SHUT }, { clipPath: FULL, duration: 1.3, delay, ease: "expo.out", scrollTrigger });
      gsap.fromTo(inner.current, { scale: 1.18 }, { scale: 1, duration: 1.7, delay, ease: "expo.out", scrollTrigger });
    },
    { scope: root },
  );

  return (
    <li
      ref={root}
      data-flip-id={g.sku}
      className={`group/card relative ${hidden ? "hidden" : "block"} ${compact ? "w-[62vw] shrink-0 snap-start md:w-auto" : ""}`}
    >
      <div ref={frame} className="relative aspect-[4/5] border hairline bg-bone">
        <div ref={reveal} className="absolute inset-0 overflow-hidden" style={{ clipPath: SHUT }}>
          <div ref={inner} className="absolute inset-0">
            <Image
              src={imgSrc(front)}
              alt={`${g.name}, front view`}
              fill
              sizes={CARD_SIZES}
              quality={80}
              className={`object-cover ${out ? "grayscale" : ""}`}
              style={{ objectPosition: "50% 50%" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 transition-[clip-path] duration-[700ms] ease-[cubic-bezier(0.76,0,0.24,1)] [clip-path:inset(100%_0_0_0)] group-hover/card:[clip-path:inset(0_0_0_0)] group-active/card:[clip-path:inset(0_0_0_0)] group-has-[a:focus-visible]/card:[clip-path:inset(0_0_0_0)]"
            >
              <Image
                src={imgSrc(side)}
                alt=""
                fill
                sizes={CARD_SIZES}
                quality={80}
                className={`object-cover ${out ? "grayscale" : ""}`}
                style={{ objectPosition: "50% 50%" }}
              />
            </div>
          </div>
        </div>
        <Datum className="absolute -left-[6px] -top-[6px] text-ink" size={11} />
        <Datum className="absolute -right-[6px] -top-[6px] text-ink" size={11} />
        <Datum className="absolute -bottom-[6px] -left-[6px] text-ink" size={11} />
        <Datum className="absolute -bottom-[6px] -right-[6px] text-ink" size={11} />
        <Txt as="span" speed={2} head={false} className="t-label pointer-events-none absolute left-3 top-3 text-ink">
          {g.sku}
        </Txt>
        <QuickAdd g={g} />
      </div>

      <div ref={copy} className="mt-4">
        <h3 className="font-display text-[0.8125rem] uppercase leading-[1.08] tracking-[-0.02em] md:text-[length:clamp(0.9rem,1.2vw,1.15rem)]">
          <TransitionLink
            href={`/drop-01/${g.slug}`}
            data-cursor="VIEW"
            aria-label={`${g.name}, ${out ? "sold out" : `${g.units.remaining} left`}. View product`}
            className="outline-offset-4 after:absolute after:inset-0 after:z-10 focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal"
          >
            <Txt as="span" speed={1.4} head={false} className="block">
              {g.name}
            </Txt>
          </TransitionLink>
        </h3>
        <Txt as="p" speed={2} head={false} delay={0.1} className="t-label mt-2 text-smoke">
          {`${g.material} · ${LAYER_LABEL[g.layer]}`}
        </Txt>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t hairline pt-3">
          <Txt as="p" speed={2} head={false} className="t-body">
            {fmtPrice(g)}
          </Txt>
          <StockChip g={g} plain={!live} />
        </div>
      </div>
    </li>
  );
}
