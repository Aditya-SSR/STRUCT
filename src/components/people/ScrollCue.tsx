"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";
import LoadLine from "@/components/ui/LoadLine";

/** SCROLL label + a hairline with a tick that travels down it. Static under reduced motion. */
export default function ScrollCue({ delay = 1.1 }: { delay?: number }) {
  const root = useRef<HTMLDivElement>(null);
  const tick = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = tick.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el,
        { yPercent: -100 },
        { yPercent: 260, duration: 1.7, ease: "power2.inOut", repeat: -1, repeatDelay: 0.5, delay: delay + 1 },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex items-center gap-3">
      <SplitReveal className="t-label" when="intro" delay={delay} speed={2} head={false}>
        SCROLL
      </SplitReveal>
      <div className="relative h-10 w-px overflow-hidden" aria-hidden>
        <LoadLine orientation="v" className="h-full w-px text-paper/60" when="intro" delay={delay} duration={1} />
        <span ref={tick} className="absolute left-0 top-0 block h-4 w-px bg-paper" />
      </div>
    </div>
  );
}
