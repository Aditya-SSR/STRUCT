"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, useGSAP } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { DROP, dropRemaining } from "@/data/drop";
import Plate from "./parts/Plate";
import { useInView } from "./parts/useInView";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const remaining = dropRemaining();

/** §01 — tone-blanc, 100svh. The wordmark, the live drop status, the architectural object behind. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  // mount the 3D scene only while the hero is (nearly) on screen
  const near = useInView(root, { rootMargin: "25% 0px" });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          })
          .to(".hero-struct", { yPercent: -22 }, 0)
          .to(".hero-scene", { yPercent: 14, scale: 1.08 }, 0)
          .to(".hero-meta", { y: -48 }, 0);
        // the scroll cue: a load line that draws, holds, retracts
        gsap
          .timeline({ repeat: -1, repeatDelay: 0.4 })
          .fromTo(cue.current, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 1.1, ease: "power4.inOut" })
          .to(cue.current, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.9, ease: "power4.inOut" }, "+=0.35");
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cue.current, { scaleY: 1 });
      });
    },
    { scope: root },
  );

  return (
    <Plate ref={root} id="hero" num="01" label="INDEX" tone="blanc" intro className="h-svh min-h-[640px] overflow-hidden">
      {/* 3D object — behind everything, bleeding off the right edge */}
      <div
        className="hero-scene pointer-events-none absolute inset-y-0 right-0 z-0 w-full [mask-image:linear-gradient(to_right,transparent,#000_22%)] md:w-[64%]"
        aria-hidden
      >
        {near && <HeroScene />}
      </div>

      <div className="relative z-10 flex h-full flex-col pad-x pb-[clamp(1.25rem,3vw,2.5rem)] pt-[calc(var(--header-h)+44px)]">
        {/* meta row */}
        <div className="hero-meta grid-12 items-start gap-y-5">
          <div className="col-span-12 flex flex-col gap-1 md:col-span-4">
            <SplitReveal as="p" when="intro" head={false} speed={2} delay={0.1} className="t-label">
              [ EST. 2019 — TOKYO ]
            </SplitReveal>
            <SplitReveal as="p" when="intro" head={false} speed={2} delay={0.2} className="t-label opacity-60">
              35.6762° N / 139.6503° E
            </SplitReveal>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-center">
            <SplitReveal as="p" when="intro" head={false} speed={2} delay={0.15} className="t-label">
              FORM FOLLOWS FUNCTION
            </SplitReveal>
          </div>
          <div className="col-span-12 flex flex-col gap-1.5 md:col-span-4 md:items-end md:text-right">
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 bg-signal" />
              <SplitReveal as="p" when="intro" head={false} speed={2} delay={0.3} className="t-label">
                SYS.STATUS: ACTIVE // NODE 01
              </SplitReveal>
            </div>
            <SplitReveal as="p" when="intro" head={false} speed={1.6} delay={0.35} className="t-dots text-[clamp(1.5rem,2.6vw,2.5rem)]">
              {`${DROP.id} — ${DROP.status}`}
            </SplitReveal>
            <div className="flex items-baseline gap-3">
              <SplitReveal as="p" when="intro" head={false} speed={1.6} delay={0.45} className="t-dots text-[clamp(1.25rem,2vw,1.875rem)]">
                {`${remaining} / ${DROP.totalUnits}`}
              </SplitReveal>
              <SplitReveal as="p" when="intro" head={false} speed={2} delay={0.5} className="t-label opacity-60">
                UNITS REMAINING
              </SplitReveal>
            </div>
          </div>
        </div>
        <LoadLine when="intro" delay={0.6} className="mt-6 w-full opacity-30" />

        <div className="mt-8 max-w-[22ch] md:max-w-[34ch]">
          <SplitReveal as="p" when="intro" speed={1.4} delay={0.7} className="t-lead">
            A Tokyo studio that builds clothing like structures.
          </SplitReveal>
        </div>

        <div className="flex-1" />

        {/* scroll cue */}
        <div className="mb-5 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-px overflow-hidden">
              <div ref={cue} className="absolute inset-0 bg-current" style={{ transform: "scaleY(0)" }} />
            </div>
            <SplitReveal as="span" when="intro" head={false} speed={2} delay={1} className="t-label">
              SCROLL
            </SplitReveal>
          </div>
          <SplitReveal as="span" when="intro" head={false} speed={2} delay={1.1} className="t-label hidden opacity-60 md:block">
            WEAR THE STRUCTURE.
          </SplitReveal>
        </div>

        <h1
          className="hero-struct m-0 -ml-[0.04em] whitespace-nowrap font-display uppercase leading-[0.86] tracking-[-0.05em]"
          style={{ fontSize: "min(17.2vw, 19rem)" }}
        >
          <SplitReveal as="span" when="intro" speed={0.7} delay={0.25} className="block">
            STRUCT
          </SplitReveal>
        </h1>
      </div>
    </Plate>
  );
}
