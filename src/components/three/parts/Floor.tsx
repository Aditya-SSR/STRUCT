"use client";
import { useEffect, useMemo } from "react";
import { LineBasicMaterial } from "three";
import { ASH, INK, PAPER, gridGeometry, type Tone } from "./kit";

type Props = {
  tone?: Tone;
  /** half-extent of the hairline grid in world units (0 = none) */
  grid?: number;
  /** show cast shadows from the directional light on a transparent floor */
  catchShadow?: boolean;
};

/** Transparent floor: soft cast shadows + an optional hairline grid fading into the page colour. */
export default function Floor({ tone = "blanc", grid = 14, catchShadow = true }: Props) {
  const geo = useMemo(
    () => (grid > 0 ? gridGeometry(grid, 1, tone === "noir" ? INK : PAPER, tone === "noir" ? "#3a3a3a" : ASH) : null),
    [grid, tone],
  );
  const mat = useMemo(() => new LineBasicMaterial({ vertexColors: true }), []);
  useEffect(() => () => geo?.dispose(), [geo]);
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <group>
      {catchShadow ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow renderOrder={1}>
          <planeGeometry args={[60, 60]} />
          <shadowMaterial transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ) : null}
      {geo ? <lineSegments geometry={geo} material={mat} position={[0, 0.002, 0]} /> : null}
    </group>
  );
}
