"use client";
import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { stripeTexture, type Kit } from "./kit";

type Props = {
  kit: Kit;
  at: [number, number, number];
  size: [number, number, number];
  rotY?: number;
};

/** Thin black slab with white load-line stripes on both wide faces (box material order: +x -x +y -y +z -z). */
export default function Slab({ kit, at, size, rotY = 0 }: Props) {
  const mats = useMemo(() => {
    const tex = stripeTexture();
    const side = new MeshStandardMaterial({ color: "#0b0b0b", roughness: 0.55 });
    const face = new MeshStandardMaterial({ map: tex, roughness: 0.5 });
    return { tex, side, face, list: [side, side, side, side, face, face] };
  }, []);
  useEffect(
    () => () => {
      mats.tex.dispose();
      mats.side.dispose();
      mats.face.dispose();
    },
    [mats],
  );
  const [w, h, d] = size;
  return (
    <group position={[at[0], at[1] + h / 2, at[2]]} rotation={[0, rotY, 0]} scale={[w, h, d]}>
      <mesh geometry={kit.box} material={mats.list} castShadow receiveShadow />
    </group>
  );
}
