"use client";
import { lazy } from "react";
import StageHost from "./parts/StageHost";
import Fallback from "./parts/Fallback";
import type { ObjectKind } from "./ObjectStageCanvas";

const Scene = lazy(() => import("./ObjectStageCanvas"));

type Props = {
  kind: ObjectKind;
  /** noir = black body, white edges, rim-lit (for ink sections) · blanc = white body, black edges (for paper) */
  tone?: "noir" | "blanc";
  /** replaces the default "absolute inset-0" positioning */
  className?: string;
};

/** Small decorative 3D objects for other sections/pages. Procedural, lazy, paused off-screen. */
export default function ObjectStage({ kind, tone = "blanc", className }: Props) {
  const fb = kind === "ribbon" || kind === "ring" ? "loop" : kind === "dots" ? "dots" : "blocks";
  return <StageHost Scene={Scene} sceneProps={{ kind, tone }} className={className} fallback={<Fallback kind={fb} />} />;
}
