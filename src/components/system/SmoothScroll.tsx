"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

/**
 * Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger and Lenis share one clock.
 * Reduced motion AND touch-first devices: no Lenis at all (native scrolling, ScrollTrigger still works). On a phone the
 * browser's own compositor-driven scroll is the smooth one; smoothing it in JS only adds latency and per-frame work.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // the URL bar collapsing on a phone fires resize: don't re-measure every pin / trigger for it
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      anchors: true,
      autoRaf: false,
    });
    setLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
