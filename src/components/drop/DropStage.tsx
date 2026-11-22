"use client";
import dynamic from "next/dynamic";

// Decorative 3D object (three agent's contract). Client-only, lazy, desktop-only, never blocks the hero text.
const ObjectStage = dynamic(() => import("@/components/three/ObjectStage"), { ssr: false });

/** A cluster of monoliths in its own grid cell: it can never overlap the copy beside it. */
export default function DropStage() {
  return (
    <div aria-hidden className="pointer-events-none relative hidden min-h-[240px] md:col-span-5 md:block">
      <ObjectStage kind="cluster" tone="noir" className="absolute inset-0" />
    </div>
  );
}
