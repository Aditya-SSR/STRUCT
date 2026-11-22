"use client";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import Monolith from "./Monolith";
import Slab from "./Slab";
import { SIGNAL, type Kit } from "./kit";

type Block = { at: [number, number, number]; size: [number, number, number]; blob?: boolean };

/** Staggered stacked monoliths, after the studio set in the photographs. Units ≈ metres, floor at y = 0. */
const FULL: Block[] = [
  { at: [0, 0, 0], size: [3.2, 1.0, 2.2], blob: true }, // base block
  { at: [-0.7, 1.0, -0.1], size: [1.8, 1.6, 1.8] }, // stacked, set back
  { at: [-2.9, 0, -0.6], size: [1.2, 3.6, 1.2], blob: true }, // tall column
  { at: [2.3, 0, 0.5], size: [1.6, 1.6, 1.6], blob: true }, // cube
  { at: [2.5, 1.6, 0.4], size: [0.9, 0.9, 0.9] }, // cap cube
  { at: [1.1, 0, 1.9], size: [2.2, 0.4, 1.4], blob: true }, // low plinth, front
  { at: [0.4, 0, -1.9], size: [2.6, 2.2, 0.8], blob: true }, // back panel
];
const MINI: Block[] = [
  { at: [0, 0, 0], size: [2.2, 0.9, 1.6], blob: true },
  { at: [-0.4, 0.9, 0], size: [1.2, 1.2, 1.2] },
  { at: [-1.9, 0, -0.4], size: [0.8, 2.4, 0.8], blob: true },
  { at: [1.6, 0, 0.3], size: [1.1, 1.1, 1.1], blob: true },
];

type Props = {
  kit: Kit;
  mini?: boolean;
  /** omit the tallest back blocks & the plinth on small screens */
  simple?: boolean;
  slab?: boolean;
  datum?: boolean;
  reduced?: boolean;
  shadow?: boolean;
};

/** Hero / object cluster. Contents only — position & scale the parent group. */
export default function Cluster({ kit, mini = false, simple = false, slab = true, datum = true, reduced = false, shadow = true }: Props) {
  const list = mini ? MINI : simple ? FULL.filter((_, i) => i !== 5 && i !== 6) : FULL;
  const cube = useRef<Mesh>(null);
  const base = mini ? 2.85 : 4.0;
  const dx = mini ? -1.9 : -2.9;
  const dz = mini ? -0.4 : -0.6;

  useEffect(() => {
    if (cube.current) cube.current.position.y = base;
  }, [base]);
  useFrame((s) => {
    if (!cube.current || reduced) return;
    const t = s.clock.elapsedTime;
    cube.current.position.y = base + Math.sin(t * 0.9) * 0.08;
    cube.current.rotation.y = t * 0.4;
  });

  return (
    <group>
      {list.map((b, i) => (
        <Monolith key={i} kit={kit} at={b.at} size={b.size} blob={b.blob} shadow={shadow} />
      ))}
      {slab && !mini ? <Slab kit={kit} at={[4.7, 0, -0.9]} size={[1.5, 3.0, 0.16]} rotY={-0.38} /> : null}
      {datum ? (
        // the one signal-orange datum
        <mesh ref={cube} position={[dx, base, dz]} rotation={[0.5, 0.6, 0]}>
          <boxGeometry args={[0.17, 0.17, 0.17]} />
          <meshBasicMaterial color={SIGNAL} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}
