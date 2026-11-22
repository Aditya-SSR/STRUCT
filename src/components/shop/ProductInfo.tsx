"use client";
import type { RefObject } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import { SUIT, type Product } from "@/data/products";
import SizeSelect from "./SizeSelect";
import Accordion, { type AccordionItem } from "./Accordion";
import { SignalDot } from "./StockChip";
import type { AddState } from "./useAddToBag";
import { variantLabel } from "./shop-utils";

type Props = {
  product: Product;
  size: string | null;
  onSize: (s: string) => void;
  onAdd: () => void;
  addState: AddState;
  message: string;
  /** wraps the in-flow ADD TO BAG so the mobile bar knows when to step aside */
  addWrapRef?: RefObject<HTMLDivElement | null>;
};

const ACCORDION: AccordionItem[] = [
  {
    id: "pieces",
    title: "PIECES",
    lines: SUIT.pieces.map((x) => `${x.n} — ${x.name}. ${x.body}`),
  },
  { id: "material", title: "MATERIAL", lines: [SUIT.material] },
  { id: "whole", title: "WHY IT'S SOLD WHOLE", lines: [SUIT.whySoldWhole] },
  { id: "sizing", title: "SIZING", lines: [SUIT.sizing] },
  { id: "ship", title: "SHIPPING & CARE", lines: [SUIT.shipping, SUIT.care] },
];

/** The sticky right-hand panel on desktop; flows under the carousel on mobile. */
export default function ProductInfo({ product: p, size, onSize, onAdd, addState, message, addWrapRef }: Props) {
  const pct = (p.units.remaining / p.units.total) * 100;
  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb" className="t-label flex items-center gap-2 text-smoke">
        <TransitionLink href="/suit-01" data-cursor="BACK" className="outline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
          SUIT-01
        </TransitionLink>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-ink">
          {variantLabel(p)}
        </span>
      </nav>

      <h1>
        <SplitReveal
          as="span"
          when="intro"
          className="block font-display text-[length:clamp(2.25rem,4.6vw,5rem)] uppercase leading-[0.92] tracking-[-0.045em]"
        >
          {p.name}
        </SplitReveal>
        <SplitReveal as="span" when="intro" delay={0.15} className="t-h2 mt-1 block text-smoke">
          {variantLabel(p)}
        </SplitReveal>
      </h1>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y hairline py-4">
        <SplitReveal as="p" when="intro" delay={0.4} speed={1.6} head={false} className="t-lead">
          {`$${p.price.usd.toLocaleString("en-US")} · ¥${p.price.jpy.toLocaleString("en-US")}`}
        </SplitReveal>
        <span className="t-label text-smoke">SOLD WHOLE · {p.sku}</span>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="t-label">STOCK</span>
          <span className="inline-flex items-center gap-2">
            {p.units.remaining < 20 && <SignalDot />}
            <span className="t-dots text-[1.05rem]">
              {p.units.remaining} / {p.units.total} LEFT
            </span>
          </span>
        </div>
        <div className="relative h-[3px] w-full bg-ink/10" role="img" aria-label={`${p.units.remaining} of ${p.units.total} units remaining`}>
          <div style={{ width: `${pct}%` }}>
            <LoadLine when="intro" delay={0.6} duration={1.8} thickness={3} />
          </div>
        </div>
      </div>

      <SplitReveal as="p" when="intro" delay={0.5} speed={1.6} head={false} className="t-body max-w-[46ch] text-smoke">
        {p.blurb}
      </SplitReveal>

      <SizeSelect sizes={p.sizes} value={size} onChange={onSize} invalid={!!message && !size} />

      <div ref={addWrapRef}>
        <Button
          type="button"
          variant="solid"
          onClick={onAdd}
          data-cursor="ADD"
          aria-describedby="add-msg"
          className="w-full"
        >
          {addState === "added" ? "ADDED TO BAG" : "ADD TO BAG"}
        </Button>
        <p id="add-msg" role="alert" className="t-label mt-3 min-h-[1.3em] text-ink">
          {message}
        </p>
        <p className="t-label mt-1 text-smoke">COAT + TUNIC + TROUSER + BELT. ONE STRUCTURE. NO SEPARATES.</p>
      </div>

      <Accordion items={ACCORDION} />
    </div>
  );
}
