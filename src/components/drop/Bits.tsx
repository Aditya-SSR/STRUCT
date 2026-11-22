"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";
import type { Garment } from "@/data/drop";
import { isLow, isSoldOut } from "./drop-utils";

/** A steady signal dot that breathes. Static under reduced motion. */
export function SignalDot({ className = "", size = 7 }: { className?: string; size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      gsap.to(ref.current, { opacity: 0.25, duration: 0.9, ease: "power2.inOut", repeat: -1, yoyo: true });
    },
    { scope: ref },
  );
  return (
    <span ref={ref} aria-hidden className={`inline-block shrink-0 bg-signal ${className}`} style={{ width: size, height: size }} />
  );
}

/** `64 LEFT` in Bitcount, signal dot under 25, `SOLD OUT` when none remain. */
export function StockChip({ g, className = "", plain }: { g: Garment; className?: string; plain?: boolean }) {
  const out = isSoldOut(g);
  const low = isLow(g);
  const cls = `t-dots inline-block text-[1rem] ${out ? "text-smoke" : ""}`;
  const label = out ? "SOLD OUT" : `${g.units.remaining} LEFT`;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {low && <SignalDot />}
      {plain ? (
        <span className={cls} style={{ visibility: "hidden" }}>
          {label}
        </span>
      ) : (
        <SplitReveal as="span" speed={2} head={false} className={cls}>
          {label}
        </SplitReveal>
      )}
      {low && <span className="sr-only">Low stock</span>}
    </span>
  );
}
