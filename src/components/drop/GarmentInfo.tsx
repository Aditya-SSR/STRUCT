"use client";
import type { RefObject } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import Button from "@/components/ui/Button";
import type { Garment } from "@/data/drop";
import SizePicker from "./SizePicker";
import DropAccordion, { type AccordionItem } from "./DropAccordion";
import { SignalDot } from "./Bits";
import { FIT_COPY, LAYER_LABEL, MATERIAL_COPY, SHIPPING_COPY, fmtPrice, isLow, isSoldOut } from "./drop-utils";

type Props = {
  garment: Garment;
  size: string | null;
  onSize: (s: string) => void;
  onAdd: () => void;
  added: boolean;
  message: string;
  /** wraps the in-flow ADD TO BAG so the mobile bar knows when to step aside */
  addWrapRef?: RefObject<HTMLDivElement | null>;
};

/** The sticky right-hand panel on desktop; flows under the carousel on mobile. */
export default function GarmentInfo({ garment: g, size, onSize, onAdd, added, message, addWrapRef }: Props) {
  const out = isSoldOut(g);
  const pct = (g.units.remaining / g.units.total) * 100;
  const items: AccordionItem[] = [
    { id: "specs", title: "SPECS", lines: g.specs },
    { id: "material", title: "MATERIAL", lines: [`${g.material}. ${MATERIAL_COPY[g.material] ?? ""}`.trim()] },
    { id: "fit", title: "FIT", lines: [FIT_COPY[g.layer]] },
    { id: "ship", title: "SHIPPING & CARE", lines: SHIPPING_COPY },
  ];

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb" className="t-label flex items-center gap-2 text-smoke">
        <TransitionLink
          href="/drop-01"
          data-cursor="BACK"
          className="outline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
        >
          DROP-01
        </TransitionLink>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-ink">
          {g.sku}
        </span>
      </nav>

      <h1>
        <SplitReveal
          as="span"
          when="intro"
          className="block font-display text-[length:clamp(2.25rem,4.4vw,4.75rem)] uppercase leading-[0.92] tracking-[-0.045em]"
        >
          {g.name}
        </SplitReveal>
        <SplitReveal as="span" when="intro" delay={0.15} speed={1.6} head={false} className="t-label mt-3 block text-smoke">
          {`${g.material} · ${LAYER_LABEL[g.layer]} LAYER`}
        </SplitReveal>
      </h1>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-y hairline py-4">
        <SplitReveal as="p" when="intro" delay={0.4} speed={1.6} head={false} className="t-lead">
          {fmtPrice(g)}
        </SplitReveal>
        <span className="t-label text-smoke">{g.sku} · DROP-01</span>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="t-label">STOCK</span>
          <span className="inline-flex items-center gap-2">
            {isLow(g) && <SignalDot />}
            <span className="t-dots text-[1.05rem]">{out ? "SOLD OUT" : `${g.units.remaining} / ${g.units.total} LEFT`}</span>
          </span>
        </div>
        <div className="relative h-[3px] w-full bg-ink/10" role="img" aria-label={`${g.units.remaining} of ${g.units.total} units remaining`}>
          <div style={{ width: `${pct}%` }}>
            <LoadLine when="intro" delay={0.6} duration={1.8} thickness={3} />
          </div>
        </div>
      </div>

      <SplitReveal as="p" when="intro" delay={0.5} speed={1.6} head={false} className="t-body max-w-[46ch] text-smoke">
        {g.description}
      </SplitReveal>

      <SizePicker sizes={g.sizes} value={size} onChange={onSize} invalid={!!message && !size} />

      <div ref={addWrapRef}>
        <Button
          type="button"
          variant="solid"
          onClick={onAdd}
          disabled={out}
          data-cursor="ADD"
          aria-describedby="add-msg"
          className="w-full"
        >
          {out ? "SOLD OUT" : added ? "ADDED TO BAG" : "ADD TO BAG"}
        </Button>
        <p id="add-msg" role="alert" className="t-label mt-3 min-h-[1.3em] text-ink">
          {message}
        </p>
        <p className="t-label mt-1 text-smoke">ONE OF 100. RELEASED ONCE. NO RESTOCK.</p>
      </div>

      <DropAccordion items={items} />
    </div>
  );
}
