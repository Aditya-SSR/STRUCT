"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ScrollReveal from "./parts/ScrollReveal";
import { Fig } from "@/components/ui/Datum";
import { GARMENTS, DROP } from "@/data/drop";
import Button from "@/components/ui/Button";
import { pad } from "@/lib/utils";
import Plate from "./parts/Plate";
import StudyCard from "./StudyCard";

/**
 * §05 — DROP-01: the eight garments, live. A native horizontal scroller (touch / trackpad / keys) that a mouse
 * can also drag with inertia. Progress is a load line + a Bitcount counter. Each card links to its piece; a drag never counts as a click.
 */
export default function Studies() {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = scroller.current;
      if (!el) return;

      const sync = () => {
        const max = Math.max(1, el.scrollWidth - el.clientWidth);
        if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, el.scrollLeft / max)})`;
        const first = el.querySelector<HTMLElement>("[data-card]");
        const step = first ? first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0") : 1;
        const i = Math.min(GARMENTS.length, Math.round(el.scrollLeft / step) + 1);
        if (count.current && count.current.textContent !== pad(i)) count.current.textContent = pad(i);
      };

      // mouse drag with a little inertia (touch + trackpad use native scrolling)
      let on = false;
      let x0 = 0;
      let left0 = 0;
      let v = 0;
      let t0 = 0;
      let moved = 0;
      const click = (e: MouseEvent) => {
        if (moved > 6) {
          e.preventDefault();
          e.stopPropagation();
        }
        moved = 0;
      };
      const down = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        gsap.killTweensOf(el);
        on = true;
        x0 = e.clientX;
        left0 = el.scrollLeft;
        v = 0;
        t0 = e.timeStamp;
      };
      const move = (e: PointerEvent) => {
        if (!on) return;
        const next = left0 - (e.clientX - x0);
        v = (el.scrollLeft - next) / Math.max(1, e.timeStamp - t0); // px/ms; positive = moving back
        t0 = e.timeStamp;
        el.scrollLeft = next;
        if (!el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      };
      const up = (e: PointerEvent) => {
        if (!on) return;
        on = false;
        moved = Math.abs(e.clientX - x0);
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        const by = -v * 420;
        if (Math.abs(by) > 8) gsap.to(el, { scrollLeft: el.scrollLeft + by, duration: 1.1, ease: "power3.out" });
      };
      el.addEventListener("scroll", sync, { passive: true });
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("click", click, true);
      sync();
      return () => {
        el.removeEventListener("scroll", sync);
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        el.removeEventListener("click", click, true);
      };
    },
    { scope: root },
  );

  return (
    <Plate ref={root} id="studies" num="05" label="DROP-01 — 14 NOV 2026" tone="blanc" className="overflow-hidden pb-[clamp(5rem,10vw,9rem)]">
      <div className="pad-x pt-[calc(var(--header-h)+clamp(3rem,6vw,5rem))]">
        <Fig>
          <ScrollReveal as="span" head={false} speed={2}>
            FIG. 06 — EIGHT GARMENTS, 800 UNITS
          </ScrollReveal>
        </Fig>
        <div className="mt-6 flex flex-col gap-8">
          <ScrollReveal as="h2" className="t-h1" speed={1}>
            DROP-01. EIGHT GARMENTS.
          </ScrollReveal>
          <ScrollReveal as="p" className="t-body max-w-[38ch] opacity-70 md:self-end" speed={1.6}>
            Eight garments, each made correctly. Released once, never restocked.
          </ScrollReveal>
        </div>
      </div>

      <div
        ref={scroller}
        data-cursor="DRAG"
        role="region"
        aria-label="DROP-01 garments, scroll horizontally"
        tabIndex={0}
        className="mt-12 flex cursor-grab gap-[clamp(1rem,2vw,2rem)] overflow-x-auto px-[var(--margin)] pb-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden [@media(pointer:coarse)]:snap-x md:mt-16"
      >
        {GARMENTS.map((g) => (
          <StudyCard key={g.sku} garment={g} scroller={scroller} />
        ))}
        <div aria-hidden className="w-[calc(var(--margin)*2)] shrink-0" />
      </div>

      <div className="pad-x mt-8 flex items-center gap-6">
        <div className="flex items-baseline gap-2">
          <span ref={count} className="t-dots text-[1.75rem]">
            01
          </span>
          <span className="t-dots text-[1.1rem] opacity-50">{`/ ${pad(GARMENTS.length)}`}</span>
        </div>
        <div className="relative h-px flex-1 bg-current/15" aria-hidden>
          <div ref={bar} className="absolute inset-0 origin-left bg-current" style={{ transform: "scaleX(0.04)" }} />
        </div>
        <span className="t-label hidden opacity-60 md:block">DRAG →</span>
      </div>

      <div className="pad-x mt-10 flex flex-col gap-4 md:mt-14 md:flex-row md:items-center md:justify-between">
        <p className="t-label opacity-60">{`${DROP.id} — ${DROP.released}`}</p>
        {/* text-paper: the global `a { color: inherit }` outranks Button's own text utility, so the label inherits it from here */}
        <div className="text-paper">
          <Button href="/drop-01" tone="ink" variant="solid" data-cursor="ENTER" className="w-full md:w-auto">
            SHOP DROP-01
          </Button>
        </div>
      </div>
    </Plate>
  );
}
