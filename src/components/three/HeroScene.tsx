"use client";
import { lazy } from "react";
import StageHost from "./parts/StageHost";
import Fallback from "./parts/Fallback";

const Scene = lazy(() => import("./HeroSceneCanvas"));

/**
 * Hero object: a staggered cluster of matte white monoliths with hairline black edges, one striped load-line slab and a
 * single signal-orange datum, on a transparent floor — composed to the right/centre of a paper page. Fills its parent.
 */
export default function HeroScene() {
  return <StageHost Scene={Scene} sceneProps={{}} fallback={<Fallback kind="blocks" />} />;
}
