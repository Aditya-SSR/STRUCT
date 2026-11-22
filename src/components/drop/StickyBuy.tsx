"use client";
import Button from "@/components/ui/Button";
import type { Garment } from "@/data/drop";
import { isSoldOut } from "./drop-utils";

type Props = { garment: Garment; size: string | null; visible: boolean; added: boolean; onAdd: () => void };

/** Mobile-only bottom bar. Steps aside (translated off-screen + inert) when the in-flow button is visible. */
export default function StickyBuy({ garment: g, size, visible, added, onAdd }: Props) {
  const out = isSoldOut(g);
  const label = out ? "SOLD OUT" : added ? "ADDED TO BAG" : size ? `ADD TO BAG — ${size}` : "SELECT SIZE";
  return (
    <div
      inert={!visible}
      className={`tone-noir fixed inset-x-0 bottom-0 z-40 border-t hairline px-[var(--margin)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-[600ms] ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <p className="t-label text-ash">{g.sku}</p>
          <p className="t-dots text-xl">${g.price.usd.toLocaleString("en-US")}</p>
        </div>
        <Button type="button" tone="paper" variant="solid" onClick={onAdd} disabled={out} data-cursor="ADD" className="min-w-0 flex-1">
          {label}
        </Button>
      </div>
    </div>
  );
}
