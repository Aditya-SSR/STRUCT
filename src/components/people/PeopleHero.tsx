"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useUI } from "@/store/ui";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";
import { Datum } from "@/components/ui/Datum";
import ScrollCue from "./ScrollCue";
import { heroCss } from "./heroStyles";

/**
 * Landing hero for /people: the founder's photograph, full-bleed, framed by a hairline plate with datum crosses.
 * Headline + lead sit in the open sky either side of the figure; the face is never covered.
 * The fixed header drops its difference blend while this hero is under it (html[data-header-photo], see Header.tsx).
 */
export default function PeopleHero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // header over the photo: normal blend + paper text while the hero is under the header
      const html = document.documentElement;
      const mark = (on: boolean) => {
        if (on) html.setAttribute("data-header-photo", "");
        else html.removeAttribute("data-header-photo");
      };
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom 36px",
        onToggle: (self) => mark(self.isActive),
      });
      mark(st.isActive);

      // intro: curtain opens from the centre while the photo settles from 1.08 to 1
      let unsub: (() => void) | undefined;
      if (!prefersReducedMotion() && media.current && zoom.current) {
        const m = media.current;
        const z = zoom.current;
        gsap.set(m, { clipPath: "inset(0% 50% 0% 50%)" });
        gsap.set(z, { scale: 1.08 });
        const run = () => {
          gsap.to(m, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "resolve", clearProps: "clipPath" });
          gsap.to(z, { scale: 1, duration: 2.2, ease: "expo.out", clearProps: "transform" });
        };
        if (useUI.getState().introDone) run();
        else {
          unsub = useUI.subscribe((u) => {
            if (!u.introDone) return;
            unsub?.();
            run();
          });
        }
      }

      return () => {
        unsub?.();
        mark(false);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} data-header-tone="dark" aria-label="The people" className="ph-hero">
      <style>{heroCss}</style>
      <div ref={media} className="ph-media">
        <div ref={zoom} className="ph-zoom">
          <Image
            src="/img/people-hero.webp"
            alt="A calm man in a plain white mock-neck top, eyes closed, against a deep teal sky and bare branches."
            fill
            priority
            sizes="100vw"
            className="ph-img"
          />
        </div>
        <div className="ph-shade" aria-hidden />
      </div>

      {/* hairline frame + datum crosses */}
      <div className="ph-frame text-paper/45" aria-hidden>
        <LoadLine className="absolute inset-x-0 top-0" when="intro" delay={0.2} duration={1.6} />
        <LoadLine className="absolute inset-x-0 bottom-0" when="intro" delay={0.2} duration={1.6} reverse />
        <LoadLine orientation="v" className="absolute inset-y-0 left-0" when="intro" delay={0.2} duration={1.6} />
        <LoadLine orientation="v" className="absolute inset-y-0 right-0" when="intro" delay={0.2} duration={1.6} reverse />
        <Datum className="absolute -left-[5px] -top-[5px] text-paper" />
        <Datum className="absolute -right-[5px] -top-[5px] text-paper" />
        <Datum className="absolute -bottom-[5px] -left-[5px] text-paper" />
        <Datum className="absolute -bottom-[5px] -right-[5px] text-paper" />
      </div>

      <div className="ph-content">
        <div className="flex items-start justify-between gap-6">
          <SplitReveal className="t-label" when="intro" delay={0.1} speed={2} head={false}>
            [ KIBA, TOKYO — SINCE 2019 ]
          </SplitReveal>
          <SplitReveal className="t-label text-right" when="intro" delay={0.2} speed={2} head={false}>
            PEOPLE / 04
          </SplitReveal>
        </div>

        <div>
          <div className="ph-main">
            <SplitReveal as="h1" className="ph-title font-display uppercase" when="intro" delay={0.3}>
              The people who resolve.
            </SplitReveal>
            <SplitReveal className="ph-lead font-mono" when="intro" delay={0.8} speed={1.6} head={false}>
              Four people from four disciplines resigned from four design jobs in the same week of 2019. An architect, a pattern cutter, a textile engineer, a type designer. They met on a Sunday on the top floor of a closed rope factory. They stayed.
            </SplitReveal>
          </div>

          <div className="mt-6 flex items-end justify-between gap-6 md:mt-8">
            <div className="flex items-baseline gap-3">
              <SplitReveal className="t-dots text-[1.75rem] md:text-[2.25rem]" when="intro" delay={1} speed={2} head={false}>
                04
              </SplitReveal>
              <SplitReveal className="t-label" when="intro" delay={1.05} speed={2} head={false}>
                / FOUNDERS
              </SplitReveal>
            </div>
            <ScrollCue delay={1.15} />
          </div>
        </div>
      </div>
    </section>
  );
}
