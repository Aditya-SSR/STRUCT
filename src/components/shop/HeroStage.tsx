"use client";
import dynamic from "next/dynamic";

// Decorative 3D object (three agent's contract). Client-only, lazy, never blocks the hero text.
const ObjectStage = dynamic(() => import("@/components/three/ObjectStage"), { ssr: false });

/** The ring that floats behind SUIT-01. Purely decorative: hidden from assistive tech. */
export default function HeroStage() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden md:block md:-right-[1vw] md:top-[6%] md:h-[32vw] md:w-[32vw]"
    >
      <ObjectStage kind="ring" tone="noir" className="absolute inset-0" />
    </div>
  );
}
