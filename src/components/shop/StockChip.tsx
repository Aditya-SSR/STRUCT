"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitReveal from "@/components/ui/SplitReveal";

/** A steady signal dot that breathes (live / low stock). Static under reduced motion. */
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
    <span
      ref={ref}
      aria-hidden
      className={`inline-block shrink-0 bg-signal ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** `38 LEFT` in the dot-matrix voice. A signal dot appears when fewer than 20 remain. */
export default function StockChip({ remaining, className = "" }: { remaining: number; className?: string }) {
  const low = remaining < 20;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {low && <SignalDot />}
      <SplitReveal as="span" speed={2} head={false} className="t-dots inline-block text-[1.05rem]">
        {`${remaining} LEFT`}
      </SplitReveal>
      {low && <span className="sr-only">Low stock</span>}
    </span>
  );
}
