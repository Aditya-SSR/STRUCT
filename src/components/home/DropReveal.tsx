"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import ScrollReveal from "./parts/ScrollReveal";
import GateReveal from "./parts/GateReveal";
import Plate from "./parts/Plate";
import { SUIT_RELEASE } from "@/data/products";
import { pad } from "@/lib/utils";

const WORD = "font-display uppercase leading-[0.9] tracking-[-0.04em] whitespace-nowrap";
const LINE = `${WORD} block`;
const HOLD = 0.8; // the statement rests before the dive begins
const DIVE = 6; // duration of the zoom
const OPEN_AT = HOLD + DIVE + 0.8; // timeline time at which the dot-matrix SUIT-01 begins to resolve
const CLOSE_AT = OPEN_AT - 1.2;

/**
 * §07 — "WE WERE BORED OF NORMAL CLOTHES. SO WE INVENTED SUIT-01." Pinned + scrubbed.
 * The statement sits on paper; the word SUIT-01 then scales (transform only) about the counter of its "0", which is
 * steered to screen centre, so the camera falls through the zero. An ink circle (clip-path) opens from the centre and
 * the dot-matrix SUIT-01 resolves on it. The pin then releases straight into the SUIT-01 reveal (§08).
 */
export default function DropReveal() {
  const root = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const sw = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLSpanElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const plate = root.current;
      const w = wrap.current;
      const line = sw.current;
      const o = oRef.current;
      if (!plate || !w || !o || !line) return;

      const mm = gsap.matchMedia();
      mm.add({ all: "(min-width: 0px)", motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };

        if (!motion) {
          // no pin, no zoom: the statement, then the ink plate, stacked
          plate.setAttribute("data-static", "");
          gsap.set(ink.current, { clipPath: "none" });
          if (counter.current) counter.current.textContent = pad(SUIT_RELEASE.totalUnits, 3);
          setOpen(true);
          return () => plate.removeAttribute("data-static");
        }

        // measured on every refresh (layout offsets ignore transforms, so this is stable at any scroll position).
        // Scaling about the wrapper centre while translating linearly sends the zero's centre in a straight line to screen centre.
        const geo = () => {
          const cx = w.offsetWidth / 2;
          const cy = w.offsetHeight / 2;
          const ox = line.offsetLeft + o.offsetLeft + o.offsetWidth / 2;
          const oy = line.offsetTop + o.offsetTop + o.offsetHeight / 2;
          const S = (Math.hypot(plate.clientWidth, plate.clientHeight) / (o.offsetWidth * 0.4)) * 1.06; // the zero's counter ~ 40% of the glyph
          const tx = plate.clientWidth / 2 - (w.offsetLeft + cx);
          const ty = plate.clientHeight / 2 - (w.offsetTop + cy);
          return { S, x: tx - S * (ox - cx), y: ty - S * (oy - cy) };
        };
        const tl: gsap.core.Timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            const t = tl.time();
            if (t >= OPEN_AT) setOpen(true);
            else if (t < CLOSE_AT) setOpen(false);
          },
          scrollTrigger: {
            trigger: plate,
            start: "top top",
            end: mobile ? "+=270%" : "+=350%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          w,
          { x: 0, y: 0, scale: 1 },
          { x: () => geo().x, y: () => geo().y, scale: () => geo().S, duration: DIVE, ease: "power3.in" },
          HOLD,
        );
        tl.fromTo(ink.current, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(76% at 50% 50%)", duration: 4, ease: "power2.inOut" }, HOLD + 3);
        tl.set(w, { visibility: "hidden" }, HOLD + DIVE + 0.6);
        const n = { v: 0 };
        tl.to(
          n,
          {
            v: SUIT_RELEASE.totalUnits,
            duration: 2.4,
            ease: "power2.out",
            onUpdate: () => {
              if (counter.current) counter.current.textContent = pad(Math.round(n.v), 3);
            },
          },
          OPEN_AT + 0.4,
        );
        tl.to({}, { duration: 1.2 }, OPEN_AT + 2.8); // hold the finished plate before the pin releases
        return () => setOpen(false);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Plate
      ref={root}
      id="drop"
      num="07"
      label="SUIT-01 — THE INVENTION"
      tone="blanc"
      blend
      className="group h-svh min-h-[600px] overflow-hidden data-[static]:h-auto data-[static]:overflow-visible"
    >
      <h2 className="sr-only">We were bored of normal clothes. So we invented SUIT-01.</h2>

      {/* the statement — the thing that gets fallen into */}
      <div className="absolute inset-0 grid place-items-center group-data-[static]:relative group-data-[static]:inset-auto group-data-[static]:min-h-[80svh]">
        <div ref={wrap} aria-hidden className="relative flex flex-col items-center text-center">
          {/* desktop breaks */}
          <div className="hidden flex-col items-center md:flex">
            <ScrollReveal as="p" className={`${LINE} text-[6vw]`} speed={0.9}>
              WE WERE BORED OF
            </ScrollReveal>
            <ScrollReveal as="p" className={`${LINE} text-[6vw]`} speed={0.9} delay={0.2}>
              NORMAL CLOTHES.
            </ScrollReveal>
            <ScrollReveal as="p" className={`${LINE} text-[6vw]`} speed={0.9} delay={0.4}>
              SO WE INVENTED
            </ScrollReveal>
          </div>
          {/* mobile breaks */}
          <div className="flex flex-col items-center md:hidden">
            {["WE WERE", "BORED OF", "NORMAL", "CLOTHES.", "SO WE", "INVENTED"].map((l, i) => (
              <ScrollReveal key={l} as="p" className={`${LINE} text-[11.4vw]`} speed={0.9} delay={i * 0.12}>
                {l}
              </ScrollReveal>
            ))}
          </div>
          {/* the word that zooms */}
          <div ref={sw} className="relative mt-[0.6vw] w-max">
            <ScrollReveal as="p" className={`${WORD} text-[12.4vw] md:text-[11.4vw]`} speed={0.8} delay={0.7}>
              SUIT-01
            </ScrollReveal>
            {/* invisible twin, identical metrics, used only to locate the zero */}
            <span aria-hidden className={`${WORD} invisible absolute left-0 top-0 text-[12.4vw] md:text-[11.4vw]`}>
              SUIT-<span ref={oRef}>0</span>1
            </span>
          </div>
        </div>
      </div>

      {/* the ink that opens from the centre — everything on it is revealed by the circle itself */}
      <div
        ref={ink}
        className="tone-noir absolute inset-0 z-10 flex flex-col items-center justify-center px-[var(--margin)] group-data-[static]:relative group-data-[static]:inset-auto group-data-[static]:h-svh"
        style={{ clipPath: "circle(0% at 50% 50%)" }}
      >
        <GateReveal open={open} as="p" head={false} speed={2} className="t-label absolute left-[calc(var(--margin)+6px)] top-[calc(var(--header-h)+36px)] opacity-70">
          {`[ ${SUIT_RELEASE.id} — ${SUIT_RELEASE.released} ]`}
        </GateReveal>
        <GateReveal open={open} as="h2" speed={0.7} className="t-dots text-[clamp(4rem,18.6vw,22rem)] leading-[0.95]">
          {SUIT_RELEASE.id}
        </GateReveal>
        <div className="mt-[3vh] flex flex-col items-center gap-2 md:gap-3">
          <GateReveal open={open} as="p" speed={1.1} head={false} className="text-center font-display text-[clamp(0.9rem,2.1vw,2.1rem)] uppercase leading-tight tracking-[-0.03em]">
            ONE STRUCTURE. SOLD WHOLE.
          </GateReveal>
          <GateReveal open={open} as="p" speed={1.1} head={false} className="text-center font-display text-[clamp(0.9rem,2.1vw,2.1rem)] uppercase leading-tight tracking-[-0.03em] opacity-60">
            {`${SUIT_RELEASE.totalUnits} UNITS. ONCE. NO RESTOCK.`}
          </GateReveal>
        </div>

        <div className="absolute inset-x-[calc(var(--margin)+6px)] bottom-[clamp(2.5rem,6vh,4.5rem)] flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <span ref={counter} className="t-dots text-[clamp(3rem,7vw,7rem)]">
              000
            </span>
            <span className="t-dots text-[clamp(1rem,1.8vw,1.75rem)] opacity-50">{`/ ${SUIT_RELEASE.totalUnits}`}</span>
          </div>
          <div className="flex flex-col items-end gap-3">
            <GateReveal open={open} as="span" head={false} speed={2} className="t-label">
              SCROLL
            </GateReveal>
            <span aria-hidden className="h-10 w-px bg-current" />
          </div>
        </div>
      </div>
    </Plate>
  );
}
