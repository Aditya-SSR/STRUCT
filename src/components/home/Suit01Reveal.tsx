"use client";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Datum } from "@/components/ui/Datum";
import GateReveal from "./parts/GateReveal";
import HomeImg from "./parts/HomeImg";
import Plate from "./parts/Plate";
import SuitPanels from "./SuitPanels";
import SuitFinale from "./SuitFinale";

// timeline (units; the pin maps the whole timeline onto ~8.4 viewport-heights of scroll)
const T = {
  line: [0, 1.0],
  frame: [0.8, 2.2],
  titleIn: [1.9, 2.9], // the dot-matrix SUIT-01 (already resolved in §07) is drawn open from the centre inside the frame
  swap: [3.4, 4.3], // dots wipe up, Monument rises
  open: [4.8, 7.4], // the frame opens to full-bleed
  titleOut: [6.2, 7.0],
  hud: [7.2, 10.2],
  veil: [10.0, 11.2],
  strip: [10.4, 16.4],
  end: 17,
};
const TITLE = "SUIT-01";

/**
 * §08 — THE reveal. The first time the suit is shown, and the last section before the footer.
 * Pinned + scrubbed: ink · a white load line · a frame forms · SUIT-01 assembles in dots and resolves to Monument ·
 * the frame opens onto the studio · four SKU panels pass under ONE continuous line · then (unpinned) the pieces,
 * SOLD WHOLE., the price and the way in. §07 has just resolved the dot-matrix word, so here it is not re-resolved:
 * it is drawn open inside the frame, then wiped up into Monument.
 */
export default function Suit01Reveal() {
  const stage = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const [hudOpen, setHudOpen] = useState(false);
  const [seen, setSeen] = useState<boolean[]>([false, false, false, false, false]);

  useGSAP(
    () => {
      const el = stage.current;
      const tr = track.current;
      const ln = line.current;
      if (!el || !tr || !ln) return;
      const q = gsap.utils.selector(el);
      // children of the track: [lead block, 4 panels, the line]
      const panels = (gsap.utils.toArray(tr.children) as HTMLElement[]).filter((c) => c !== ln);

      const mm = gsap.matchMedia();
      mm.add({ all: "(min-width: 0px)", motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };

        // ── reduced motion: photo, title and the strip as an ordinary scrollable row. No pin, no scrub.
        if (!motion) {
          el.setAttribute("data-static", "");
          gsap.set(q("[data-photo], [data-strip], [data-title]"), { visibility: "visible" });
          gsap.set(q("[data-mono]"), { clipPath: "none" });
          gsap.set(q("[data-dots]"), { display: "none" });
          gsap.set(ln, { scaleX: 1 });
          setSeen([true, true, true, true, true]);
          return () => el.removeAttribute("data-static");
        }

        const from = mobile ? { t: 32, r: 8, b: 32, l: 8 } : { t: 22, r: 22, b: 22, l: 22 };
        const clipFrom = `inset(${from.t}% ${from.r}% ${from.b}% ${from.l}%)`;
        const px = (i: number, x: number) => panels[i].offsetLeft + x < window.innerWidth * 0.9;

        const tl: gsap.core.Timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            const t = tl.time();
            setHudOpen((o) => (t >= T.hud[0] && t < T.hud[1] ? true : t < T.hud[0] - 0.8 || t > T.hud[1] + 0.6 ? false : o));
            if (t < T.strip[0] - 0.4) setSeen((s) => (s.some(Boolean) ? s.map(() => false) : s));
            else {
              const x = +gsap.getProperty(tr, "x");
              setSeen((s) => {
                const n = s.map((v, i) => v || px(i, x));
                return n.every((v, i) => v === s[i]) ? s : n;
              });
            }
          },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * (mobile ? 6.4 : 8.4))}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.set(q("[data-photo], [data-frame], [data-title], [data-strip]"), { visibility: "visible" });

        // 1 — a white load line draws across the ink
        tl.fromTo(q("[data-cline]"), { scaleX: 0 }, { scaleX: 1, duration: T.line[1] - T.line[0], ease: "power4.inOut" }, T.line[0]);

        // 2 — a thin frame forms around the centre; the line withdraws into it
        const fl = T.frame[0];
        const fd = T.frame[1] - T.frame[0];
        tl.fromTo(q("[data-fh]"), { scaleX: 0 }, { scaleX: 1, duration: fd, ease: "power4.inOut" }, fl);
        tl.fromTo(q("[data-fv]"), { scaleY: 0 }, { scaleY: 1, duration: fd, ease: "power4.inOut" }, fl + 0.15);
        tl.fromTo(q("[data-fd]"), { scale: 0 }, { scale: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, fl + fd - 0.4);
        tl.to(q("[data-cline]"), { scaleX: 0, duration: 0.8, ease: "power4.inOut" }, T.frame[1] - 0.2);

        // 3 — dots → Monument: the dot glyphs are wiped up while the real letters rise through them
        tl.fromTo(q("[data-dots]"), { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.titleIn[1] - T.titleIn[0], ease: "power3.out" }, T.titleIn[0]);
        tl.fromTo(q("[data-dots]"), { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: T.swap[1] - T.swap[0], ease: "power3.inOut", immediateRender: false }, T.swap[0]);
        tl.fromTo(q("[data-mono]"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.swap[1] - T.swap[0], ease: "power3.inOut" }, T.swap[0] + 0.1);

        // 4 — the frame opens onto the studio, the photograph pushes in
        const od = T.open[1] - T.open[0];
        // the studio is hidden until the frame is ready: it shutters open from a centre line to the frame, then to full-bleed
        tl.fromTo(q("[data-photo]"), { clipPath: `inset(50% ${from.r}% 50% ${from.l}%)` }, { clipPath: clipFrom, duration: 0.8, ease: "power3.out" }, T.open[0] - 0.8);
        tl.fromTo(q("[data-photo]"), { clipPath: clipFrom }, { clipPath: "inset(0% 0% 0% 0%)", duration: od, ease: "power4.inOut", immediateRender: false }, T.open[0]);
        tl.fromTo(
          q("[data-frame]"),
          { top: `${from.t}%`, right: `${from.r}%`, bottom: `${from.b}%`, left: `${from.l}%` },
          { top: "0%", right: "0%", bottom: "0%", left: "0%", duration: od, ease: "power4.inOut" },
          T.open[0],
        );
        tl.fromTo(q("[data-push]"), { scale: 1 }, { scale: 1.2, duration: T.veil[1] - T.open[0] + 0.8 }, T.open[0] - 0.8);
        tl.fromTo(
          q("[data-photo] img"),
          { objectPosition: mobile ? "22% 50%" : "44% 50%" },
          { objectPosition: mobile ? "80% 50%" : "58% 50%", duration: T.veil[1] - T.open[0] + 0.8 },
          T.open[0] - 0.8,
        );
        tl.to(q("[data-title]"), { clipPath: "inset(0% 0% 100% 0%)", duration: T.titleOut[1] - T.titleOut[0], ease: "power3.inOut" }, T.titleOut[0]);

        // 5 — the photograph gives way to ink; four panels pass under one line
        tl.fromTo(q("[data-veil]"), { opacity: 0 }, { opacity: 1, duration: T.veil[1] - T.veil[0] }, T.veil[0]);
        const sd = T.strip[1] - T.strip[0];
        tl.fromTo(tr, { x: () => window.innerWidth }, { x: () => -(tr.scrollWidth - window.innerWidth), duration: sd }, T.strip[0]);
        tl.fromTo(ln, { scaleX: 0 }, { scaleX: 1, duration: sd }, T.strip[0]);
        tl.to({}, { duration: T.end - T.strip[1] }, T.strip[1]); // hold before the pin releases
      });
      return () => mm.revert();
    },
    { scope: stage },
  );

  return (
    <div id="suit-01">
      <Plate
        ref={stage}
        num="08"
        label="SUIT-01 — THE FIRST COMPLETE STRUCTURE"
        tone="noir"
        className="group h-svh min-h-[620px] overflow-hidden data-[static]:h-auto data-[static]:overflow-visible"
      >
        <h2 className="sr-only">SUIT-01. Four pieces, cut as one structure, sold whole.</h2>

        {/* the studio, seen through the frame */}
        <div
          data-photo
          className="absolute inset-0 group-data-[static]:relative group-data-[static]:h-[70svh]"
          style={{ visibility: "hidden" }}
        >
          <div data-push className="absolute inset-0 will-change-transform">
            <HomeImg k="group-wide-a" alt="Four people in SUIT-01, black and white, in a white architectural studio set" sizes="100vw" position="44% 50%" />
          </div>
        </div>
        <div data-veil aria-hidden className="absolute inset-0 bg-ink group-data-[static]:hidden" style={{ opacity: 0 }} />

        {/* the white load line and the frame it becomes */}
        <div aria-hidden className="pointer-events-none absolute inset-0 group-data-[static]:hidden">
          <div data-cline className="absolute inset-x-0 top-1/2 h-px origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
          <div data-frame className="absolute" style={{ visibility: "hidden", top: "22%", right: "22%", bottom: "22%", left: "22%" }}>
            <div data-fh className="absolute inset-x-0 top-0 h-px origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
            <div data-fh className="absolute inset-x-0 bottom-0 h-px origin-right bg-paper" style={{ transform: "scaleX(0)" }} />
            <div data-fv className="absolute inset-y-0 left-0 w-px origin-bottom bg-paper" style={{ transform: "scaleY(0)" }} />
            <div data-fv className="absolute inset-y-0 right-0 w-px origin-top bg-paper" style={{ transform: "scaleY(0)" }} />
            {["-left-1.5 -top-1.5", "-right-1.5 -top-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map((c) => (
              <span key={c} data-fd className={`absolute text-paper ${c}`} style={{ transform: "scale(0)" }}>
                <Datum />
              </span>
            ))}
          </div>
        </div>

        {/* SUIT-01: assembles in Bitcount dots, then resolves to Monument */}
        <div
          data-title
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] grid place-items-center text-paper mix-blend-difference group-data-[static]:bottom-auto group-data-[static]:h-[70svh]"
          style={{ visibility: "hidden" }}
        >
          <div className="relative grid place-items-center">
            <div data-dots style={{ clipPath: "inset(0% 50% 0% 50%)" }}>
              <p className="t-dots whitespace-nowrap text-[17.5vw] leading-none md:text-[12vw]">{TITLE}</p>
            </div>
            <div data-mono className="absolute inset-0 grid place-items-center" style={{ clipPath: "inset(100% 0% 0% 0%)" }}>
              <span className="whitespace-nowrap font-display text-[12.4vw] uppercase leading-none tracking-[-0.04em] md:text-[8.7vw]">{TITLE}</span>
            </div>
          </div>
        </div>

        {/* HUD over the photograph */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[calc(var(--margin)+6px)] bottom-[calc(var(--margin)+10px)] z-[5] flex items-end justify-between text-paper mix-blend-difference group-data-[static]:hidden"
        >
          <GateReveal open={hudOpen} as="p" head={false} speed={2} className="t-label">
            SUIT-01 — SOLD SEPARATELY. SOLD WHOLE.
          </GateReveal>
          <GateReveal open={hudOpen} as="p" head={false} speed={2} className="t-label">
            COAT / TUNIC / TROUSER / BELT
          </GateReveal>
        </div>

        <SuitPanels trackRef={track} lineRef={line} seen={seen} />
      </Plate>

      <SuitFinale />
    </div>
  );
}
