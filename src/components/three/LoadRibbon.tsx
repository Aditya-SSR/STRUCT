"use client";
import { lazy } from "react";
import StageHost from "./parts/StageHost";
import Fallback from "./parts/Fallback";

const Scene = lazy(() => import("./LoadRibbonCanvas"));

/**
 * A twisted Möbius ribbon: black tape with a white load line down its centre, rim-lit for ink backgrounds.
 * Turns slowly; reacts to the pointer and to window scroll velocity. Fills its parent (`absolute inset-0`);
 * `className` replaces that positioning.
 */
export default function LoadRibbon({ className }: { className?: string }) {
  return <StageHost Scene={Scene} sceneProps={{}} className={className} fallback={<Fallback kind="loop" />} />;
}
