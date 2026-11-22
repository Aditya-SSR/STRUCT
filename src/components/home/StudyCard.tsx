"use client";
import { useRef, useState } from "react";
import TransitionLink from "@/components/ui/TransitionLink";
import { Corners } from "@/components/ui/Datum";
import type { Garment } from "@/data/drop";
import { fmtUSD } from "@/lib/utils";
import GateReveal from "./parts/GateReveal";
import HomeImg from "./parts/HomeImg";
import { useInView } from "./parts/useInView";

/**
 * One live DROP-01 garment. The whole card links to /drop-01/<slug>. Hover (fine pointers) wipes front → side with a clip;
 * on touch, tapping the photograph swaps the view and tapping the caption opens the piece.
 * The label resolves when the card scrolls into the gallery's viewport.
 */
export default function StudyCard({ garment: g, scroller }: { garment: Garment; scroller: React.RefObject<HTMLDivElement | null> }) {
  const card = useRef<HTMLElement>(null);
  const seen = useInView(card, { root: scroller, rootMargin: "0px -12% 0px 0px", once: true });
  const [flipped, setFlipped] = useState(false);
  const low = g.units.remaining < 25;
  const num = g.sku.slice(-2);

  return (
    <article ref={card} data-card className="group relative w-[min(74vw,420px)] shrink-0 select-none snap-start" aria-label={g.name}>
      <TransitionLink
        href={`/drop-01/${g.slug}`}
        draggable={false}
        data-cursor="VIEW"
        aria-label={`${g.sku} — ${g.name}, ${fmtUSD(g.price.usd)}, ${g.units.remaining} left`}
        className="block"
        onClick={(e) => {
          // touch: a tap on the photograph swaps the view instead of navigating
          if (window.matchMedia("(hover: none)").matches && (e.target as HTMLElement).closest("[data-photo]")) {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div data-photo className="relative aspect-[4/5] overflow-hidden bg-bone">
          <HomeImg k={g.images[0]} alt={`${g.name} — ${g.material}, front`} sizes="(min-width: 768px) 420px, 74vw" position="50% 32%" />
          <div
            aria-hidden={!flipped}
            className={`absolute inset-0 transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
              flipped ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]"
            } group-hover:[clip-path:inset(0_0_0_0)]`}
          >
            <HomeImg k={g.images[1]} alt={`${g.name} — ${g.material}, side view`} sizes="(min-width: 768px) 420px, 74vw" position="50% 32%" />
          </div>
          <div className="pointer-events-none absolute inset-3 text-ink">
            <Corners className="h-full w-full" size={9} />
          </div>
          {/* stock chip: a signal dot when it is nearly gone */}
          <div className="absolute left-4 top-4 flex items-center gap-2 border border-ink bg-paper px-2 py-1 text-ink">
            {low && <span aria-hidden className="h-1.5 w-1.5 bg-signal" />}
            <GateReveal open={seen} as="span" head={false} speed={2} className="t-label">
              {`${String(g.units.remaining).padStart(2, "0")} LEFT`}
            </GateReveal>
          </div>
          <span className="t-dots absolute bottom-4 right-4 text-[1.25rem] text-ink">{num}</span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <GateReveal open={seen} as="p" head={false} speed={1.6} className="t-label">
            {`${g.sku} — ${g.name}`}
          </GateReveal>
          <GateReveal open={seen} as="p" head={false} speed={2} className="t-label opacity-60">
            {`MATERIAL — ${g.material}`}
          </GateReveal>
          <GateReveal open={seen} as="p" head={false} speed={1.6} className="t-dots text-[1.25rem]">
            {fmtUSD(g.price.usd)}
          </GateReveal>
        </div>
      </TransitionLink>
    </article>
  );
}
