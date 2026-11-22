"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ScrollReveal from "./parts/ScrollReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import { Datum } from "@/components/ui/Datum";
import { SUIT, PRODUCTS, SUIT_RELEASE } from "@/data/products";
import { fmtUSD, fmtJPY } from "@/lib/utils";
import Plate from "./parts/Plate";

const price = PRODUCTS[0].price;

/**
 * §08.1 — after the pinned sequence: the four pieces, SOLD WHOLE., the price, the way in.
 * A single vertical load line runs down through the four pieces (scrubbed) — the line from the strip, continued.
 */
export default function SuitFinale() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          line.current,
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 75%", end: "bottom 60%", scrub: 0.5 } },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(line.current, { scaleY: 1 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Plate ref={root} num="08.1" label="SUIT-01 — SOLD WHOLE" tone="noir" className="pad-x">
      <div className="pb-[clamp(5rem,11vw,10rem)] pt-[calc(var(--header-h)+clamp(4rem,9vw,8rem))]">
        <ScrollReveal as="h2" className="font-display text-[clamp(2.75rem,9.4vw,11.5rem)] uppercase leading-[0.9] tracking-[-0.045em]" speed={0.9}>
          SOLD WHOLE.
        </ScrollReveal>

        <div className="grid-12 mt-12 gap-y-16 md:mt-20">
          {/* the four pieces, strung on one line */}
          <div className="relative col-span-12 md:col-span-7">
            <div ref={line} aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-paper" style={{ transform: "scaleY(0)" }} />
            <ol ref={list} className="m-0 flex list-none flex-col p-0">
              {SUIT.pieces.map((p) => (
                <li key={p.n} className="relative grid grid-cols-[2rem_1fr] items-baseline gap-x-2 border-b border-paper/15 py-7 first:pt-0 last:border-b-0 md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.15fr)]">
                  <Datum className="relative bg-ink text-paper" />
                  <ScrollReveal as="h3" className="font-display text-[clamp(1.5rem,3.2vw,3.5rem)] uppercase leading-none tracking-[-0.04em]" speed={1.1}>
                    {p.name}
                  </ScrollReveal>
                  <div className="col-start-2 mt-3 max-w-[40ch] md:col-start-3 md:mt-0">
                    <ScrollReveal as="p" head={false} speed={1.6} className="t-body opacity-70">
                      {p.body}
                    </ScrollReveal>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* why, price, units, way in */}
          <div className="col-span-12 flex flex-col gap-8 md:col-span-4 md:col-start-9">
            <ScrollReveal as="p" className="t-lead" speed={1.5}>
              {SUIT.whySoldWhole}
            </ScrollReveal>
            <LoadLine className="w-full opacity-30" />
            <div className="flex flex-col gap-2">
              <ScrollReveal as="p" head={false} speed={2} className="t-label opacity-60">
                PRICE — EACH, SOLD WHOLE
              </ScrollReveal>
              <ScrollReveal as="p" speed={0.9} className="t-dots whitespace-nowrap text-[clamp(1.35rem,2.2vw,2.4rem)]">
                {`${fmtUSD(price.usd)} / ${fmtJPY(price.jpy)}`}
              </ScrollReveal>
            </div>
            <div className="flex items-end justify-between gap-6">
              <div className="flex flex-col gap-2">
                <ScrollReveal as="p" head={false} speed={2} className="t-label opacity-60">
                  {`${SUIT_RELEASE.id} — ONCE. NO RESTOCK.`}
                </ScrollReveal>
                <ScrollReveal as="p" speed={0.9} className="t-dots text-[clamp(1.75rem,3vw,3rem)]">
                  {`${SUIT_RELEASE.totalUnits} UNITS`}
                </ScrollReveal>
                <ScrollReveal as="p" head={false} speed={2} className="t-label opacity-60">
                  {`SOLD SEPARATELY. RELEASED ${SUIT_RELEASE.released}`}
                </ScrollReveal>
              </div>
            </div>
            {/* text-ink: the global `a { color: inherit }` outranks Button's own text-ink utility, so the label inherits it from here */}
            <div className="mt-2 text-ink">
              <Button href="/suit-01" tone="paper" variant="solid" data-cursor="ENTER" className="w-full md:w-auto">
                ENTER SUIT-01
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Plate>
  );
}
