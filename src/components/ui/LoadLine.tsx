"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useUI } from "@/store/ui";

type Props = {
  orientation?: "h" | "v";
  className?: string;
  /** line thickness in px */
  thickness?: number;
  delay?: number;
  duration?: number;
  when?: "scroll" | "intro" | "mount";
  /** draw from the end instead of the start */
  reverse?: boolean;
  /** use the signal colour (use sparingly — one per viewport) */
  signal?: boolean;
};

/**
 * The STRUCT "load line": a hairline that draws itself. Colour follows `currentColor`.
 * Give it a width/height via className, e.g. <LoadLine className="w-full" />  or  <LoadLine orientation="v" className="h-40" />
 */
export default function LoadLine({
  orientation = "h",
  className = "",
  thickness = 1,
  delay = 0,
  duration = 1.4,
  when = "scroll",
  reverse,
  signal,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const h = orientation === "h";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const prop = h ? "scaleX" : "scaleY";
      if (prefersReducedMotion()) {
        gsap.set(el, { [prop]: 1 });
        return;
      }
      const draw = () =>
        gsap.to(el, {
          [prop]: 1,
          duration,
          delay,
          ease: "power4.inOut",
          scrollTrigger: when === "scroll" ? { trigger: el, start: "top 92%", once: true } : undefined,
        });
      if (when === "intro" && !useUI.getState().introDone) {
        // wait for the preloader / page-transition cover without subscribing React to the store
        const unsub = useUI.subscribe((st) => {
          if (!st.introDone) return;
          unsub();
          draw();
        });
        return unsub;
      }
      draw();
    },
    { scope: ref, dependencies: [when] },
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={className}
      style={{
        background: signal ? "var(--signal)" : "currentColor",
        [h ? "height" : "width"]: thickness,
        transform: h ? "scaleX(0)" : "scaleY(0)",
        transformOrigin: h ? (reverse ? "right center" : "left center") : reverse ? "center bottom" : "center top",
      }}
    />
  );
}
