"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap";
import { resolveSplit } from "@/lib/resolveText";
import { MANIFESTO } from "@/data/brand";
import Plate from "./parts/Plate";

const WORDS = MANIFESTO.principle as readonly string[];
// share of the available width each giant word fills
const FILL = [0.62, 0.8, 0.97];
const SIDE = ["THE BODY, AS AN ARCHITECTURAL FORM", "EVERY SEAM, JOINT AND PANEL", "NOTHING ELSE IS LEFT"];

/** Splits the body copy around FORM / FOLLOWS / FUNCTION so those three can be lifted out as live elements. */
const PARTS = MANIFESTO.principleBody.split(/\b(form|follows|function)\b/i);

// deterministic "random" so a refresh never re-rolls the flight paths
const hash = (i: number) => (((Math.sin(i * 91.7 + 13.3) * 43758.5453) % 1) + 1) % 1;

/**
 * §02 — FORM / FOLLOWS / FUNCTION. Pinned and scrubbed.
 * 1. The sentence (and its three Monument words) RESOLVES in when the section arrives (dot flicker, scan head, letters).
 * 2. Pinned: the other words fly off while the three Monument words travel (transform only: translate + uniform scale)
 *    from their place in the sentence to their place in the giant stack.
 *
 * Why the start offsets are NOT lazy tween values: GSAP initialises a function-based tween value the first time the
 * playhead reaches it, so after any refresh (fonts, images, resize) a stale measurement stayed live until the user
 * scrolled through it: FORM landed in the wrong place on the first scroll-through and "fixed itself" on the way back.
 * Here the three offsets are measured eagerly (setup, every ScrollTrigger refresh, fonts.ready) into `m`, and a plain
 * 0-to-1 progress per word applies them, so a re-measure takes effect immediately, mid-scrub or not.
 */
export default function Principles() {
  const root = useRef<HTMLElement>(null);
  const para = useRef<HTMLParagraphElement>(null);
  const stack = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const plate = root.current;
      const p = para.current;
      const st = stack.current;
      if (!plate || !p || !st) return;

      const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", st);
      const giants = slots.map((s) => s.querySelector<HTMLElement>("[data-giant]")!);
      const placeholders = gsap.utils.toArray<HTMLElement>("[data-pl]", p).sort((a, b) => +a.dataset.pl! - +b.dataset.pl!);

      /** fit each giant word to its share of the width, then shrink the stack together if it is too tall */
      const fit = () => {
        const cs = getComputedStyle(st);
        // viewport-derived (not st.clientWidth/Height): while the plate is pinned, ScrollTrigger holds its old pixel size until the refresh completes
        const W = document.documentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const H = Math.max(640, window.innerHeight) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const sizes = giants.map((g, i) => {
          g.style.fontSize = "100px";
          return (100 * FILL[i] * W) / g.offsetWidth;
        });
        const extras = giants.length * 44 + 2 * 0.03 * window.innerHeight; // seam + caption + row gaps
        const words = sizes.reduce((n, s) => n + s * 0.9, 0);
        const k = Math.min(1, Math.max(0.3, (H - extras) / words));
        giants.forEach((g, i) => (g.style.fontSize = `${sizes[i] * k}px`));
      };

      // eager measurement of where each giant starts: the offset (x, y) and uniform scale that place it exactly over its
      // placeholder in the sentence. Differences of two rects, so independent of pin / scroll / any transform on the giant.
      const m = giants.map(() => ({ x: 0, y: 0, s: 1 }));
      const prog = giants.map(() => ({ k: 0 }));
      let live = false; // true only while the pinned (motion) layout is active
      const render = (i: number) => {
        if (!live) return;
        // written straight to the element: ScrollTrigger refreshes call this from inside other components' gsap contexts,
        // where a selector-resolving gsap.set() would warn "Invalid scope"
        const { k } = prog[i];
        giants[i].style.transform = `translate3d(${m[i].x * (1 - k)}px, ${m[i].y * (1 - k)}px, 0) scale(${m[i].s + (1 - m[i].s) * k})`;
      };
      const measure = () => {
        giants.forEach((_, i) => {
          const s = placeholders[i].getBoundingClientRect();
          const t = slots[i].getBoundingClientRect();
          if (!t.width || !s.width) return;
          m[i] = { x: s.left - t.left, y: s.top + s.height / 2 - (t.top + t.height / 2), s: s.width / t.width };
          render(i);
        });
      };
      const layout = () => {
        fit();
        measure();
      };
      const onRefresh = () => measure();
      fit();

      let alive = true;
      document.fonts?.ready.then(() => alive && layout());
      ScrollTrigger.addEventListener("refreshInit", fit);
      ScrollTrigger.addEventListener("refresh", onRefresh);

      const mm = gsap.matchMedia();
      mm.add({ all: "(min-width: 0px)", motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };

        // reduced motion: the sentence, then the three words stacked beneath it. No pin, no scrub.
        if (!motion) {
          plate.setAttribute("data-static", "");
          gsap.set(p, { visibility: "visible" });
          gsap.set(st, { visibility: "visible" });
          gsap.set(st.querySelectorAll("[data-seam]"), { scaleX: 1 });
          gsap.set(st.querySelectorAll("[data-num]"), { clipPath: "none" });
          gsap.set("[data-dot]", { scale: 1 });
          fit();
          return () => plate.removeAttribute("data-static");
        }

        // sentence + the three Monument placeholders, split for the RESOLVE reveal (and the later fly-off)
        const split = SplitText.create(p, { type: "lines,words,chars", wordsClass: "inline-block will-change-transform" });
        const flyers = split.words.filter((w) => !w.closest("[data-pl]"));
        gsap.set(p, { visibility: "visible" });
        gsap.set(st, { visibility: "visible" });
        gsap.set(giants, { autoAlpha: 0 }); // the stack takes over from the sentence's Monument words
        giants.forEach((g) => (g.style.transformOrigin = "0% 50%"));
        live = true;
        layout();

        let resolved = false;
        const flatten = () => {
          // scaffolding is gone: drop the char / line wrappers so the paragraph reflows naturally from here on (resize-safe)
          split.chars.forEach((c) => c.replaceWith(document.createTextNode(c.textContent ?? "")));
          split.lines.forEach((l) => l.replaceWith(...Array.from(l.childNodes), document.createTextNode(" ")));
          resolved = true;
          measure();
        };
        const reveal = resolveSplit(p, split, { speed: 1.5, paused: true, onComplete: flatten });
        const play = () => reveal.tl.play();
        const arrive = ScrollTrigger.create({ trigger: p, start: "top 70%", once: true, onEnter: play });

        const T = 0.5; // the sentence is held for a beat after the pin begins
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate() {
            // never fly half-resolved text: if the reader outruns the reveal, finish it fast
            if (!resolved && tl.progress() > 0.02) {
              play();
              reveal.tl.timeScale(4);
            }
          },
          scrollTrigger: {
            trigger: plate,
            start: "top top",
            end: mobile ? "+=190%" : "+=260%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1 — the Monument words hand over to the stack, and the other words fly off
        tl.set(placeholders, { autoAlpha: 0 }, T);
        tl.set(giants, { autoAlpha: 1 }, T);
        tl.to(
          flyers,
          {
            xPercent: (i: number) => (hash(i) - 0.5) * (mobile ? 220 : 420),
            yPercent: (i: number) => -(120 + hash(i + 40) * (mobile ? 200 : 380)),
            rotation: (i: number) => (hash(i + 80) - 0.5) * (mobile ? 50 : 120),
            rotationX: mobile ? 0 : 55,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
            stagger: { amount: 0.9, from: "start" },
          },
          T,
        );

        // 2 — the three words travel from the sentence into the stack
        giants.forEach((_, i) => {
          tl.fromTo(prog[i], { k: 0 }, { k: 1, duration: 1.5, ease: "power3.inOut", onUpdate: () => render(i) }, T + 0.55 + i * 0.12);
        });

        // 3 — the stack resolves: seam under each word, index + caption wipe in, the one signal datum lands
        tl.fromTo("[data-seam]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power4.inOut", stagger: 0.12 }, T + 2.0);
        tl.fromTo("[data-num]", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.6, stagger: 0.12, ease: "power2.out" }, T + 2.1);
        tl.fromTo("[data-dot]", { scale: 0 }, { scale: 1, duration: 0.3, ease: "power2.out" }, T + 2.55);
        tl.to({}, { duration: 0.6 }); // hold the landed tagline

        return () => {
          arrive.kill();
          reveal.tl.kill();
          reveal.cleanup();
          live = false;
          prog.forEach((o) => (o.k = 0));
          giants.forEach((g) => {
            g.style.transform = "";
            g.style.transformOrigin = "";
          });
          split.revert();
        };
      });

      return () => {
        alive = false;
        ScrollTrigger.removeEventListener("refreshInit", fit);
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <Plate
      ref={root}
      id="principles"
      num="02"
      label="FORM / FOLLOWS / FUNCTION"
      tone="blanc"
      className="group h-svh min-h-[640px] overflow-hidden data-[static]:h-auto data-[static]:overflow-visible"
    >
      <h2 className="sr-only">Form follows function</h2>

      {/* the sentence */}
      <div className="absolute inset-0 flex items-center justify-center pad-x pt-[var(--header-h)] group-data-[static]:relative group-data-[static]:inset-auto group-data-[static]:py-28">
        <p
          ref={para}
          style={{ visibility: "hidden" }}
          className="max-w-[30ch] text-center font-mono text-[clamp(1.05rem,2.5vw,2.6rem)] leading-[1.55] tracking-[-0.015em] md:max-w-[34ch]"
        >
          {PARTS.map((s, i) => {
            const idx = WORDS.indexOf(s.toUpperCase());
            return idx >= 0 ? (
              <span key={i} data-pl={idx} className="inline-block font-display uppercase leading-[0.9] tracking-[-0.04em]">
                {s.toUpperCase()}
              </span>
            ) : (
              s
            );
          })}
        </p>
      </div>

      {/* the giant stack — hidden until JS has measured it, so without JS the sentence simply reads */}
      <div
        ref={stack}
        aria-hidden
        style={{ visibility: "hidden" }}
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-[3vh] pad-x pb-10 pt-[calc(var(--header-h)+28px)] group-data-[static]:relative group-data-[static]:inset-auto group-data-[static]:h-[80svh]"
      >
        {WORDS.map((w, i) => (
          <div key={w} className={`flex ${i === 1 ? "justify-end" : "justify-start"}`}>
            <div className="w-max max-w-full">
              <div data-slot className="relative w-max">
                <span
                  data-giant
                  className="block whitespace-nowrap font-display uppercase leading-[0.9] tracking-[-0.04em]"
                  style={{ fontSize: `${[11, 9.6, 8.6][i]}vw` }}
                >
                  {w}
                </span>
                {i === 2 && (
                  <span
                    data-dot
                    aria-hidden
                    className="absolute -right-[1.3vw] bottom-[1.3vw] block h-[1.1vw] min-h-2 w-[1.1vw] min-w-2 bg-signal"
                    style={{ transform: "scale(0)" }}
                  />
                )}
              </div>
              <div data-seam className="mt-1 h-px w-full origin-left bg-current" style={{ transform: "scaleX(0)" }} />
              <div data-num className="mt-2 flex items-baseline justify-between gap-6" style={{ clipPath: "inset(0 0 100% 0)" }}>
                <span className="t-dots text-[clamp(1rem,1.6vw,1.5rem)]">{`0${i + 1}`}</span>
                <span className="t-label opacity-60">{SIDE[i]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Plate>
  );
}
