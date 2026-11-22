"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import ScrollReveal from "./parts/ScrollReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Fig, Corners } from "@/components/ui/Datum";
import { METHOD } from "@/data/brand";
import { pad } from "@/lib/utils";
import Plate from "./parts/Plate";
import { useInView } from "./parts/useInView";
import { flickerSwap } from "./parts/flicker";

const LoadRibbon = dynamic(() => import("@/components/three/LoadRibbon"), { ssr: false });

/**
 * §03 — KŌZŌ: LOAD / LINE / RESOLVE. tone-noir.
 * Desktop: the left column is pinned for the whole section while three step cards scroll past on the right;
 * the Bitcount counter, the ticks and the ribbon frame react to each step change. Mobile: plain stack.
 */
export default function Method() {
  const root = useRef<HTMLElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const ribbonBox = useRef<HTMLDivElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const showRibbon = useInView(root, { rootMargin: "30% 0px" });

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const mm = gsap.matchMedia();
      mm.add({ all: "(min-width: 0px)", motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        const cards = gsap.utils.toArray<HTMLElement>("[data-step]", section);
        const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]", section);
        const marks = gsap.utils.toArray<HTMLElement>("[data-mark]", section);
        let current = -1;

        const setStep = (i: number, animate: boolean) => {
          if (i === current) return;
          current = i;
          marks.forEach((m, k) => gsap.to(m, { opacity: k === i ? 1 : 0.3, duration: 0.4, ease: "power2.out", overwrite: true }));
          ticks.forEach((t, k) => gsap.to(t, { scaleX: k <= i ? 1 : 0, duration: 0.7, ease: "power4.inOut", overwrite: true }));
          if (!animate || !motion) {
            if (counter.current) counter.current.textContent = pad(i + 1);
            return;
          }
          if (counter.current) flickerSwap(counter.current, pad(i + 1));
          // the ribbon "answers": a seam sweeps down its frame and the frame settles
          gsap.fromTo(sweep.current, { yPercent: -100, opacity: 1 }, { yPercent: 100, duration: 1.1, ease: "power4.inOut" });
          gsap.fromTo(ribbonBox.current, { scale: 1.05 }, { scale: 1, duration: 1.3, ease: "expo.out" });
        };
        setStep(0, false);

        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 58%",
            end: "bottom 58%",
            onToggle: (self) => self.isActive && setStep(i, true),
          });
        });

        if (motion) {
          gsap.fromTo(
            bar.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { trigger: section, start: "top 40%", end: "bottom bottom", scrub: 0.5 } },
          );
        } else gsap.set(bar.current, { scaleX: 1 });

        if (desktop) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            pin: left.current,
            pinSpacing: false,
            anticipatePin: 1,
          });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Plate ref={root} id="method" num="03" label="KŌZŌ — THE METHOD" tone="noir" className="md:grid md:grid-cols-12 md:gap-x-[var(--gutter)] pad-x">
      <h2 className="sr-only">KŌZŌ: load, line, resolve</h2>

      {/* left — pinned on desktop */}
      <div className="md:col-span-5">
      <div ref={left} className="flex flex-col pb-10 pt-[calc(var(--header-h)+56px)] md:h-svh md:min-h-[640px] md:pb-12">
        <Fig>
          <ScrollReveal as="span" head={false} speed={2}>
            FIG. 04 — KŌZŌ 構造
          </ScrollReveal>
        </Fig>
        <div className="mt-6 flex items-end gap-4">
          <span ref={counter} className="t-dots text-[clamp(4rem,9vw,9rem)]">
            01
          </span>
          <span className="t-dots pb-[1.2vw] text-[clamp(1.25rem,2.2vw,2.25rem)] opacity-50">/ 03</span>
        </div>

        {/* ribbon frame */}
        <div className="relative my-6 min-h-[42svh] flex-1 md:min-h-0">
          <div className="absolute inset-0">
          <Corners className="h-full w-full">
            <div ref={ribbonBox} className="absolute inset-3 overflow-hidden will-change-transform">
              {showRibbon && <LoadRibbon />}
              <div
                ref={sweep}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-paper"
                style={{ opacity: 0, transform: "translateY(-100%)" }}
              />
            </div>
          </Corners>
          </div>
        </div>

        {/* step index with progress ticks */}
        <ul className="flex flex-col gap-2.5" aria-hidden>
          {METHOD.map((m, i) => (
            <li key={m.n} data-mark className="flex items-center gap-3" style={{ opacity: i === 0 ? 1 : 0.3 }}>
              <span className="t-label w-6">{m.n}</span>
              <span className="relative h-px flex-1 bg-current/20">
                <span data-tick className="absolute inset-0 origin-left bg-current" style={{ transform: i === 0 ? "scaleX(1)" : "scaleX(0)" }} />
              </span>
              <span className="t-label w-20 text-right">{m.word}</span>
            </li>
          ))}
        </ul>
        <div className="relative mt-5 h-px w-full bg-current/15" aria-hidden>
          <div ref={bar} className="absolute inset-0 origin-left bg-current" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
      </div>

      {/* right — the three steps */}
      <div className="md:col-span-6 md:col-start-7">
        {METHOD.map((m, i) => (
          <article
            key={m.n}
            data-step
            className="relative flex flex-col justify-center gap-6 py-16 md:min-h-svh md:gap-8 md:py-24"
          >
            <LoadLine className="absolute left-0 top-0 w-full opacity-40" duration={1.6} />
            <div className="flex items-center justify-between">
              <ScrollReveal as="span" head={false} speed={2} className="t-label">
                {`STEP ${m.n} / 03`}
              </ScrollReveal>
              <span lang="ja" className="t-label opacity-60">
                {m.jp}
              </span>
            </div>
            <ScrollReveal as="h3" className="t-h1" speed={1}>
              {m.word}
            </ScrollReveal>
            <ScrollReveal as="p" className="t-lead max-w-[34ch]" speed={1.5}>
              {m.body}
            </ScrollReveal>
            <p className="t-label opacity-50" aria-hidden>
              {i < METHOD.length - 1 ? "→ NEXT: " + METHOD[i + 1].word : "→ WHAT IS LEFT IS THE GARMENT"}
            </p>
          </article>
        ))}
      </div>
    </Plate>
  );
}
