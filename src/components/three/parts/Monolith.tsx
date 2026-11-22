"use client";
import type { Kit } from "./kit";

type Props = {
  kit: Kit;
  /** footprint centre x/z, base height y0 */
  at: [number, number, number];
  /** width (x), height (y), depth (z) */
  size: [number, number, number];
  rotY?: number;
  /** contact-shadow blob under the block (only for blocks standing on the floor) */
  blob?: boolean;
  shadow?: boolean;
};

/** A matte block with crisp hairline edges. Geometry & materials come from the shared kit (scaled unit box). */
export default function Monolith({ kit, at, size, rotY = 0, blob = false, shadow = true }: Props) {
  const [x, y0, z] = at;
  const [w, h, d] = size;
  return (
    <group position={[x, y0, z]} rotation={[0, rotY, 0]}>
      <group position={[0, h / 2, 0]} scale={[w, h, d]}>
        <mesh geometry={kit.box} material={kit.body} castShadow={shadow} receiveShadow={shadow} />
        <lineSegments geometry={kit.edges} material={kit.edge} />
      </group>
      {blob ? (
        <mesh
          geometry={kit.plane}
          material={kit.blob}
          position={[0, 0.004, 0]}
          scale={[(w * 128) / 48 + 0.2, 1, (d * 128) / 48 + 0.2]}
          renderOrder={2}
        />
      ) : null}
    </group>
  );
}
